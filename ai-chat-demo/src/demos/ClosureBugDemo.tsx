/**
 * ClosureBugDemo.tsx
 *
 * 两个并排的 SSE 客户端：
 *   左边：❌ 错误写法（直接读 useState，闭包陷阱）
 *   右边：✅ 正确写法（useReducer，天然无闭包问题）
 *
 * 用同一个 Mock Server，问同一个问题，结果截然不同。
 */

import { useRef, useState, useReducer } from 'react';
import styles from './ClosureBugDemo.module.css';

// ── 共用的 SSE 连接函数 ───────────────────────────────────────────

async function streamSSE(
  question: string,
  messageId: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  signal: AbortSignal,
) {
  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, messageId }),
    signal,
  });

  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const lines = frame.split('\n');
      let event = '', data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data = line.slice(5).trim();
      }
      if (event === 'message_text') {
        try { onChunk(JSON.parse(data).text ?? ''); } catch { /* ignore */ }
      }
      if (event === 'message_end') onDone();
    }
  }
}

// ── ❌ 错误写法：直接读 useState ─────────────────────────────────

function BuggyDemo() {
  const [text, setText] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 每次连接时闭包捕获的 text 是当前值（通常是 ''）
    setText('');
    setLog([]);
    setRunning(true);

    try {
      await streamSSE(
        '你好',
        `buggy-${Date.now()}`,
        (chunk) => {
          // ❌ 闭包陷阱：这里的 text 永远是连接建立时的快照
          // 每次进来都是 '' + chunk，后一条覆盖前一条
          setText(text + chunk);
          setLog((prev) => [...prev, `setText("${text}" + "${chunk}") → "${text + chunk}"`]);
        },
        () => setRunning(false),
        controller.signal,
      );
    } catch { /* abort */ }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.badge} data-type="bug">❌ 错误写法</span>
        <code className={styles.code}>setText(text + chunk)</code>
      </div>
      <p className={styles.desc}>
        直接读 <code>useState</code> 的值。<br />
        回调闭包捕获的是<strong>连接建立时刻</strong>的 text，<br />
        每条新 chunk 都从空字符串开始拼接，后一条覆盖前一条。
      </p>
      <button className={styles.btn} onClick={start} disabled={running}>
        {running ? '接收中...' : '▶ 开始'}
      </button>
      <div className={styles.result}>
        <div className={styles.resultLabel}>最终显示：</div>
        <div className={styles.resultText}>{text || <span className={styles.placeholder}>（点击开始）</span>}</div>
      </div>
      <div className={styles.logBox}>
        <div className={styles.logLabel}>每次 setText 的值：</div>
        {log.map((l, i) => <div key={i} className={styles.logItem}>{l}</div>)}
      </div>
    </div>
  );
}

// ── ✅ 正确写法：useReducer ───────────────────────────────────────

type TextAction = { type: 'APPEND'; chunk: string } | { type: 'RESET' };

function textReducer(state: string, action: TextAction): string {
  switch (action.type) {
    case 'APPEND': return state + action.chunk; // reducer 始终拿到最新 state
    case 'RESET': return '';
    default: return state;
  }
}

function CorrectDemo() {
  const [text, dispatch] = useReducer(textReducer, '');
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'RESET' });
    setLog([]);
    setRunning(true);

    try {
      await streamSSE(
        '你好',
        `correct-${Date.now()}`,
        (chunk) => {
          // ✅ dispatch 引用稳定，reducer 内部的 state 始终是最新值
          dispatch({ type: 'APPEND', chunk });
          setLog((prev) => [...prev, `dispatch(APPEND, "${chunk}")`]);
        },
        () => setRunning(false),
        controller.signal,
      );
    } catch { /* abort */ }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.badge} data-type="ok">✅ 正确写法</span>
        <code className={styles.code}>dispatch({'{ type: "APPEND", chunk }'})</code>
      </div>
      <p className={styles.desc}>
        用 <code>useReducer</code>。<br />
        <code>dispatch</code> 的引用永远稳定，<br />
        reducer 每次都拿到<strong>最新的 state</strong>，正常累积文本。
      </p>
      <button className={styles.btn} onClick={start} disabled={running}>
        {running ? '接收中...' : '▶ 开始'}
      </button>
      <div className={styles.result}>
        <div className={styles.resultLabel}>最终显示：</div>
        <div className={styles.resultText}>{text || <span className={styles.placeholder}>（点击开始）</span>}</div>
      </div>
      <div className={styles.logBox}>
        <div className={styles.logLabel}>每次 dispatch 的 chunk：</div>
        {log.map((l, i) => <div key={i} className={styles.logItem}>{l}</div>)}
      </div>
    </div>
  );
}

// ── 页面入口 ──────────────────────────────────────────────────────

export default function ClosureBugDemo() {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>SSE 闭包问题对比</h2>
      <p className={styles.subtitle}>
        同一个 Mock Server，同一个问题，左右两边同时点击"开始"，观察结果差异。
      </p>
      <div className={styles.grid}>
        <BuggyDemo />
        <CorrectDemo />
      </div>
    </div>
  );
}
