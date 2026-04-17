# speckit-sdd-demo 项目宪法

## 核心原则

### 一、规格先行（NON-NEGOTIABLE）
每个功能必须先写 spec，再写代码。spec 描述「用户需要什么」和「为什么需要」，不涉及「怎么实现」。未经 spec 的功能不进入开发。

### 二、简单优先
从最小可用实现出发，不为假设性的未来需求过度设计。三行相似代码优于一个过早的抽象。复杂度必须有 spec 依据。

### 三、技术栈约束
- 运行时：Bun（不用 Node.js）
- 前端：React 19 + Bun HTML import（不用 Vite）
- 测试：`bun test`（不用 Jest/Vitest）
- 样式：Tailwind CSS

### 四、测试驱动
每个 spec 中的 scenario 都要有对应测试覆盖。测试先写，实现后补。

### 五、中文优先
所有 spec、plan、tasks、注释、commit message 优先使用中文。代码标识符（变量名、函数名）使用英文。

## 技术约束

- Node.js 版本：不适用（使用 Bun ≥ 1.3）
- TypeScript 严格模式开启
- 不引入未在 spec 中提及的第三方库

## 开发流程

按 SDD 流程推进：`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`

每次 implement 完成后运行 `bun run build` 确认构建通过。

## 治理

本宪法优先级高于所有其他约定。修改宪法需在 constitution.md 中记录修改原因和日期。

**版本**：1.0.0 | **制定日期**：2026-04-16 | **最后修订**：2026-04-16
