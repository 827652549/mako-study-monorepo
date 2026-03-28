# claude code case demo

背景: 我想学学Claude Code的多Agent特性,给我些checklist让我试着完成
以下是AI回答:

好，基于官方文档和社区实践，给你整理一份循序渐进的 Checklist。多 Agent 分两个层次：Subagents（单 session 内委派）和 Agent Teams（多 session 协作），建议按顺序走。

🧠 概念摸底（先建心智模型）
理解"单 session"的上下文窗口瓶颈：为什么大任务需要多 Agent
区分两种模式的本质差异：
Subagents = 同一 session 内，主 Agent 委派子任务，子 Agent 汇报回来
Agent Teams = 多个独立 Claude Code 实例，各自有上下文窗口，通过 inbox 通信
理解什么时候不该用多 Agent：顺序依赖任务、同文件编辑、简单单一功能
🔧 Level 1：Subagents 实践
在一个真实项目里，用 Task tool 委派一个读取研究任务（只读，无副作用）
尝试并行模式：同时分析前端/后端两个模块，观察 token 消耗
尝试顺序模式：先 research 再 implement，理解数据流依赖
尝试后台（background）模式：run_in_background: true，主线程继续工作
在 CLAUDE.md 里写 Domain 路由规则，教会主 Agent 何时该并行委派：
markdown
## Multi-Agent Routing
When task spans independent domains, spawn parallel agents:
- Frontend agent: React components, UI state
- Backend agent: API routes, business logic
  故意写一个过度并行的任务，体验 coordination overhead
  🚀 Level 2：Agent Teams 实践
  确认 Claude Code 版本 ≥ v2.1.32（claude --version）
  在 settings.json 启用实验特性：
  json
  { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": true }
  创建第一个 Agent Team：一个 Team Lead + 两个 Teammate
  实践竞争假设调试场景：让 2 个 Teammate 分别调查同一个 bug 的不同根因，互相反驳
  直接与某个 Teammate 对话（绕过 Lead），体验与 Subagents 的区别
  检查 inbox 文件（~/.claude/teams/<name>/inboxes/），理解通信机制
  完成后手动 shutdown 所有 Teammate，避免资源泄漏
  🌲 Level 3：Git Worktrees 手动并行
  用 git worktree add 创建两个并行工作目录
  在两个 worktree 各跑一个 Claude Code session，实现真正的分支隔离并行
  对比 Agent Teams 和手动 Worktrees 的体验差异，总结适用场景
  📐 Level 4：架构设计能力
  给一个真实的中型需求（比如：给某个页面加完整的搜索功能），设计出 Agent 分工方案并执行
  写一个 Agent 分工复盘文档：哪些任务值得并行？哪些造成了冲突？
  阅读并理解 Shipyard 的 multi-agent 对比文章，了解 Gas Town / Multiclaude 等社区方案
  ⚠️ 注意事项（踩坑前先看）
  Agent Teams 目前已知在 session 恢复、任务协调和关闭行为上存在一些限制，是实验性功能。
  Shipyard

多 Agent 会非常快地消耗 usage 配额，务必在测试前有心理准备。
Shipyard

一个决策提醒：用 10-10-10 看这件事——10分钟后你会觉得折腾 Agent Teams 很烧脑；10个月后熟练运用多 Agent 拆解大任务会成为你的核心竞争力；10年后"能否驾驭 AI 协作系统"很可能是 P7 工程师的标配能力。这是典型的双向门 + 非对称上行，值得认真投入。