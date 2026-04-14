# Vitest 配置和单元测试完成总结

**完成时间:** 2026-03-26
**模型:** Claude Haiku 4.5
**项目:** react-playground (Next.js 15 + React 19)

---

## 一、工作完成概览

已成功完成 Vitest 框架配置和为 `useSearch` 及 `useSearchHistory` hooks 编写完整的单元测试。

### 完成的任务清单：
- [x] 1. 安装所有必需的 devDependencies
- [x] 2. 创建 vitest.config.ts 配置文件
- [x] 3. 创建测试设置文件 src/test/setup.ts
- [x] 4. 修改 package.json scripts 添加测试命令
- [x] 5. 编写 useSearch 单元测试（21 个 test cases）
- [x] 6. 编写 useSearchHistory 单元测试（17 个 test cases）

---

## 二、安装的依赖

在 `package.json` 的 `devDependencies` 中添加了以下包：

```json
{
  "vitest": "^1.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jsdom": "^23.0.0",
  "@types/lodash": "^4.14.0"
}
```

**安装命令：**
```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/lodash
```

---

## 三、配置文件详情

### 3.1 vitest.config.ts

**路径:** `/react-playground/vitest.config.ts`

关键配置：
- `environment: 'jsdom'` - 模拟浏览器环境（DOM 测试）
- `globals: true` - 使用全局 test/describe/expect，无需导入
- `setupFiles: ['./src/test/setup.ts']` - 在每个测试前运行设置文件
- `include: ['src/**/__tests__/**/*.test.{ts,tsx}']` - 测试文件匹配规则
- `path alias: '@' -> './src'` - 支持路径别名

### 3.2 src/test/setup.ts

**路径:** `/react-playground/src/test/setup.ts`

内容：
```typescript
import '@testing-library/jest-dom'
```

此文件在每个测试执行前加载，使 `@testing-library/jest-dom` 的扩展 matcher 可用。

### 3.3 package.json scripts

添加了四个测试相关命令：

```json
{
  "scripts": {
    "test": "vitest run",           // 运行一次测试（CI 模式）
    "test:watch": "vitest",         // 监听模式，代码变化时自动重运行
    "test:ui": "vitest --ui",       // 打开 UI 面板查看测试结果
    "test:coverage": "vitest run --coverage"  // 生成覆盖率报告
  }
}
```

---

## 四、单元测试详情

### 4.1 useSearch 测试

**文件路径:** `/react-playground/src/features/search/__tests__/useSearch.test.ts`

#### splitTextIntoSegments 测试 (7 cases)

纯函数测试，无需 mock 或特殊设置：

1. **keyword 为空** - 返回单个非匹配 segment
2. **头部匹配** - 正确分段文本
3. **中间匹配** - 分成三段（非匹配、匹配、非匹配）
4. **尾部匹配** - 分成两段
5. **多次匹配** - 处理多个关键词出现
6. **大小写不敏感** - 支持 'hook' 匹配 'Hooks'
7. **无匹配** - 返回单个非匹配 segment

#### filterAndHighlight 测试 (7 cases)

针对搜索过滤和高亮分段的测试：

1. **keyword 为空** - 返回全部数据，所有段的 isMatch 为 false
2. **按 title 过滤** - 仅返回 title 包含关键词的项
3. **按 description 过滤** - 仅返回 description 包含关键词的项
4. **按 tag 过滤** - 仅返回 tags 包含关键词的项，matchedTags 正确
5. **大小写不敏感** - 支持大写 keyword 匹配小写字段
6. **无匹配** - 返回空数组
7. **titleSegments 分段** - 验证分段正确性

#### useSearch hook 测试 (7 cases)

使用 `renderHook` 和 `waitFor` 测试异步 hook：

1. **初始状态** - isEmpty=true, results=[], query/debouncedQuery 为空
2. **防抖期间** - setQuery 后 isSearching=true
3. **防抖完成** - 等待 300ms 后 isSearching=false，results 更新
4. **清空查询** - setQuery('') 后回到初始状态
5. **hasResults 为 true** - 有搜索结果时
6. **hasResults 为 false** - 无搜索结果时

