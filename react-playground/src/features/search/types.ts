// ── 数据模型 ──────────────────────────────────────────────

/** 搜索数据条目（mock data 的单元素结构） */
export interface SearchItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
}

/** 单个文本片段：用于高亮渲染 */
export interface TextSegment {
  text: string
  isMatch: boolean
}

/** 一条搜索结果：携带原始数据 + 各字段的高亮分段信息 */
export interface SearchResultItem {
  item: SearchItem
  titleSegments: TextSegment[]
  descriptionSegments: TextSegment[]
  matchedTags: string[] // 完全匹配 keyword 的 tag 列表
}

// ── 搜索历史 ──────────────────────────────────────────────

/** 单条历史记录 */
export interface HistoryRecord {
  id: string // nanoid 或 Date.now().toString()
  keyword: string
  createdAt: number // Unix timestamp ms
}

// ── Hook 返回值类型 ────────────────────────────────────────

/** useSearch hook 返回值 */
export interface UseSearchReturn {
  query: string
  setQuery: (value: string) => void
  debouncedQuery: string // 防抖后的查询词，供 SearchContainer 监听
  results: SearchResultItem[]
  isSearching: boolean // 防抖期间为 true（用于 loading 状态）
  isEmpty: boolean // query 为空时为 true
  hasResults: boolean // results.length > 0
}

/** useSearchHistory hook 返回值 */
export interface UseSearchHistoryReturn {
  history: HistoryRecord[]
  addHistory: (keyword: string) => void
  removeHistory: (id: string) => void
  clearHistory: () => void
}

// ── UI 组件 Props 类型 ─────────────────────────────────────

/** SearchBox 组件 Props */
export interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

/** HighlightText 组件 Props */
export interface HighlightTextProps {
  segments: TextSegment[]
  highlightClassName?: string
}

/** SearchResultItem 组件 Props */
export interface SearchResultItemProps {
  result: SearchResultItem
}

/** SearchResultList 组件 Props */
export interface SearchResultListProps {
  results: SearchResultItem[]
  query: string
  isEmpty: boolean
}

/** SearchHistory 组件 Props */
export interface SearchHistoryProps {
  history: HistoryRecord[]
  onSelect: (keyword: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

/** SearchContainer 组件 Props（组合容器） */
export interface SearchContainerProps {
  data: SearchItem[]
}
