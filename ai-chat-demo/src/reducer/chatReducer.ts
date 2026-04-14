/**
 * chatReducer.ts
 *
 * 用 useReducer 管理消息列表状态，彻底解决 SSE 回调里的闭包问题。
 *
 * 核心原理：dispatch 的引用是稳定的（不受 render 影响），
 * reducer 函数每次都能拿到最新的 state，不存在闭包陷阱。
 *
 * 对应 corp-bizComp-ai 里的 4 种 SSE 事件：
 *   message_begin → BEGIN
 *   message_text  → APPEND_TEXT
 *   message_type  → SET_RECOMMEND
 *   message_end   → END
 */

export interface FlightItem {
  id: string;
  airline: string;
  airlineCode: string;
  flightNo: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  departAirport: string;
  arriveAirport: string;
  price: number;
  currency: string;
  cabin: string;
  ticketLeft: string;
  tags: { text: string; color: string }[];
  isRecommend: boolean;
}

export interface MessageItem {
  messageId: string;
  chatId?: string;
  userText: string;       // 用户发送的内容
  aiText: string;         // AI 流式回复的文本（累积）
  flights?: FlightItem[]; // 机票推荐数据（message_type=recommend 后填入）
  isDone: boolean;        // message_end 收到后为 true
  isError: boolean;       // 出错时为 true
}

export type ChatState = {
  messages: MessageItem[];
};

// ── Action 类型定义 ──────────────────────────────────────────────

export type ChatAction =
  | {
      // message_begin：新建一条消息记录（用户问题 + 占位的 AI 回复）
      type: 'BEGIN';
      payload: { messageId: string; chatId: string; userText: string };
    }
  | {
      // message_text：追加 AI 流式文本片段
      type: 'APPEND_TEXT';
      payload: { messageId: string; text: string };
    }
  | {
      // message_type = recommend：填入机票数据
      type: 'SET_RECOMMEND';
      payload: { messageId: string; flights: FlightItem[] };
    }
  | {
      // message_end：标记本条消息完成
      type: 'END';
      payload: { messageId: string };
    }
  | {
      // 出错 / 断线超过最大重试：标记错误，移除当前未完成消息
      type: 'ERROR';
      payload: { messageId: string };
    };

// ── Reducer ───────────────────────────────────────────────────────

export const initialState: ChatState = { messages: [] };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'BEGIN': {
      const { messageId, chatId, userText } = action.payload;
      const newMsg: MessageItem = {
        messageId,
        chatId,
        userText,
        aiText: '',
        isDone: false,
        isError: false,
      };
      return { messages: [...state.messages, newMsg] };
    }

    case 'APPEND_TEXT': {
      const { messageId, text } = action.payload;
      return {
        messages: state.messages.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, aiText: msg.aiText + text }
            : msg,
        ),
      };
    }

    case 'SET_RECOMMEND': {
      const { messageId, flights } = action.payload;
      return {
        messages: state.messages.map((msg) =>
          msg.messageId === messageId ? { ...msg, flights } : msg,
        ),
      };
    }

    case 'END': {
      const { messageId } = action.payload;
      return {
        messages: state.messages.map((msg) =>
          msg.messageId === messageId ? { ...msg, isDone: true } : msg,
        ),
      };
    }

    case 'ERROR': {
      const { messageId } = action.payload;
      // 移除这条未完成的消息（和真实项目一样），或者标记为 error 留着
      return {
        messages: state.messages.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, isDone: true, isError: true }
            : msg,
        ),
      };
    }

    default:
      return state;
  }
}
