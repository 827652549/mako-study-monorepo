/**
 * useSSEConnection.ts
 *
 * 负责 SSE 连接生命周期管理 + 断线重连状态机。
 *
 * 修复说明：
 * 1. 用 statusRef 代替 status 闭包 —— useCallback 的 deps 不含 status，
 *    直接读 status 永远是初始值 'idle'，导致流异常结束时无法触发重连。
 * 2. 用户消息在 sendMessage 里立即 dispatch，不等 message_begin。
 * 3. 增加 isConnectingRef 防止并发双发。
 * 4. 组件卸载时自动 abort，避免内存泄漏。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatAction, FlightItem } from '../reducer/chatReducer';

export type SSEStatus = 'idle' | 'connecting' | 'streaming' | 'reconnecting' | 'error';

const EventType = {
  MessageBegin: 'message_begin',
  MessageText: 'message_text',
  MessageType: 'message_type',
  MessageEnd: 'message_end',
} as const;

const RECONNECT = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 15000,
  backoffFactor: 2,
};

const getRetryDelay = (attempt: number): number => {
  const base = RECONNECT.baseDelay * Math.pow(RECONNECT.backoffFactor, attempt);
  const jitter = Math.random() * 500;
  return Math.min(base + jitter, RECONNECT.maxDelay);
};

interface UseSSEConnectionProps {
  onDispatch: (action: ChatAction) => void;
}

export interface UseSSEConnectionReturn {
  status: SSEStatus;
  retryCount: number;
  sendMessage: (question: string) => void;
  abort: () => void;
}

export function useSSEConnection({ onDispatch }: UseSSEConnectionProps): UseSSEConnectionReturn {
  const [status, setStatus] = useState<SSEStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  // ── 关键：用 ref 同步镜像 status，在异步闭包里读 ref 永远是最新值 ──
  const statusRef = useRef<SSEStatus>('idle');
  const setStatusSync = (s: SSEStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isConnectingRef = useRef(false); // 防止并发双发

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // 组件卸载时自动 abort
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearRetryTimer();
    };
  }, [clearRetryTimer]);

  const abort = useCallback(() => {
    clearRetryTimer();
    abortRef.current?.abort();
    abortRef.current = null;
    isConnectingRef.current = false;
    setStatusSync('idle');
    setRetryCount(0);
    retryCountRef.current = 0;
  }, [clearRetryTimer]);

  const connect = useCallback(
    async (question: string, messageId: string, isRetry: boolean) => {
      // 终止上一个连接（如有）
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      console.log(`[SSE] 发起连接 | isRetry=${isRetry} | messageId=${messageId}`);

      try {
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, messageId }),
          signal: controller.signal,
        });

        console.log(`[SSE] 连接建立 | status=${response.status}`);

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedEnd = false; // 是否收到 message_end

        const parseChunk = (chunk: string) => {
          buffer += chunk;
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            if (!frame.trim()) continue;
            const lines = frame.split('\n');
            let event = '';
            let data = '';
            for (const line of lines) {
              if (line.startsWith('event:')) event = line.slice(6).trim();
              if (line.startsWith('data:')) data = line.slice(5).trim();
            }
            if (event && data) {
              handleEvent(event, data);
            }
          }
        };

        const handleEvent = (event: string, rawData: string) => {
          const data = safeJsonParse(rawData);
          if (!data) {
            console.warn('[SSE] JSON 解析失败:', rawData);
            return;
          }

          console.log(`[SSE] 收到事件: ${event}`, data);

          switch (event) {
            case EventType.MessageBegin:
              // 用户消息已在 sendMessage 里 dispatch，这里只更新 chatId
              setStatusSync('streaming');
              retryCountRef.current = 0;
              setRetryCount(0);
              break;

            case EventType.MessageText:
              onDispatch({
                type: 'APPEND_TEXT',
                payload: { messageId, text: String(data.text ?? '') },
              });
              break;

            case EventType.MessageType:
              if (data.messageType === 'recommend') {
                fetchFlightDetail(messageId, onDispatch);
              }
              break;

            case EventType.MessageEnd:
              receivedEnd = true;
              if (data.success === 'true') {
                onDispatch({ type: 'END', payload: { messageId } });
                setStatusSync('idle');
                isConnectingRef.current = false;
                retryCountRef.current = 0;
                setRetryCount(0);
              } else {
                onDispatch({ type: 'ERROR', payload: { messageId } });
                setStatusSync('error');
                isConnectingRef.current = false;
              }
              break;
          }
        };

        // 循环读取流
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parseChunk(decoder.decode(value, { stream: true }));
        }

        console.log(`[SSE] 流结束 | receivedEnd=${receivedEnd} | currentStatus=${statusRef.current}`);

        // ✅ 用 statusRef.current 而非 status（闭包），确保读到最新值
        if (!receivedEnd && statusRef.current !== 'error') {
          throw new Error('stream_closed_without_end');
        }

      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[SSE] 连接被主动终止');
          return;
        }
        console.warn(`[SSE] 连接异常 (attempt ${retryCountRef.current + 1}):`, err);
        scheduleReconnect(question, messageId);
      }
    },
    [onDispatch],
  );

  const scheduleReconnect = useCallback(
    (question: string, messageId: string) => {
      if (retryCountRef.current >= RECONNECT.maxRetries) {
        console.error('[SSE] 超过最大重试次数');
        onDispatch({ type: 'ERROR', payload: { messageId } });
        setStatusSync('error');
        isConnectingRef.current = false;
        return;
      }

      const attempt = retryCountRef.current;
      retryCountRef.current += 1;
      setRetryCount(retryCountRef.current);
      setStatusSync('reconnecting');

      const delay = getRetryDelay(attempt);
      console.log(`[SSE] ${delay.toFixed(0)}ms 后重连 (${retryCountRef.current}/${RECONNECT.maxRetries})`);

      retryTimerRef.current = setTimeout(() => {
        connect(question, messageId, true);
      }, delay);
    },
    [connect, onDispatch],
  );

  const sendMessage = useCallback(
    (question: string) => {
      if (isConnectingRef.current) {
        console.warn('[SSE] 已有连接进行中，忽略重复发送');
        return;
      }
      if (statusRef.current !== 'idle' && statusRef.current !== 'error') {
        console.warn('[SSE] 当前状态不允许发送:', statusRef.current);
        return;
      }

      clearRetryTimer();
      retryCountRef.current = 0;
      setRetryCount(0);
      isConnectingRef.current = true;

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // ✅ 立即 dispatch 用户消息，不等 message_begin
      // 这样用户气泡马上出现，体验更好
      onDispatch({
        type: 'BEGIN',
        payload: { messageId, chatId: '', userText: question },
      });

      setStatusSync('connecting');

      connect(question, messageId, false);
    },
    [onDispatch, connect, clearRetryTimer],
  );

  return { status, retryCount, sendMessage, abort };
}

// ── 工具函数 ─────────────────────────────────────────────────────

async function fetchFlightDetail(messageId: string, onDispatch: (action: ChatAction) => void) {
  try {
    const res = await fetch('http://localhost:3001/api/flight-detail');
    const data = await res.json() as { flights: FlightItem[] };
    onDispatch({
      type: 'SET_RECOMMEND',
      payload: { messageId, flights: data.flights },
    });
  } catch (err) {
    console.error('[SSE] fetchFlightDetail 失败:', err);
  }
}

function safeJsonParse<T = Record<string, unknown>>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
