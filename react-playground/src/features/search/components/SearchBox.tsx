'use client'

import { SearchBoxProps } from '../types'

export default function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = '搜索...',
}: SearchBoxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="清除搜索"
        >
          ×
        </button>
      )}
    </div>
  )
}
