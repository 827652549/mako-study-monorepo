# speckit-sdd-demo

用于学习 **Spec-Driven Development（规格驱动开发）** 的实践项目，基于 [GitHub Spec Kit](https://github.com/github/spec-kit)。

## 技术栈

- 运行时：[Bun](https://bun.com) v1.3+
- 前端：React 19
- SDD 工具：[speckit](https://speckit.org)（`specify` CLI）

## 快速开始

```bash
bun install
bun run index.ts
```

## SDD 工作流

在 Claude Code 中按顺序使用以下 skill：

| 命令 | 说明 |
|------|------|
| `/speckit-constitution` | 确立项目原则（首次运行） |
| `/speckit-specify` | 描述功能需求，生成 spec |
| `/speckit-clarify` | 消除歧义（可选） |
| `/speckit-plan` | 生成实现计划 |
| `/speckit-checklist` | 生成验收清单（可选） |
| `/speckit-tasks` | 拆分可执行任务 |
| `/speckit-implement` | 执行实现 |

所有 spec 存放于 `specs/` 目录。

---

## 我的使用总结

### 什么是 SDD（Spec-Driven Development）

先写规格再写代码。规格描述「用户需要什么、为什么需要」，不涉及「怎么实现」。每个功能经过 spec → plan → tasks → implement 四个阶段，每个阶段产出文档，形成可追溯的开发链路。

### speckit 解决什么问题

它把「跟 AI 协作开发」这件事结构化了。没有 speckit，你可能会把需求、设计、任务全混在一个 prompt 里扔给 AI；有了 speckit，每个阶段都有固定的输入输出格式，AI 不会跑偏，你也知道每一步在干什么。

### speckit vs openspec

- **openspec**：spec 已经写好了，解决怎么归档、版本化、团队共享的问题
- **speckit**：spec 还没有，解决怎么用 AI 协助写 spec、然后按 spec 实现的问题

### 实践感受

整个流程走下来最大的感受是：**spec 本身比代码更难写**。把「带清除按钮的输入框」翻译成用户故事、验收场景、功能需求，需要真正想清楚用户行为和边界。这个思考过程本身就是价值，跟用不用 AI 无关。
