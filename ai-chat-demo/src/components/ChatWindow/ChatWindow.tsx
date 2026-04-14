/**
 * ChatWindow.tsx
 *
 * 主 Chat UI：
 *   - 消息列表（用户气泡 + AI 流式文字 + FlightCard）
 *   - 重连状态 Banner
 *   - 底部输入框
 */

import { useEffect, useRef, useState } from 'react';
import { useAIChat } from '../../hooks/useAIChat';
import type { SSEStatus } from '../../hooks/useSSEConnection';
import FlightCard from '../FlightCard/FlightCard';
import styles from './ChatWindow.module.css';

// ── 重连状态 Banner ──────────────────────────────────────────────

function ReconnectBanner({ status, retryCount }: { status: SSEStatus; retryCount: number }) {
  if (status === 'reconnecting') {
    return (
      <div className={`${styles.banner} ${styles.bannerWarn}`}>
        <span className={styles.spinner} />
        网络波动，正在重连 ({retryCount}/{3})…
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className={`${styles.banner} ${styles.bannerError}`}>
        ⚠️ 网络异常，连接失败，请重新发送消息
      </div>
    );
  }
  return null;
}

// ── 打字机光标（流式未完成时闪烁）──────────────────────────────

function Cursor({ visible }: { visible: boolean }) {
  return visible ? <span className={styles.cursor}>|</span> : null;
}

// ── 主组件 ────────────────────────────────────────────────────────

export default function ChatWindow() {
  const { messages, status, retryCount, sendMessage } = useAIChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 每次消息更新时自动滚到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    if (status !== 'idle' && status !== 'error') return;
    setInput('');
    sendMessage(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isStreaming = status === 'connecting' || status === 'streaming';

  return (
    <div className={styles.root}>
      {/* 消息列表 */}
      <div className={styles.messageList}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🤖</div>
            <div className={styles.emptyText}>你好！我是 AI 助手</div>
            <div className={styles.emptyHint}>
              试试输入：<code>你好</code> / <code>找机票</code> / <code>断线测试</code>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.messageId} className={styles.messageGroup}>
            {/* 用户消息 */}
            <div className={styles.userBubble}>
              <div className={styles.userText}>{msg.userText}</div>
              <div className={styles.avatar}>你</div>
            </div>

            {/* AI 回复 */}
            <div className={styles.aiBubble}>
              <div className={styles.aiAvatar}>AI</div>
              <div className={styles.aiContent}>
                {/* 错误状态 */}
                {msg.isError && (
                  <div className={styles.errorText}>⚠️ 回复失败，请重试</div>
                )}

                {/* 流式文字 */}
                {msg.aiText && (
                  <div className={styles.aiText}>
                    {msg.aiText}
                    <Cursor visible={!msg.isDone && !msg.isError} />
                  </div>
                )}

                {/* 正在连接中（还没有文字）*/}
                {!msg.aiText && !msg.isError && !msg.isDone && (
                  <div className={styles.thinkingDots}>
                    <span /><span /><span />
                  </div>
                )}

                {/* FlightCard（message_type = recommend 触发后）*/}
                {msg.flights && msg.flights.length > 0 && (
                  <div className={styles.flightList}>
                    {msg.flights.map((flight, i) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        isRecommend={i === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* 重连 Banner */}
      <ReconnectBanner status={status} retryCount={retryCount} />

      {/* 输入区 */}
      <div className={styles.inputArea}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming ? 'AI 回复中...' :
            status === 'reconnecting' ? '重连中，请稍候...' :
            '输入消息，Enter 发送（Shift+Enter 换行）'
          }
          disabled={isStreaming || status === 'reconnecting'}
          rows={2}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={isStreaming || status === 'reconnecting' || !input.trim()}
        >
          {isStreaming ? <span className={styles.spinner} /> : '发送'}
        </button>
      </div>
    </div>
  );
}
