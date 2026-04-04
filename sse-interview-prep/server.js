/**
 * SSE 练习服务端 —— 纯 Node.js 内置模块，无需 npm install
 *
 * 启动：node server.js
 * 默认端口：3099
 *
 * 提供的接口：
 *   GET  /sse/stream     → 原生 EventSource 连接（练习1用）
 *   POST /sse/chat       → fetch+SSE（练习2、3用），模拟 AI 流式返回
 */

const http = require('http');

const PORT = 3099;

// 模拟 AI 逐字流式返回的文本
const FAKE_AI_RESPONSE = [
  { event: 'message_begin', data: JSON.stringify({ chatId: 'chat-001', messageId: 'msg-001', question: '推荐一下北京到上海的航班' }) },
  { event: 'message_text', data: JSON.stringify({ text: '好的，' }) },
  { event: 'message_text', data: JSON.stringify({ text: '为您推荐' }) },
  { event: 'message_text', data: JSON.stringify({ text: '以下航班：' }) },
  { event: 'message_text', data: JSON.stringify({ text: '\n\n**CA1234**' }) },
  { event: 'message_text', data: JSON.stringify({ text: ' 北京→上海' }) },
  { event: 'message_text', data: JSON.stringify({ text: ' 08:00出发' }) },
  { event: 'message_text', data: JSON.stringify({ text: '，票价¥580' }) },
  { event: 'message_text', data: JSON.stringify({ text: '\n\n**MU5678**' }) },
  { event: 'message_text', data: JSON.stringify({ text: ' 北京→上海' }) },
  { event: 'message_text', data: JSON.stringify({ text: ' 10:30出发' }) },
  { event: 'message_text', data: JSON.stringify({ text: '，票价¥620' }) },
  { event: 'message_type', data: JSON.stringify({ messageType: 'recommend' }) },
  { event: 'message_end', data: JSON.stringify({ success: 'true' }) },
];

/**
 * 向 res 写入一个 SSE 帧
 * SSE 格式：每个字段一行，字段之间空行分隔
 *   event: <事件名>\n
 *   data: <数据>\n
 *   \n
 */
function writeSseFrame(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n`);
  res.write('\n'); // 空行 = 帧结束
}

/**
 * 核心 SSE handler：逐帧发送，每帧间隔 300ms 模拟流式
 */
function streamResponse(res) {
  // SSE 必须的响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',   // 关键！告诉浏览器这是 SSE
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',    // 开发环境跨域
  });

  let i = 0;
  const timer = setInterval(() => {
    if (i >= FAKE_AI_RESPONSE.length) {
      clearInterval(timer);
      res.end();
      return;
    }
    const { event, data } = FAKE_AI_RESPONSE[i++];
    writeSseFrame(res, event, data);
  }, 300);

  // 客户端断开时清理
  res.on('close', () => clearInterval(timer));
}

const server = http.createServer((req, res) => {
  // 处理预检请求（CORS）
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // GET /sse/stream —— 给原生 EventSource 用
  if (req.method === 'GET' && req.url === '/sse/stream') {
    console.log('[SSE] GET /sse/stream connected');
    streamResponse(res);
    return;
  }

  // POST /sse/chat —— 给 fetch+SSE 用
  if (req.method === 'POST' && req.url === '/sse/chat') {
    console.log('[SSE] POST /sse/chat connected');
    // 读取 body（这里只是消费掉，不做实际处理）
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('[SSE] body:', body);
      streamResponse(res);
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n✅ SSE 练习服务已启动：http://localhost:${PORT}`);
  console.log('   GET  http://localhost:${PORT}/sse/stream  (练习1)');
  console.log('   POST http://localhost:${PORT}/sse/chat   (练习2、3)\n');
});
