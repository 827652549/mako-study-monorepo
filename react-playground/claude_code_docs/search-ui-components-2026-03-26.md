# 搜索功能 UI 组件实现文档

**创建时间**: 2026-03-26
**模型**: Claude Haiku 4.5
**SubAgent**: SubAgent 1 — UI 层

## 概述

本文档记录了搜索功能中 5 个 React 展示组件的实现。所有组件均为纯 UI 展示组件，不包含任何业务逻辑，所有交互事件通过 props 回调传递。

## 组件清单

### 1. HighlightText.tsx
**路径**: `src/features/search/components/HighlightText.tsx`

**功能**: 渲染高亮的文本片段

**Props**:
- `segments: TextSegment[]` - 文本片段数组
- `highlightClassName?: string` - 高亮样式类（默认值：`bg-yellow-200 text-yellow-900 rounded px-0.5`）

**实现细节**:
- 使用 `<mark>` 标签包装匹配的文本片段
- 未匹配的部分用 `<span>` 包装
- 支持自定义高亮样式，默认使用黄色背景

**使用示例**:
```tsx
<HighlightText
  segments={[
    { text: '这是', isMatch: false },
    { text: 'React', isMatch: true },
  ]}
/>
```

---

### 2. SearchBox.tsx
**路径**: `src/features/search/components/SearchBox.tsx`

**功能**: 搜索输入框组件，包含文本输入和清除按钮

**Props**:
- `value: string` - 输入框当前值
- `onChange: (value: string) => void` - 值变化回调
- `onClear: () => void` - 清除按钮点击回调
- `placeholder?: string` - 占位符文本（默认值：`搜索...`）

**实现细节**:
- 清除按钮仅在 `value` 非空时显示
- 使用 Tailwind 样式实现 focus 时的蓝色边框和圆形阴影
- 清除按钮采用"×"符号，支持 hover 效果

**样式特性**:
- 聚焦时：蓝色边框 + 蓝色环形阴影
- 清除按钮：灰色文本，hover 时变深

---

### 3. SearchResultItem.tsx
**路径**: `src/features/search/components/SearchResultItem.tsx`

**功能**: 单条搜索结果卡片组件

**Props**:
- `result: SearchResultItem` - 搜索结果数据

**结构**:
1. **标题**: 用 `HighlightText` 渲染 `result.titleSegments`
2. **描述**: 用 `HighlightText` 渲染 `result.descriptionSegments`，限制最多 2 行
3. **分类**: 灰色小字显示 `item.category`
4. **标签**:
   - 匹配的标签：蓝色背景 (`bg-blue-100 text-blue-700`)
   - 普通标签：灰色背景 (`bg-gray-100 text-gray-700`)

**样式特性**:
- 卡片边框：浅灰色边框
- Hover 效果：显示阴影
- 响应式：标签使用 flex wrap，可自动换行

---

### 4. SearchResultList.tsx
**路径**: `src/features/search/components/SearchResultList.tsx`

**功能**: 搜索结果列表容器，处理三种状态

**Props**:
- `results: SearchResultItem[]` - 结果数组
- `query: string` - 搜索关键词
- `isEmpty: boolean` - 是否为搜索初始状态

**三种渲染状态**:

1. **初始状态** (`isEmpty === true`)
   - 显示标题：「推荐内容」
   - 展示所有 results（通常是全量 mock 数据）

2. **无结果态** (`isEmpty === false && results.length === 0`)
   - 居中显示：「没有找到与 "{query}" 相关的内容」

3. **有结果态** (`results.length > 0`)
   - 显示标题：「搜索结果 (共 N 条)」
   - 展示结果列表

**实现细节**:
- 使用 `space-y-3` 进行均匀间距
- 每条结果用 `SearchResultItem` 渲染
- 无结果文案使用 HTML entities (`&ldquo;` 和 `&rdquo;`) 以符合 ESLint 规范

---

### 5. SearchHistory.tsx
**路径**: `src/features/search/components/SearchHistory.tsx`

**功能**: 搜索历史记录区域

**Props**:
- `history: HistoryRecord[]` - 历史记录数组
- `onSelect: (keyword: string) => void` - 历史项点击回调
- `onRemove: (id: string) => void` - 历史项删除回调
- `onClear: () => void` - 清空全部回调

**行为**:
- 历史记录为空时返回 `null`（不渲染）
- 否则渲染历史区域

**结构**:
1. **头部**:
   - 标题：「搜索历史」
   - 「全部清空」按钮（右对齐）

2. **历史列表**:
   - Pill/Chip 样式的历史条目
   - 每条：关键词 + 删除按钮（×）
   - Hover 时背景变深

**样式特性**:
- Pill 样式：圆形边角 + 灰色背景
- Hover 效果：背景加深 (`hover:bg-gray-200`)
- 删除按钮：文本型，灰色，hover 时变深

---

## 文件导出

**文件**: `src/features/search/components/index.js`

导出所有 5 个组件的默认导出，便于统一导入：

```tsx
export { default as HighlightText } from './HighlightText'
export { default as SearchBox } from './SearchBox'
export { default as SearchResultItem } from './SearchResultItem'
export { default as SearchResultList } from './SearchResultList'
export { default as SearchHistory } from './SearchHistory'
```

**使用方式**:
```tsx
import {
  HighlightText,
  SearchBox,
  SearchResultItem,
  SearchResultList,
  SearchHistory,
} from '@/features/search/components'
```

---

## 技术栈

- **React 19** - 使用 'use client' 指令标记客户端组件
- **Next.js 15** - 基于 App Router
- **TypeScript** - 强类型支持
- **Tailwind CSS** - 所有样式均使用 Tailwind 工具类

---

## 类型定义

所有类型均从 `src/features/search/types.ts` 导入：

| 类型 | 说明 |
|------|------|
| `TextSegment` | 单个文本片段（包含文本和是否匹配标志） |
| `SearchResultItem` | 搜索结果项（包含原始数据和高亮分段） |
| `HistoryRecord` | 历史记录项（包含 id、关键词、时间戳） |
| 各组件 `Props` 类型 | 对应各组件的 Props 接口 |

---

## 设计原则

1. **零业务逻辑** - 所有交互通过 props 回调
2. **纯 UI 展示** - 仅负责渲染，不涉及数据获取或状态管理
3. **高度可复用** - Props 接口清晰，支持多种使用场景
4. **Tailwind 唯一** - 不使用 CSS Module 或 inline style，便于维护和复用
5. **强类型** - 所有 Props 均有明确的 TypeScript 类型定义

---

## 后续集成

这些组件可被以下模块使用：

- **SearchContainer** - 组合容器，集成钩子和业务逻辑
- **搜索页面** - 作为页面级展示层

---

## 已验证

- ✓ 所有组件语法正确，支持 TypeScript 编译
- ✓ Props 类型与 `types.ts` 定义一致
- ✓ Tailwind 类名有效
- ✓ 组件可独立使用或组合使用
- ✓ ESLint 规范检查通过

