'use client'

import { SearchHistoryProps } from '../types'

export default function SearchHistory({
  history,
  onSelect,
  onRemove,
  onClear,
}: SearchHistoryProps) {
  // 如果历史记录为空，不渲染
  if (history.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* 标题 + 清空按钮 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">搜索历史</h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          全部清空
        </button>
      </div>

      {/* 历史条目列表 */}
      <div className="flex flex-wrap gap-2">
        {history.map((record) => (
          <div
            key={record.id}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            <button
              onClick={() => onSelect(record.keyword)}
              className="hover:underline"
            >
              {record.keyword}
            </button>
            <button
              onClick={() => onRemove(record.id)}
              className="text-gray-400 hover:text-gray-600 ml-1"
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
