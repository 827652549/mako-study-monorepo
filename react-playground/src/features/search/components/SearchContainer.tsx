'use client'

import { useEffect } from 'react'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import SearchBox from './SearchBox'
import SearchResultList from './SearchResultList'
import SearchHistory from './SearchHistory'
import type { SearchContainerProps } from '../types'

export default function SearchContainer({ data }: SearchContainerProps) {
  const { query, setQuery, debouncedQuery, results, isEmpty } = useSearch(data)
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()

  const handleQueryChange = (value: string) => {
    setQuery(value)
  }

  const handleClear = () => {
    setQuery('')
  }

  const handleHistorySelect = (keyword: string) => {
    setQuery(keyword)
  }

  // 防抖完成后记录历史
  useEffect(() => {
    if (debouncedQuery.trim()) {
      addHistory(debouncedQuery.trim())
    }
  }, [debouncedQuery, addHistory])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <SearchBox value={query} onChange={handleQueryChange} onClear={handleClear} />
      <SearchHistory
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeHistory}
        onClear={clearHistory}
      />
      <SearchResultList results={results} query={query} isEmpty={isEmpty} />
    </div>
  )
}