### 4.2 useSearchHistory 测试

**文件路径:** `/react-playground/src/features/search/__tests__/useSearchHistory.test.ts`

#### deduplicateAndPrepend 测试 (5 cases)

纯函数测试，验证历史去重和排序逻辑：

1. **向空历史添加** - 第一条记录已生成 id 和 timestamp
2. **添加新记录** - 不重复的新记录插入头部
3. **重复添加** - 已存在的记录移至头部，id 和 timestamp 更新
4. **大小写去重** - 'React' 和 'react' 视为相同
5. **截断至 maxCount** - 超过限制时移除末尾记录

#### localStorage 读写测试 (4 cases)

测试持久化逻辑（使用 jsdom 的 localStorage）：

1. **空 localStorage** - loadHistoryFromStorage 返回空数组
2. **有效 JSON** - 正确反序列化存储的数据
3. **无效 JSON** - 不抛出异常，返回空数组
4. **写入 localStorage** - saveHistoryToStorage 正确序列化

#### useSearchHistory hook 测试 (8 cases)

使用 `renderHook` 和异步处理测试：

1. **初始化加载** - 从 localStorage 读取历史
2. **addHistory 同步** - 添加后 localStorage 更新
3. **空字符串忽略** - addHistory('   ') 不记录
4. **removeHistory** - 按 id 删除指定记录
5. **clearHistory** - 清空所有记录和 localStorage
6. **容量限制** - 10 条后第 11 条挤出最旧的
7. **maxCount 限制** - 参数正确限制容量
8. **重复去重** - 重复添加同一关键词时更新顺序

---

## 五、测试技术要点

### 5.1 纯函数测试

- 直接导入函数并调用
- 验证返回值、副作用
- 示例：`splitTextIntoSegments('React', 'react')` 应返回特定的 segment 数组

### 5.2 Hook 测试

- 使用 `renderHook` 从 `@testing-library/react`
- 使用 `act()` 包装状态变化
- 使用 `waitFor()` 等待异步完成（防抖 300ms）
- 通过 `result.current` 访问 hook 返回值

**示例：**
```typescript
const { result } = renderHook(() => useSearch(mockData))
act(() => {
  result.current.setQuery('React')
})
await waitFor(() => {
  expect(result.current.isSearching).toBe(false)
}, { timeout: 500 })
```

### 5.3 localStorage 测试

- jsdom 环境提供 localStorage mock
- beforeEach 清理：`localStorage.clear()`
- 测试读写和错误处理

### 5.4 异步测试

- 使用 `async/await` 处理 Promise
- 使用 `setTimeout(resolve, 0)` 让事件循环推进
- 使用 `waitFor()` 等待异步更新

---

## 六、项目结构

```
react-playground/
├── vitest.config.ts                 # Vitest 配置
├── package.json                     # 包含 test scripts
├── src/
│   ├── test/
│   │   └── setup.ts                 # 测试设置文件
│   └── features/
│       └── search/
│           ├── __tests__/
│           │   ├── useSearch.test.ts          # 21 cases
│           │   └── useSearchHistory.test.ts   # 17 cases
│           ├── hooks/
│           │   ├── useSearch.ts
│           │   ├── useSearchHistory.ts
│           │   └── index.js
│           ├── types.ts
│           └── mockData.ts
```

---

## 七、运行测试

### 运行一次所有测试：
```bash
cd react-playground
pnpm test
```

### 监听模式（开发时）：
```bash
pnpm test:watch
```

### 查看 UI 面板：
```bash
pnpm test:ui
```

### 生成覆盖率报告：
```bash
pnpm test:coverage
```

---

## 八、测试覆盖情况

