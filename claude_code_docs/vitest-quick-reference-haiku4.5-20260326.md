# Vitest 快速参考指南

**项目:** react-playground
**完成时间:** 2026-03-26

## 快速开始

### 1. 安装依赖（如果未安装）
```bash
cd react-playground
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/lodash
```

### 2. 运行测试
```bash
# 运行一次所有测试
pnpm test

# 监听模式（开发时）
pnpm test:watch

# UI 面板
pnpm test:ui

# 覆盖率报告
pnpm test:coverage
```

## 文件位置

| 文件 | 用途 |
|-----|------|
| `vitest.config.ts` | 配置文件 |
| `src/test/setup.ts` | 测试设置（jest-dom matchers） |
| `src/features/search/__tests__/useSearch.test.ts` | useSearch 和纯函数测试 |
| `src/features/search/__tests__/useSearchHistory.test.ts` | useSearchHistory 测试 |

## 测试统计

| 测试文件 | Cases | 涵盖 |
|--------|-------|------|
| useSearch.test.ts | 21 | splitTextIntoSegments(7) + filterAndHighlight(7) + useSearch(7) |
| useSearchHistory.test.ts | 17 | deduplicateAndPrepend(5) + localStorage(4) + useSearchHistory(8) |
| **总计** | **38** | 搜索逻辑、高亮、防抖、历史管理 |

## 核心测试模式

### 纯函数测试
```typescript
import { splitTextIntoSegments } from '../hooks/useSearch'

it('应该在 keyword 为空时返回单个非匹配 segment', () => {
  const result = splitTextIntoSegments('text', '')
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({ text: 'text', isMatch: false })
})
```

### Hook 测试
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearch } from '../hooks/useSearch'

it('防抖结束后 results 更新', async () => {
  const { result } = renderHook(() => useSearch(mockData))

  act(() => {
    result.current.setQuery('React')
  })

  await waitFor(() => {
    expect(result.current.isSearching).toBe(false)
  }, { timeout: 500 })

  expect(result.current.results.length).toBeGreaterThan(0)
})
```

### localStorage 测试
```typescript
import { loadHistoryFromStorage, saveHistoryToStorage } from '../hooks/useSearchHistory'

beforeEach(() => {
  localStorage.clear()
})

it('saveHistoryToStorage 将数据写入 localStorage', () => {
  const data = [{ id: '1', keyword: 'React', createdAt: 1000 }]
  saveHistoryToStorage(data)

  const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
  expect(JSON.parse(stored!)).toEqual(data)
})
```

## 关键 API

### describe & it
```typescript
describe('功能名称', () => {
  it('测试用例描述', () => {
    // 测试代码
  })
})
```

### 常用 matcher
```typescript
expect(value).toBe(expected)                    // 完全相等
expect(array).toHaveLength(3)                   // 数组长度
expect(result).toEqual([...])                   // 深度比较
expect(result.every(x => x.valid)).toBe(true)  // 条件判断
expect(() => fn()).not.toThrow()               // 异常检查
expect(result).toBeGreaterThan(0)               // 大小比较
```

### Hook 测试 API
```typescript
renderHook(() => useSearch(data))  // 创建 hook
act(() => { ... })                 // 包装状态变化
waitFor(() => { ... })             // 等待异步完成
result.current                      // 访问 hook 返回值
```

### 生命周期钩子
```typescript
beforeEach(() => { ... })  // 每个测试前执行
afterEach(() => { ... })   // 每个测试后执行
beforeAll(() => { ... })   // 所有测试前执行一次
afterAll(() => { ... })    // 所有测试后执行一次
```

## 常见测试场景

### 场景 1：测试防抖
```typescript
act(() => {
  hook.current.setQuery('keyword')
})
expect(hook.current.isSearching).toBe(true)  // 防抖期间

