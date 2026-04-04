'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { debounce } from 'lodash'
import type { SearchItem, SearchResultItem, TextSegment, UseSearchReturn } from '../types'

/**
 * 将文本按关键词切分成若干段，isMatch 为 true 的段表示匹配部分
 * @param text 源文本
 * @param keyword 搜索关键词
 * @returns 文本段数组
 */
export function splitTextIntoSegments(text: string, keyword: string): TextSegment[] {
  if (!keyword.trim()) {
    return [{ text, isMatch: false }]
  }

  const segments: TextSegment[] = []
  const lowerKeyword = keyword.toLowerCase()
  const lowerText = text.toLowerCase()

  let lastIndex = 0
  let currentIndex = 0

  while ((currentIndex = lowerText.indexOf(lowerKeyword, lastIndex)) !== -1) {
    // 添加非匹配部分
    if (currentIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, currentIndex),
        isMatch: false,
      })
    }

    // 添加匹配部分
    segments.push({
      text: text.substring(currentIndex, currentIndex + lowerKeyword.length),
      isMatch: true,
    })

    lastIndex = currentIndex + lowerKeyword.length
  }

  // 添加剩余部分
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isMatch: false,
    })
  }

  return segments.length > 0 ? segments : [{ text, isMatch: false }]
}

/**
 * 按关键词过滤搜索数据并计算高亮分段
 * @param data 搜索数据列表
 * @param keyword 搜索关键词
 * @returns 搜索结果列表
 */
export function filterAndHighlight(data: SearchItem[], keyword: string): SearchResultItem[] {
  const trimmedKeyword = keyword.trim()

  // keyword 为空时，返回全部 data，所有分段 isMatch=false
  if (!trimmedKeyword) {
    return data.map((item) => ({
      item,
      titleSegments: [{ text: item.title, isMatch: false }],
      descriptionSegments: [{ text: item.description, isMatch: false }],
      matchedTags: [],
    }))
  }

  const lowerKeyword = trimmedKeyword.toLowerCase()

  // 过滤数据：title、description 或任意 tag 包含 keyword（大小写不敏感）
  const filteredData = data.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerKeyword)
    const descriptionMatch = item.description.toLowerCase().includes(lowerKeyword)
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))

    return titleMatch || descriptionMatch || tagMatch
  })

  // 对每条匹配项进行处理
  return filteredData.map((item) => {
    // 匹配关键词的 tag 列表（大小写不敏感）
    const matchedTags = item.tags.filter((tag) => tag.toLowerCase().includes(lowerKeyword))

    return {
      item,
      titleSegments: splitTextIntoSegments(item.title, trimmedKeyword),
      descriptionSegments: splitTextIntoSegments(item.description, trimmedKeyword),
      matchedTags,
    }
  })
}

/**
 * 搜索逻辑 hook，包含搜索、防抖处理和文本高亮分段
 * @param data 搜索数据列表
 * @returns 搜索返回值
 */
export function useSearch(data: SearchItem[]): UseSearchReturn {
  const [query, setQuery] = useState<string>('')
  const [debouncedQuery, setDebouncedQuery] = useState<string>('')
  const debouncedSetQueryRef = useRef<ReturnType<typeof debounce> | null>(null)

  // 初始化防抖函数（使用 useRef 避免 React Strict Mode 导致防抖失效）
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

  // 当 query 变化时，触发防抖更新
  useEffect(() => {
    if (debouncedSetQueryRef.current) {
      debouncedSetQueryRef.current(query)
    }
  }, [query])

  // 基于 debouncedQuery 计算结果
  const results = useMemo(() => {
    return filterAndHighlight(data, debouncedQuery)
  }, [data, debouncedQuery])

  // 防抖期间状态
  const isSearching = query !== debouncedQuery

  // 查询是否为空
  const isEmpty = debouncedQuery.trim() === ''

  // 是否有结果
  const hasResults = results.length > 0

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isSearching,
    isEmpty,
    hasResults,
  }
}
