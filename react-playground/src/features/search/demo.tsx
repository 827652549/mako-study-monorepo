'use client'

import { useState } from 'react'
import {
  HighlightText,
  SearchBox,
  SearchResultItem,
  SearchResultList,
  SearchHistory,
} from './components'
import type {
  TextSegment,
  SearchResultItem as SearchResultItemType,
  HistoryRecord,
} from './types'

/**
 * 演示页面 - 展示所有搜索相关的 UI 组件
 * 这个文件仅用于开发演示，不是实际的业务组件
 */
export default function SearchDemo() {
  const [searchValue, setSearchValue] = useState('')
  const [history, setHistory] = useState<HistoryRecord[]>([
    { id: '1', keyword: 'React Hooks', createdAt: Date.now() - 1000 },
    { id: '2', keyword: 'TypeScript', createdAt: Date.now() - 2000 },
  ])

  // 示例：高亮文本
  const demoSegments: TextSegment[] = [
    { text: '这是', isMatch: false },
    { text: 'React', isMatch: true },
    { text: '的演示', isMatch: false },
  ]

  // 示例：搜索结果
  const demoResult: SearchResultItemType = {
    item: {
      id: 'demo-1',
      title: 'React Hooks 完整指南',
      description: '深入讲解 useState、useEffect、useRef 等核心 Hook 的使用方式和最佳实践',
      tags: ['react', 'hooks', 'frontend'],
      category: 'React',
    },
    titleSegments: [
      { text: '', isMatch: false },
      { text: 'React', isMatch: true },
      { text: ' Hooks 完整指南', isMatch: false },
    ],
    descriptionSegments: [
      { text: '深入讲解 ', isMatch: false },
      { text: 'useState', isMatch: true },
      { text: '、useEffect、useRef 等核心 Hook 的使用方式和最佳实践', isMatch: false },
    ],
    matchedTags: ['react', 'hooks'],
  }

  const handleHistorySelect = (keyword: string) => {
    setSearchValue(keyword)
  }

  const handleHistoryRemove = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
  }

  const handleHistoryClear = () => {
    setHistory([])
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-8">搜索 UI 组件演示</h1>

        {/* SearchBox 演示 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">SearchBox 组件</h2>
          <SearchBox
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue('')}
            placeholder="输入关键词搜索..."
          />
        </section>

        {/* HighlightText 演示 */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold">HighlightText 组件</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p>
              <HighlightText segments={demoSegments} />
            </p>
          </div>
        </section>

        {/* SearchResultItem 演示 */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold">SearchResultItem 组件</h2>
          <SearchResultItem result={demoResult} />
        </section>

        {/* SearchResultList 演示 */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold">SearchResultList 组件</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <SearchResultList
              results={[demoResult, demoResult]}
              query={searchValue || 'React'}
              isEmpty={false}
            />
          </div>
        </section>

        {/* SearchHistory 演示 */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold">SearchHistory 组件</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <SearchHistory
              history={history}
              onSelect={handleHistorySelect}
              onRemove={handleHistoryRemove}
              onClear={handleHistoryClear}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