await waitFor(() => {
  expect(hook.current.isSearching).toBe(false)
}, { timeout: 500 })
expect(hook.current.debouncedQuery).toBe('keyword')
```

### 场景 2：测试 localStorage
```typescript
localStorage.setItem(key, JSON.stringify(data))
const result = loadHistoryFromStorage()
expect(result).toEqual(data)
```

### 场景 3：测试异步状态更新
```typescript
act(() => {
  hook.current.addHistory('React')
})

await new Promise(resolve => setTimeout(resolve, 0))

expect(hook.current.history).toHaveLength(1)
```

### 场景 4：测试边界情况
```typescript
// 空字符串
it('应该忽略空字符串', () => {
  hook.current.addHistory('   ')
  expect(hook.current.history).toHaveLength(0)
})

// 大小写不敏感
it('应该支持大小写不敏感', () => {
  const result = splitTextIntoSegments('React', 'react')
  expect(result[0].isMatch).toBe(true)
})

// 错误处理
it('应该处理无效 JSON', () => {
  localStorage.setItem(key, 'invalid{')
  expect(() => loadHistoryFromStorage()).not.toThrow()
})
```

## 最佳实践

1. **使用 beforeEach/afterEach 隔离测试**
   ```typescript
   beforeEach(() => {
     localStorage.clear()
   })
   ```

2. **使用 act() 包装所有状态变化**
   ```typescript
   act(() => {
     result.current.setQuery('value')
   })
   ```

3. **等待异步操作完成**
   ```typescript
   await waitFor(() => {
     expect(condition).toBe(true)
   })
   ```

4. **测试一个行为，而不是实现细节**
   ```typescript
   // 好
   expect(result.query).toBe('React')

   // 不好
   expect(setQueryRef.current).toBeDefined()
   ```

5. **使用描述性的测试名称**
   ```typescript
   // 好
   it('应该在防抖结束后更新搜索结果')

   // 不好
   it('test result')
   ```

## 调试技巧

### 打印调试信息
```typescript
it('test something', () => {
  const { result } = renderHook(() => useSearch(data))

  console.log('query:', result.current.query)
  console.log('isSearching:', result.current.isSearching)
})
```

### 跳过某个测试
```typescript
it.skip('需要调试的测试', () => {
  // 代码
})
```

### 只运行某个测试
```typescript
it.only('只运行这个测试', () => {
  // 代码
})
```

### 运行单个文件
```bash
pnpm test useSearch.test.ts
```

### 运行匹配的测试
```bash
pnpm test -t "应该在防抖"
```

## 配置说明

### vitest.config.ts 关键配置

```typescript
{
  environment: 'jsdom',                  // 浏览器环境
  globals: true,                         // 全局 API（无需导入）
  setupFiles: ['./src/test/setup.ts'],  // 测试前运行
  include: ['src/**/__tests__/**/*.test.{ts,tsx}'],  // 测试文件匹配
  coverage: {
    provider: 'v8',                      // 覆盖率提供者
    include: ['src/features/**/*.ts'],   // 覆盖哪些文件
  }
}
```

## 故障排除

| 问题 | 解决方案 |
|-----|--------|
| 测试超时 | 增加 timeout，如 `{ timeout: 1000 }` |
| localStorage 未定义 | 检查 environment 是否为 'jsdom' |
| 防抖测试失败 | 确保 waitFor timeout > 防抖延迟 (300ms) |
| Hook 状态未更新 | 使用 act() 包装状态变化 |
| 类型错误 | 确保导入类型定义，如 `import type { ... }` |

## 下一步

1. **扩展测试覆盖** - 为新组件添加测试
2. **CI/CD 集成** - 在 GitHub Actions 中运行测试
3. **覆盖率目标** - 使用 `test:coverage` 检查并提升覆盖率
4. **E2E 测试** - 使用 Playwright 进行端到端测试

---

**相关文档:** [详细总结](./vitest-setup-summary-haiku4.5-20260326.md)
