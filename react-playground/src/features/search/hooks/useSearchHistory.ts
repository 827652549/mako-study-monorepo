'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HistoryRecord, UseSearchHistoryReturn } from '../types'

// ── 常量 ────────────────────────────────────────────────────

export const HISTORY_STORAGE_KEY = 'playground_search_history'

// ── 纯函数（供测试）────────────────────────────────────────

/**
 * 从 localStorage 读取历史记录
 * - SSR 防御：检查 typeof window !== 'undefined'
 * - 如果无数据或 JSON.parse 失败，返回空数组
 */
export function loadHistoryFromStorage(): HistoryRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored) as unknown
    // 简单的数据验证
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch {
    // JSON.parse 失败或其他错误
    return []
  }
}

/**
 * 将历史记录写入 localStorage
 * - SSR 防御：检查 typeof window !== 'undefined'
 * - 序列化为 JSON 字符串
 */
export function saveHistoryToStorage(history: HistoryRecord[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // 可能是 localStorage 满了，或其他错误，静默处理
    console.warn('Failed to save search history to localStorage')
  }
}

/**
 * 去重并在头部插入新记录的纯函数
 * - 过滤掉 keyword 相同的旧记录（不区分大小写）
 * - 在头部插入新记录：{ id: Date.now().toString(), keyword, createdAt: Date.now() }
 * - 截断至 maxCount（移除末尾超出部分）
 */
export function deduplicateAndPrepend(
  history: HistoryRecord[],
  keyword: string,
  maxCount: number
): HistoryRecord[] {
  const normalizedKeyword = keyword.toLowerCase()

  // 过滤掉 keyword 相同的旧记录
  const filtered = history.filter(
    (record) => record.keyword.toLowerCase() !== normalizedKeyword
  )

  // 在头部插入新记录
  const newRecord: HistoryRecord = {
    id: Date.now().toString(),
    keyword: keyword.trim(),
    createdAt: Date.now(),
  }

  const updated = [newRecord, ...filtered]

  // 截断至 maxCount
  return updated.slice(0, maxCount)
}

// ── Hook ────────────────────────────────────────────────────

/**
 * 搜索历史管理 Hook
 * @param maxCount 历史记录上限，默认 10
 * @returns { history, addHistory, removeHistory, clearHistory }
 */
export function useSearchHistory(maxCount: number = 10): UseSearchHistoryReturn {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化：从 localStorage 读取历史记录
  useEffect(() => {
    const loaded = loadHistoryFromStorage()
    setHistory(loaded)
    setIsInitialized(true)
  }, [])

  // 历史记录变化时，同步至 localStorage
  useEffect(() => {
    if (isInitialized) {
      saveHistoryToStorage(history)
    }
  }, [history, isInitialized])

  // 添加历史记录
  const addHistory = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim()
      // 空字符串（trim 后）则跳过
      if (!trimmed) {
        return
      }
      setHistory((prevHistory) =>
        deduplicateAndPrepend(prevHistory, trimmed, maxCount)
      )
    },
    [maxCount]
  )

  // 删除指定 id 的记录
  const removeHistory = useCallback((id: string) => {
    setHistory((prevHistory) => prevHistory.filter((record) => record.id !== id))
  }, [])

  // 清空所有记录
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
