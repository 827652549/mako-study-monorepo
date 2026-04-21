# Node.js Stream 与 SSE 的完整流程讲解

## 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         浏览器 (客户端)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ EventSource('http://localhost:3001/api/chat')          │   │
│  │  → onmessage (event === 'message_text')                │   │
│  │  → 打字机效果实时显示                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↑                                   │
│                           SSE 流                                 │
│                         (HTTP keep-alive)                        │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Express Server      │
                    │  (Node.js)           │
                    │ POST /api/chat       │
                    │                      │
                    │  while (reading) {   │
                    │    writeSSEEvent()   │
                    │  }                   │
                    └──────────┬──────────┘
                               │
                            Stream
                               │
                    ┌──────────▼──────────┐
                    │  Ollama API          │
                    │  /api/generate       │
                    │  (NDJSON 流)         │
                    │                      │
                    │ { response: '...' }  │
                    │ { response: '...' }  │
                    │ { response: '...', done: true }
                    └──────────────────────┘
```

## 关键概念

### 1. **NDJSON（Newline-Delimited JSON）**

Ollama API 返回的格式：每行一个完整的 JSON 对象，以 `\n` 分隔。

```
{"response":"你","done":false}
{"response":"好","done":false}
{"response":"！","done":true}
```

### 2. **Node.js Stream（流）**

`http.ClientRequest` 的 response 是一个可读流（Readable Stream）：

```javascript
const ollamaStream = await callOllamaStream(question);
// ollamaStream 是一个 IncomingMessage，实现了 ReadableStream 接口

ollamaStream.on('data', (chunk) => {
  // chunk 是 Buffer，数据可能分割，需要自己缓冲和拼接
});
```

**Stream 的好处**：
- 内存高效（不用一次性加载整个响应体）
- 可以实时处理数据（来一个处理一个）
- 天然适配长连接场景

### 3. **SSE（Server-Sent Events）**

HTTP 标准的单向推送协议，本质上是一个特殊的 HTTP 长连接：

```
客户端 GET /stream
  ↓
服务端 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
  ↓
服务端 不关闭连接，持续写事件帧
  ↓
event: message_text
data: {"text":"内容"}

event: message_end
data: {"success":"true"}
```

每个事件帧的格式：
```
event: <事件名>
data: <JSON 数据>
<空行>
```

## 代码流程走通

### 步骤 1: 接收客户端请求

```javascript
app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.flushHeaders();  // 立即发送头，让客户端建立连接
```

此时浏览器的 `EventSource` 已经能接收到 headers，建立了长连接。

### 步骤 2: 调用 Ollama API（建立向下游的 Stream）

```javascript
const ollamaStream = await callOllamaStream(question);
// 返回 http.IncomingMessage，是一个 Readable Stream
```

现在有两条流：
- **Upstream**: 来自 Ollama 的流
- **Downstream**: 到浏览器的 SSE 流

### 步骤 3: 处理数据管道

```javascript
ollamaStream.on('data', (chunk) => {
  // chunk 是 Buffer，但 NDJSON 可能分割
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';  // 保留未完成的一行
  
  for (const line of lines) {
    const data = JSON.parse(line);  // 每行都是完整 JSON
    
    // 从 ollama 的格式转换到 SSE 事件
    writeSSEEvent(res, 'message_text', JSON.stringify({
      text: data.response,
    }));
    
    if (data.done) {
      writeSSEEvent(res, 'message_end', JSON.stringify({
        success: 'true',
      }));
      res.end();  // 关闭 SSE 连接
    }
  }
});
```

这里的关键是：**转换协议**
- 输入: Ollama 的 NDJSON（`{ response, done }`）
- 输出: SSE 事件帧（`event: ...\ndata: ...\n\n`）

## 为什么这么设计？

### Ollama 为什么用 NDJSON？
- **紧凑**: 每行一个对象，行结束符是清晰的分隔
- **流式友好**: 可以逐行解析，不用等待整个响应体
- **与 stream-json 友好**: 可以用 StreamValues 逐对象处理

### 我们为什么用 SSE？
- **浏览器原生支持**: `new EventSource()` 就能接收
- **自动断线重连**: EventSource 内置重连机制
- **简单可靠**: HTTP 长连接，不用 WebSocket 的复杂性
- **单向推送足够**: Chat 场景服务端推就够了

### 为什么不直接转发 NDJSON？
```javascript
// 错误做法：直接转发 NDJSON
ollamaStream.pipe(res);  // ❌ 浏览器不认识 NDJSON
```

需要**协议转换**：把 NDJSON 转成 SSE 事件帧，浏览器的 EventSource 才能识别。

## stream-json 的替代方案

如果用 `stream-json` 库来解析，会是这样：

```javascript
import { parser } from 'stream-json';
import { streamValues } from 'stream-json/streamers/StreamValues';

ollamaStream
  .pipe(parser())
  .pipe(streamValues())
  .on('data', ({ value }) => {
    // value 已经是解析好的 JS 对象
    const { response, done } = value;
    writeSSEEvent(res, 'message_text', JSON.stringify({ text: response }));
    if (done) res.end();
  });
```

**优点**:
- 不用自己手动缓冲和拼接
- 对复杂 JSON 结构更鲁棒
- 有 SAX-like 事件驱动的能力

**缺点**:
- NDJSON 的简单情况下有点过度设计
- 多一层 pipe 的性能开销（虽然很小）
- 依赖多一个包

**建议**:
- NDJSON 场景 → 现在的手动解析已经够了
- 大型 JSON 或复杂结构 → 用 stream-json
- 想学 stream 概念 → 两种都试试

## 断线重连流程

浏览器的 `EventSource` 内置了断线重连：

```javascript
const eventSource = new EventSource('/api/chat?id=123');

eventSource.addEventListener('message_text', (e) => {
  // 接收数据
});

// 如果连接断开，EventSource 会自动在 3s、6s、... 后重连
```

但我们前端的 `useSSEConnection` 也实现了自己的重连机制（`statusRef.current`），以便更精细地控制：
- 指数退避延迟（1s → 2s → 4s）
- 最多重连 3 次后放弃
- UI 显示重连状态

## 性能优化思路

1. **背压处理**: 如果 ollama 生成很快，浏览器接收很慢，应该用 `stream.pause()` 暂停上游
   ```javascript
   if (!res.write(data)) {
     ollamaStream.pause();
   }
   res.on('drain', () => ollamaStream.resume());
   ```

2. **缓冲策略**: NDJSON 通常每行小，但可以攒几行一起发，减少 write 次数

3. **超时控制**: Ollama 生成超过 N 秒没有输出，应该断开重连

4. **压缩**: 可以在 SSE 前加 gzip 压缩中间件（Express middleware）

目前的实现已经够简洁了，这些优化在 scale up 时再加。
