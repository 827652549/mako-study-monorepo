# useSearch Hook 实现文档

**实现者:** Claude Haiku 4.5
**实现时间:** 2026-03-26
**文件路径:** `/src/features/search/hooks/useSearch.ts`

## 概览

完整实现了搜索逻辑 hook `useSearch`，包含两个独立的纯函数和一个 React hook，支持防抖处理和文本高亮分段。

## 实现的核心内容

### 1. 纯函数：splitTextIntoSegments

**功能:** 将文本按关键词切分成若干段，`isMatch` 为 true 的段表示匹配部分。

**签名:**
```typescript
function splitTextIntoSegments(text: string, keyword: string): TextSegment[]
```

**关键实现细节:**
- 大小写不敏感搜索：使用 `toLowerCase()` 对比
- 使用 `indexOf()` 在循环中查找所有匹配位置
- 正确处理重叠、连续和分散的匹配
- 空 keyword 时返回整个文本作为非匹配段

**算法流程:**
```
1. 如果 keyword 为空，返回 [{ text, isMatch: false }]
2. 转换为小写进行比较
3. 从 lastIndex 开始循环查找 keyword 位置
4. 每次发现匹配：
   - 如果有间隙，先添加非匹配段
   - 添加匹配段
   - 更新 lastIndex
5. 最后添加剩余的非匹配文本
```

**示例:**
```typescript
splitTextIntoSegments('React Hooks', 'hook')
// 返回: [{ text: 'React ', isMatch: false }, { text: 'Hooks', isMatch: true }]
```

### 2. 纯函数：filterAndHighlight

**功能:** 按关键词过滤搜索数据并计算高亮分段。

**签名:**
```typescript
function filterAndHighlight(data: SearchItem[], keyword: string): SearchResultItem[]
```

**关键实现细节:**
- 空 keyword：返回全部数据，所有分段 `isMatch=false`
- 过滤条件：title、description 或任意 tag 包含 keyword（大小写不敏感）
- 对每条匹配项分别调用 `splitTextIntoSegments` 处理 title 和 description
- `matchedTags` = 完全包含 keyword 的 tag 列表（大小写不敏感）

**过滤逻辑:**
```typescript
const titleMatch = item.title.toLowerCase().includes(lowerKeyword)
const descriptionMatch = item.description.toLowerCase().includes(lowerKeyword)
const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))

return titleMatch || descriptionMatch || tagMatch
```

### 3. React Hook：useSearch

**功能:** 搜索逻辑 hook，包含防抖处理、状态管理和结果计算。

**签名:**
```typescript
function useSearch(data: SearchItem[]): UseSearchReturn
```

**返回值结构:**
```typescript
{
  query: string              // 即时的用户输入
  setQuery: (value: string) => void
  debouncedQuery: string     // 防抖 300ms 后的查询词
  results: SearchResultItem[] // 基于 debouncedQuery 计算
  isSearching: boolean       // 防抖期间为 true
  isEmpty: boolean           // debouncedQuery.trim() === ''
  hasResults: boolean        // results.length > 0
}
```

**防抖实现关键点:**

1. **使用 useRef 保存 debounce 实例**
   - 避免 React Strict Mode 重复创建导致防抖失效
   - 在 useEffect 中初始化和清理

2. **两层 useEffect 设计**
   - 第一层：初始化防抖函数（依赖数组为空，只执行一次）
   - 第二层：当 query 变化时，调用防抖函数

3. **防抖延迟：300ms**
   - 平衡用户体验和性能

4. **清理函数处理**
   - 组件卸载时调用 `debounce.cancel()`
   - 避免内存泄漏和异步状态更新

**代码片段:**
```typescript
const debouncedSetQueryRef = useRef<ReturnType<typeof debounce> | null>(null)

useEffect(() => {
  if (debouncedSetQueryRef.current) {
    debouncedSetQueryRef.current.cancel()
  }

  debouncedSetQueryRef.current = debounce((value: string) => {
    setDebouncedQuery(value)
  }, 300)

  return () => {
    debouncedSetQueryRef.current?.cancel()
  }
}, [])

useEffect(() => {
  if (debouncedSetQueryRef.current) {
    debouncedSetQueryRef.current(query)
  }
}, [query])
```

## 类型安全

- 所有参数和返回值都有完整的 TypeScript 类型注解
- 使用 `type` 关键字导入类型，不会增加运行时体积
- 符合项目的 TypeScript 严格模式

## 测试覆盖

创建了 `useSearch.test.ts` 文件，包含 10 个测试用例，验证：
- 基础匹配功能
- 大小写不敏感性
- 多重匹配处理
- 空 keyword 处理
- 按 title/description/tags 过滤
- matchedTags 的正确识别
- titleSegments 和 descriptionSegments 的正确分割

## 导出

通过 `src/features/search/hooks/index.ts` 导出：
```typescript
export { useSearch, splitTextIntoSegments, filterAndHighlight } from './useSearch'
```

## 项目集成

- 与 Next.js 15 + React 19 兼容
- 使用 lodash 的 debounce 函数（已在 package.json 中声明依赖）
- 符合 React 18+ 的并发特性和 Strict Mode
- 使用 'use client' 声明为客户端组件

## 性能优化

- `useMemo` 避免不必要的计算
- `useRef` 避免防抖实例重复创建
- 纯函数设计便于单元测试和优化

## 已知设计决策

1. **isEmpty 和 hasResults 的计算方式**
   - `isEmpty` 基于 `debouncedQuery.trim()`，确保纯空格被视为空
   - `hasResults` 基于 `results.length`

2. **matchedTags 的定义**
   - 使用 `includes()` 而不是完全相等匹配
   - 例如，搜索 "react" 时，tag "react-hooks" 也会被视为匹配

3. **防抖期间的行为**
   - `isSearching = true` 表示用户输入已改变但搜索结果还未更新
   - UI 可以据此显示加载状态

## 文件列表

- `/src/features/search/hooks/useSearch.ts` - 主实现文件
- `/src/features/search/hooks/index.ts` - 导出索引
- `/src/features/search/hooks/useSearch.test.ts` - 测试用例示例
