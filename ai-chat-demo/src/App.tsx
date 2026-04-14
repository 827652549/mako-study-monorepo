import { useState } from 'react';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ClosureBugDemo from './demos/ClosureBugDemo';
import './App.css';

type Tab = 'chat' | 'closure';

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🤖 AI Chat Demo</div>
        <nav className="nav">
          <button
            className={`navBtn ${tab === 'chat' ? 'active' : ''}`}
            onClick={() => setTab('chat')}
          >
            Chat（SSE + 断线重连）
          </button>
          <button
            className={`navBtn ${tab === 'closure' ? 'active' : ''}`}
            onClick={() => setTab('closure')}
          >
            闭包问题对比
          </button>
        </nav>
        <div className="serverTip">
          需先启动：<code>node server/index.js</code>
        </div>
      </header>

      <main className="main">
        {tab === 'chat' && (
          <div className="chatLayout">
            <div className="chatPanel">
              <ChatWindow />
            </div>
            <div className="sidePanel">
              <h3 className="sideTitle">场景触发关键词</h3>
              <div className="scenarioList">
                <div className="scenario">
                  <span className="scenarioTag">纯文本</span>
                  <span>你好 / 介绍一下 SSE / 其他</span>
                </div>
                <div className="scenario">
                  <span className="scenarioTag flight">机票推荐</span>
                  <span>找机票 / 航班 / 北京到上海</span>
                </div>
                <div className="scenario">
                  <span className="scenarioTag disconnect">断线测试</span>
                  <span>断线 / 断网 / disconnect</span>
                </div>
              </div>
              <h3 className="sideTitle" style={{ marginTop: 20 }}>重连状态机</h3>
              <div className="stateMachine">
                <div className="stateItem">IDLE → 等待输入</div>
                <div className="stateArrow">↓ 发送消息</div>
                <div className="stateItem">CONNECTING → AI 思考中</div>
                <div className="stateArrow">↓ 收到 begin</div>
                <div className="stateItem">STREAMING → 流式输出</div>
                <div className="stateArrow">↓ 连接中断</div>
                <div className="stateItem warn">RECONNECTING → 指数退避重连</div>
                <div className="stateArrow">↓ 超过 3 次</div>
                <div className="stateItem error">ERROR → 展示错误</div>
              </div>
            </div>
          </div>
        )}
        {tab === 'closure' && <ClosureBugDemo />}
      </main>
    </div>
  );
}
