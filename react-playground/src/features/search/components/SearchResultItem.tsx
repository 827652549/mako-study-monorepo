'use client'

import { SearchResultItemProps } from '../types'
import HighlightText from './HighlightText'

export default function SearchResultItem({ result }: SearchResultItemProps) {
  const { item, titleSegments, descriptionSegments, matchedTags } = result
  const allTags = item.tags

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <HighlightText segments={titleSegments} />
      </h3>

      {/* 描述 */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        <HighlightText segments={descriptionSegments} />
      </p>

      {/* 分类 */}
      <div className="text-xs text-gray-500 mb-3">
        分类: {item.category}
      </div>

      {/* 标签 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isMatched = matchedTags.includes(tag)
            return (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded ${
                  isMatched
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
