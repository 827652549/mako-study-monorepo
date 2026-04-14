/**
 * SSE Mock 场景数据
 * 每个场景是一个 events 数组，每个 event 包含：
 *   - event: SSE 事件名
 *   - data: SSE 数据（字符串）
 *   - delay: 推送前等待的毫秒数
 *   - closeAfter: 推送后是否关闭连接（模拟断线）
 */

const CHAT_ID = 'mock-chat-001';

// 场景一：纯文本回复（正常完整流程）
const scenarioText = (messageId, question) => [
  {
    event: 'message_begin',
    data: JSON.stringify({ chatId: CHAT_ID, messageId, question }),
    delay: 300,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '好的，' }),
    delay: 400,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '我来帮你' }),
    delay: 300,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '解答这个问题。' }),
    delay: 300,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '\n\nSSE（Server-Sent Events）是一种服务端向客户端单向推送数据的技术，' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '基于 HTTP 长连接，天然支持断线重连。' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '\n\n它与 WebSocket 的核心区别是：SSE 是单向的（服务端→客户端），' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '而 WebSocket 是双向全双工。' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '\n\nAI Chat 场景用 SSE 完全够用，因为只需要服务端流式推送回复内容。' }),
    delay: 200,
  },
  {
    event: 'message_end',
    data: JSON.stringify({ success: 'true' }),
    delay: 300,
  },
];

// 场景二：机票推荐（触发 message_type = recommend）
const scenarioFlight = (messageId, question) => [
  {
    event: 'message_begin',
    data: JSON.stringify({ chatId: CHAT_ID, messageId, question }),
    delay: 300,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '好的，为您查询' }),
    delay: 400,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '北京→上海' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '明天的航班，' }),
    delay: 200,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '以下是为您推荐的优质选项：' }),
    delay: 300,
  },
  {
    // 触发机票卡片渲染
    event: 'message_type',
    data: JSON.stringify({ messageType: 'recommend' }),
    delay: 500,
  },
  {
    event: 'message_end',
    data: JSON.stringify({ success: 'true' }),
    delay: 200,
  },
];

// 场景三：中途断线（在推送几条 text 后关闭连接，不发 message_end）
const scenarioDisconnect = (messageId, question) => [
  {
    event: 'message_begin',
    data: JSON.stringify({ chatId: CHAT_ID, messageId, question }),
    delay: 300,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '好的，正在为您处理...' }),
    delay: 400,
  },
  {
    event: 'message_text',
    data: JSON.stringify({ text: '\n\n数据加载中' }),
    delay: 500,
  },
  {
    // closeAfter: true 表示发完这条就关闭连接，模拟断线
    event: 'message_text',
    data: JSON.stringify({ text: '，请稍候……' }),
    delay: 600,
    closeAfter: true,
  },
];

/**
 * 根据 question 内容自动选择场景
 */
const getScenario = (messageId, question = '') => {
  const q = question.toLowerCase();
  if (q.includes('机票') || q.includes('航班') || q.includes('flight')) {
    return { events: scenarioFlight(messageId, question), name: 'flight' };
  }
  if (q.includes('断线') || q.includes('断网') || q.includes('disconnect')) {
    return { events: scenarioDisconnect(messageId, question), name: 'disconnect' };
  }
  return { events: scenarioText(messageId, question), name: 'text' };
};

module.exports = { getScenario };
