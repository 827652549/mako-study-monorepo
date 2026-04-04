'use client'

import { SearchResultListProps } from '../types'
import SearchResultItem from './SearchResultItem'

export default function SearchResultList({
  results,
  query,
  isEmpty,
}: SearchResultListProps) {
  // isEmpty 为 true 时，展示全部数据（搜索前）
  if (isEmpty) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">推荐内容</h2>
        {results.map((result) => (
          <SearchResultItem key={result.item.id} result={result} />
        ))}
      </div>
    )
  }

  // 无结果态
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">没有找到与 &ldquo;{query}&rdquo; 相关的内容</p>
      </div>
    )
  }

  // 有结果态
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        搜索结果 (共 {results.length} 条)
      </h2>
      {results.map((result) => (
        <SearchResultItem key={result.item.id} result={result} />
      ))}
    </div>
  )
}
