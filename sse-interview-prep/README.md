# SSE 面试准备 · 1小时 Checklist

> 目标：能聊清楚项目里 SSE 的设计，以及你负责的 FlightList 模块如何对接。

---

## ⚡ 启动服务（先做这一步）

```bash
cd sse-interview-prep
node server.js
# → http://localhost:3099 启动成功
```

---

## ✅ 任务清单

### 任务1 · 原生 EventSource（10 min）

打开 `01-native-eventsource.html`，点击「连接 SSE」看效果。

**需要能回答的问题：**
- EventSource 和 WebSocket 有什么区别？
- 为什么项目里没有直接用原生 EventSource？

**参考答案：**
> EventSource 是单向的（服务端→客户端），WebSocket 是全双工。EventSource 只支持 GET 请求，无法携带 body，所以项目里用 `fetch + ReadableStream` 自己实现 SSE 协议解析，从而支持 POST body（携带 question、chatId 等参数）。

---

### 任务2 · fetch + SSE（15 min）

打开 `02-fetch-sse.html`，点击「发送消息」看效果。

**重点理解 `parseSseFrame` 函数**——SSE 的帧格式：
```
event: message_text\n
data: {"text":"好的，"}\n
\n              ← 空行 = 一帧结束
```

**需要能回答的问题：**
- ReadableStream 是什么？
- 为什么需要 `buffer` 来拼接 chunks？

**参考答案：**
> ReadableStream 是 Fetch API 中 response.body 的类型，代表一个可读字节流。网络传输中，一个"逻辑帧"可能被拆成多个 TCP 包（chunk）到达，也可能多帧在一个 chunk 里。`buffer` 负责把不完整的帧暂存，等待下一个 chunk 补全后再解析。

---

### 任务3 · 打字机效果（10 min）

打开 `03-typewriter.html`，分别点「方案A」和「方案B」对比。

**重点**：方案A 是项目实际用的，因为 SSE 服务端已经控制了推送节奏（每帧300ms）。

**对应项目代码（useAIChat.tsx 第183-190行）：**
```ts
// message_text 帧：追加拼接（不是替换！）
text: item.aiMessage?.text
  ? item.aiMessage.text + data?.text
  : data?.text
```

---

### 任务4 · stale closure（15 min）— 最重要

打开 `04-stale-closure.html`，三列 demo 对比点击运行。

**先观察**：❌ 版本为什么只有1条消息？

**需要能用自己的话解释：**
> React state 每次 render 是快照。onmessage 回调在 sendMessage() 调用时创建，闭包捕获的 messageList 是那一刻的快照（空数组）。之后 state 更新了，但回调里的引用没有变，每次 `setMessages([...messages, frame])` 都是在空数组上追加，最终只剩最后一帧。

**项目解法（useLatestState）：**
> 用 `useRef` 维护一个永远指向最新值的引用。异步回调里读 `ref.current`（最新值），写用 `setState`（触发渲染）。这样无论何时进入回调，读到的都是当前最新的 messageList。

**还需要知道另一个解法（函数式更新）：**
```ts
setMessages(prev => [...prev, newItem])
// prev 由 React 注入，永远是最新值，不受闭包影响
// 缺点：无法在 setState 外部读取最新值
```

---

### 任务5 · 你的工作量（5 min）

你负责的是 `FlightList` 模块，面试时可以这样说：

**我做了什么：**
> 负责 FlightList 组件，从 AI 的 `message_type` 事件触发后，调用 `fetchAIChatDetailQuery` 拿到推荐数据，再并发调用机票搜索接口（`searchV2` + `searchFlightComfortable`），把响应数据通过 `responseDTO` 适配成 FlightCard 所需的 props，最终渲染航班卡片列表。

**技术亮点（Cache-Aside 模式）：**
> `useInitFlightData` 先从 IndexDB 查缓存（key = `flt-{messageId}-{segIndex}`），命中则直接渲染，未命中才走网络请求并写入缓存。这避免了用户来回切换消息时重复请求相同数据。

**「查看更多」预请求优化：**
> 在构建跳转 URL 时，同时发了一个预请求（`_sendPreSearch`），提前把列表页需要的数据缓存好，用户点击跳转时体感更快。

---

## 📌 面试中可以主动提的亮点

1. **为什么用 fetch 而不是原生 EventSource** → POST body 需求
2. **stale closure 问题及 useLatestState 解法** → 体现对 React 闭包机制的理解
3. **message_type 的异步副请求竞态** → SSE 流与 HTTP 请求的完成时序不确定
4. **IndexDB + 两级时效缓存设计** → 30分钟活跃/7天过期，active/stale 分层展示
5. **FlightList 的 Cache-Aside 模式** → 这是你自己的工作量，最能展开说

---

## 🎯 自测问题

- [ ] 用一句话解释 SSE 和 WebSocket 的区别
- [ ] 为什么 `fetchEventSource` 要用 POST 而不是 GET？
- [ ] SSE 帧的格式是什么？`\n\n` 的作用？
- [ ] 什么是 stale closure？在这个项目里它怎么出现的？
- [ ] `useLatestState` 解决了什么问题，原理是什么？
- [ ] 你负责的 FlightList 里，Cache-Aside 是怎么实现的？
