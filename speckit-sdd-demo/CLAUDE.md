---
description: 使用 Bun 替代 Node.js、npm、pnpm 或 vite。
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

## 运行时规范

默认使用 Bun，不使用 Node.js。

- 用 `bun <file>` 替代 `node <file>` 或 `ts-node <file>`
- 用 `bun test` 替代 `jest` 或 `vitest`
- 用 `bun build <file.html|file.ts|file.css>` 替代 `webpack` 或 `esbuild`
- 用 `bun install` 替代 `npm install` / `yarn install` / `pnpm install`
- 用 `bun run <script>` 替代 `npm run <script>`
- Bun 自动加载 `.env`，不需要 dotenv

## 内置 API 规范

- 服务器用 `Bun.serve()`，不用 `express`（支持 WebSocket、HTTPS、路由）
- SQLite 用 `bun:sqlite`，不用 `better-sqlite3`
- Redis 用 `Bun.redis`，不用 `ioredis`
- PostgreSQL 用 `Bun.sql`，不用 `pg` 或 `postgres.js`
- WebSocket 直接用内置，不用 `ws`
- 文件读写用 `Bun.file`，不用 `node:fs` 的 readFile/writeFile
- Shell 命令用 `Bun.$\`ls\``，不用 `execa`

## 测试规范

用 `bun test` 运行测试。

```ts
import { test, expect } from "bun:test";

test("示例测试", () => {
  expect(1).toBe(1);
});
```

## 前端规范

用 `Bun.serve()` 的 HTML import，不用 vite。支持 React、CSS、Tailwind。

```ts
import index from "./index.html";

Bun.serve({
  routes: { "/": index },
  development: { hmr: true, console: true },
});
```

HTML 文件可以直接 import `.tsx`/`.jsx`/`.js`，Bun 自动打包。

## SDD 工作流

本项目使用 Spec-Driven Development（规格驱动开发），按如下顺序推进：

1. `/speckit-constitution` — 确立项目原则
2. `/speckit-specify` — 描述功能，生成 spec
3. `/speckit-clarify`（可选）— 消除歧义
4. `/speckit-plan` — 生成实现计划
5. `/speckit-checklist`（可选）— 生成验收清单
6. `/speckit-tasks` — 拆分可执行任务
7. `/speckit-implement` — 执行实现

所有 spec 文件位于 `specs/` 目录，constitution 位于 `.specify/memory/constitution.md`。