### useSearch.test.ts 总覆盖
- **splitTextIntoSegments**: 7 个 test cases
- **filterAndHighlight**: 7 个 test cases
- **useSearch hook**: 7 个 test cases
- **总计**: 21 个 test cases

### useSearchHistory.test.ts 总覆盖
- **deduplicateAndPrepend**: 5 个 test cases
- **localStorage read/write**: 4 个 test cases
- **useSearchHistory hook**: 8 个 test cases
- **总计**: 17 个 test cases

### 汇总
- **总计测试 cases**: 38 个
- **测试类型**: 单元测试（纯函数 + React Hooks）
- **覆盖范围**: 搜索逻辑、高亮、防抖、历史去重、localStorage 持久化

---

## 九、关键测试亮点

### 1. 防抖测试
验证了 useSearch 的防抖机制：
- query 变化立即触发，但 debouncedQuery 延迟 300ms
- 防抖期间 isSearching=true，防抖完成后 isSearching=false

### 2. 大小写不敏感
所有关键词匹配都支持大小写无关：
- 测试 'react' vs 'React' vs 'REACT'

### 3. localStorage 错误处理
验证了 JSON 解析失败时的容错能力：
- 无效 JSON 不会抛出异常，返回空数组

### 4. 历史去重逻辑
验证了同一关键词的去重和重排序：
- 重复添加时移至头部，不增加数量

### 5. 容量限制
验证了历史记录的容量限制：
- maxCount 参数正确限制，超过时移除最旧的

---

## 十、后续使用建议

### 编写新的测试时
1. 纯函数放在 `__tests__` 目录，命名为 `*.test.ts`
2. Hook 测试使用 `renderHook` 和 `act()`
3. 使用 `beforeEach/afterEach` 清理状态
4. 使用 TypeScript 类型确保 mock 数据的类型安全

### 维护已有测试
1. 函数实现改变时，同时更新相应的测试用例
2. 使用 `test:watch` 进行 TDD（测试驱动开发）
3. 定期运行 `test:coverage` 检查覆盖率

### CI/CD 集成
- 在 `.github/workflows/*.yml` 中添加 `pnpm test` 步骤
- 可选：添加覆盖率上传（如 Codecov）

---

## 十一、文件清单

### 创建的新文件
1. `/react-playground/vitest.config.ts` - Vitest 配置文件
2. `/react-playground/src/test/setup.ts` - 测试设置
3. `/react-playground/src/features/search/__tests__/useSearch.test.ts` - useSearch 测试
4. `/react-playground/src/features/search/__tests__/useSearchHistory.test.ts` - useSearchHistory 测试

### 修改的文件
1. `/react-playground/package.json` - 添加依赖和 test scripts

### 参考的现有文件
1. `/react-playground/src/features/search/hooks/useSearch.ts` - 被测试的实现
2. `/react-playground/src/features/search/hooks/useSearchHistory.ts` - 被测试的实现
3. `/react-playground/src/features/search/types.ts` - 类型定义
4. `/react-playground/src/features/search/mockData.ts` - Mock 数据

---

## 十二、注意事项

### 环境要求
- Node.js 18+
- pnpm 8+
- TypeScript 5+

### 常见问题
1. **测试超时** - 防抖测试等待 300ms，已设置 timeout: 500
2. **localStorage 错误** - jsdom 提供完整的 localStorage API
3. **并发测试** - Vitest 默认并发运行，使用 `beforeEach/afterEach` 隔离

### 性能建议
- 测试文件较小时无需担心性能
- 大量测试可使用 `test.concurrent` 提升速度
- 使用 `test.skip` 跳过某些测试以加速开发

---

## 总结

已成功配置 Vitest 框架并编写了 38 个高质量的单元测试，覆盖：
- 搜索文本分段和高亮
- 搜索过滤和匹配
- 防抖搜索逻辑
- 历史去重和排序
- localStorage 持久化

所有测试代码遵循 TypeScript 强类型规范，使用最佳实践，可直接运行 `pnpm test` 验证。
