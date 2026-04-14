const express = require('express');
const cors = require('cors');
const { getScenario } = require('./scenarios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * 辅助：向 SSE 连接写一个事件帧
 */
function writeSSEEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
}

/**
 * 辅助：带 delay 的 sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * POST /api/chat
 * 接收 { question, messageId } 返回 SSE 流
 */
app.post('/api/chat', async (req, res) => {
  const { question = '', messageId = `msg-${Date.now()}` } = req.body;

  // ── SSE 响应头 ──
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁止 nginx 缓冲
  res.flushHeaders();

  const { events, name } = getScenario(messageId, question);
  console.log(`[SSE] 场景: ${name} | messageId: ${messageId} | question: "${question}"`);

  // 客户端断开时清理
  let aborted = false;
  req.on('close', () => {
    aborted = true;
    console.log(`[SSE] 客户端断开 | messageId: ${messageId}`);
  });

  // 按顺序推送事件帧
  for (const ev of events) {
    if (aborted) break;

    await sleep(ev.delay || 0);

    if (aborted) break;

    writeSSEEvent(res, ev.event, ev.data);
    console.log(`  → event: ${ev.event}`);

    // 模拟断线：发完当前帧后强制关闭连接
    if (ev.closeAfter) {
      console.log(`[SSE] 模拟断线，关闭连接 | messageId: ${messageId}`);
      res.end();
      return;
    }
  }

  if (!aborted) {
    res.end();
  }
});

/**
 * GET /api/flight-detail
 * 模拟 fetchAIChatDetailQuery，返回机票推荐数据
 */
app.get('/api/flight-detail', (req, res) => {
  res.json({
    flights: [
      {
        id: 'flight-001',
        airline: '国航',
        airlineCode: 'CA',
        flightNo: 'CA1234',
        departTime: '07:00',
        arriveTime: '09:10',
        duration: '2h10m',
        departAirport: '北京首都 T3',
        arriveAirport: '上海虹桥 T2',
        price: 680,
        currency: 'CNY',
        cabin: '经济舱',
        ticketLeft: '仅剩 3 张',
        tags: [{ text: '准点率 92%', color: '#1ba462' }],
        isRecommend: true,
      },
      {
        id: 'flight-002',
        airline: '东航',
        airlineCode: 'MU',
        flightNo: 'MU5678',
        departTime: '09:30',
        arriveTime: '11:45',
        duration: '2h15m',
        departAirport: '北京首都 T2',
        arriveAirport: '上海浦东 T1',
        price: 590,
        currency: 'CNY',
        cabin: '经济舱',
        ticketLeft: '',
        tags: [{ text: '低价', color: '#fa7d00' }],
        isRecommend: false,
      },
      {
        id: 'flight-003',
        airline: '南航',
        airlineCode: 'CZ',
        flightNo: 'CZ9012',
        departTime: '14:00',
        arriveTime: '16:20',
        duration: '2h20m',
        departAirport: '北京大兴',
        arriveAirport: '上海虹桥 T1',
        price: 750,
        currency: 'CNY',
        cabin: '经济舱',
        ticketLeft: '',
        tags: [],
        isRecommend: false,
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Mock SSE Server 启动成功`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   接口：POST /api/chat`);
  console.log(`   接口：GET  /api/flight-detail`);
  console.log(`\n   场景触发关键词：`);
  console.log(`     "机票" / "航班" → 机票推荐场景`);
  console.log(`     "断线" / "断网" → 中途断线场景`);
  console.log(`     其他             → 纯文本场景\n`);
});
