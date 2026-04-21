const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const { parser } = require('stream-json');
const { streamValues } = require('stream-json/streamers/StreamValues');
const { streamArray } = require('stream-json/streamers/StreamArray');

const app = express();
const PORT = 3001;
const OLLAMA_BASE_URL = 'http://localhost:11434';
const MODEL = 'deepseek-r1:1.5b';

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
 * 调用 ollama 流式生成
 * 返回 NDJSON 流：{ response: '文本', done: false/true }
 */
async function callOllamaStream(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: true,
      temperature: 0.7,
    });

    const req = http.request(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => resolve(res)
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * POST /api/chat
 * 接收 { question, messageId } 返回 SSE 流（来自 ollama）
 */
app.post('/api/chat', async (req, res) => {
  const { question = '', messageId = `msg-${Date.now()}` } = req.body;

  // ── SSE 响应头 ──
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  console.log(`[SSE] 发起 ollama 请求 | messageId: ${messageId} | question: "${question}"`);

  // 监听客户端断开
  let aborted = false;
  res.on('close', () => {
    aborted = true;
    console.log(`[SSE] 客户端断开 | messageId: ${messageId}`);
  });

  try {
    // 发送 message_begin
    writeSSEEvent(res, 'message_begin', JSON.stringify({
      chatId: 'ollama-chat',
      messageId,
      question,
    }));

    // 调用 ollama 流式生成
    const ollamaStream = await callOllamaStream(question);

    let textAccumulated = '';

    // 用 stream-json 处理 NDJSON 流：
    //   ollamaStream (Buffer)
    //     → parser()      把 Buffer 解析成 JSON token 事件
    //     → streamValues() 把 token 事件组装成完整 JS 对象，逐个 emit 'data'
    // jsonStreaming: true 让 parser 支持连续多个 JSON 对象（即 NDJSON 格式）
    const jsonStream = ollamaStream
      .pipe(parser({ jsonStreaming: true }))
      .pipe(streamValues());

    jsonStream.on('data', ({ value }) => {
      // value 是每条 ollama NDJSON 行解析后的 JS 对象
      if (aborted) return;

      if (value.response) {
        writeSSEEvent(res, 'message_text', JSON.stringify({ text: value.response }));
        textAccumulated += value.response;
        console.log(`  → text fragment: "${value.response}"`);
      }

      if (value.done) {
        console.log(`[SSE] ollama 生成完毕 | totalChars: ${textAccumulated.length}`);
        writeSSEEvent(res, 'message_end', JSON.stringify({ success: 'true' }));
        res.end();
      }
    });

    jsonStream.on('error', (err) => {
      console.error('[SSE] stream-json 解析错误:', err.message);
      if (!aborted) {
        writeSSEEvent(res, 'message_end', JSON.stringify({
          success: 'false',
          errorMessage: err.message,
        }));
        res.end();
      }
    });

    jsonStream.on('end', () => {
      if (!aborted && !res.writableEnded) {
        console.log('[SSE] ollama 流意外结束');
        writeSSEEvent(res, 'message_end', JSON.stringify({
          success: 'false',
          errorMessage: 'Stream ended unexpectedly',
        }));
        res.end();
      }
    });
  } catch (err) {
    console.error('[SSE] 错误:', err.message);
    if (!aborted) {
      writeSSEEvent(res, 'message_end', JSON.stringify({
        success: 'false',
        errorMessage: err.message,
      }));
      res.end();
    }
  }
});

/**
 * GET /api/stream-demo
 * 用 stream-json 读取 data/article.json（字符数组），
 * 通过 DelayTransform 限速，把每个字符转成 SSE message_text 事件。
 *
 * Pipeline:
 *   fs.createReadStream  →  parser()  →  streamArray()  →  DelayTransform  →  SSE
 *   (Buffer)               (JSON token)  (JS 对象)         (限速)             (文本帧)
 */
app.get('/api/stream-demo', (req, res) => {
  const messageId = `mock-${Date.now()}`;
  const delayMs = Number(req.query.delay) || 40; // 每个字符的延迟，默认 40ms

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let aborted = false;
  res.on('close', () => { aborted = true; });

  writeSSEEvent(res, 'message_begin', JSON.stringify({
    chatId: 'stream-demo',
    messageId,
    question: 'stream-json demo',
  }));

  // DelayTransform：objectMode，每收到一个值就等 delayMs 毫秒再往下传
  // 这是 Transform 流的典型用法：在管道中间插入任意变换逻辑
  const delay = new Transform({
    objectMode: true,
    transform({ value }, _enc, callback) {
      if (aborted) return callback();
      setTimeout(() => {
        this.push(value); // value 是字符串（单个字符）
        callback();
      }, delayMs);
    },
  });

  const articlePath = path.join(__dirname, 'data/article.json');

  // Pipeline:
  //   fs.createReadStream  不把整个文件读进内存，按 chunk 推给 parser
  //   parser()             把字节流解析成 JSON token（startArray / stringValue / endArray...）
  //   streamArray()        把 token 重新组装成数组元素，逐个 emit { key, value }
  //   delay                限速 Transform
  fs.createReadStream(articlePath)
    .pipe(parser())
    .pipe(streamArray())
    .pipe(delay);

  delay.on('data', (char) => {
    if (aborted) return;
    writeSSEEvent(res, 'message_text', JSON.stringify({ text: char }));
  });

  delay.on('end', () => {
    if (!aborted) {
      writeSSEEvent(res, 'message_end', JSON.stringify({ success: 'true' }));
      res.end();
    }
  });

  delay.on('error', (err) => {
    console.error('[stream-demo] error:', err.message);
    if (!aborted) {
      writeSSEEvent(res, 'message_end', JSON.stringify({ success: 'false', errorMessage: err.message }));
      res.end();
    }
  });
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
  console.log(`\n✅ Ollama SSE Server 启动成功`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   ollama: ${OLLAMA_BASE_URL}/api/generate`);
  console.log(`   model: ${MODEL}`);
  console.log(`\n   接口：POST /api/chat (实时 ollama 流式生成)\n`);
});
