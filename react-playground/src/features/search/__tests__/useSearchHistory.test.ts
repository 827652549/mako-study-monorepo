import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  deduplicateAndPrepend,
  loadHistoryFromStorage,
  saveHistoryToStorage,
  HISTORY_STORAGE_KEY,
  useSearchHistory,
} from '../hooks/useSearchHistory'
import type { HistoryRecord } from '../types'
import { renderHook, act } from '@testing-library/react'

// ── deduplicateAndPrepend 测试 ──

describe('deduplicateAndPrepend', () => {
  it('应该向空历史添加第一条记录', () => {
    const result = deduplicateAndPrepend([], 'React', 10)
    expect(result).toHaveLength(1)
    expect(result[0].keyword).toBe('React')
    expect(result[0].id).toBeDefined()
    expect(result[0].createdAt).toBeDefined()
  })

  it('应该添加不重复的新记录，插入到头部', () => {
    const existing: HistoryRecord[] = [
      { id: '1', keyword: 'TypeScript', createdAt: 1000 },
      { id: '2', keyword: 'React', createdAt: 2000 },
    ]
    const result = deduplicateAndPrepend(existing, 'Vue', 10)
    expect(result).toHaveLength(3)
    expect(result[0].keyword).toBe('Vue')
    expect(result[1].keyword).toBe('TypeScript')
    expect(result[2].keyword).toBe('React')
  })

  it('应该添加已存在的记录，移至头部并更新 id/timestamp', () => {
    const existing: HistoryRecord[] = [
      { id: '1', keyword: 'TypeScript', createdAt: 1000 },
      { id: '2', keyword: 'React', createdAt: 2000 },
    ]
    const result = deduplicateAndPrepend(existing, 'React', 10)
    expect(result).toHaveLength(2)
    expect(result[0].keyword).toBe('React')
    expect(result[0].id).not.toBe('2') // id 应该更新
    expect(result[1].keyword).toBe('TypeScript')
  })

  it('应该支持大小写不同视为相同 keyword 去重', () => {
    const existing: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]
    const result = deduplicateAndPrepend(existing, 'react', 10)
    expect(result).toHaveLength(2)
    expect(result[0].keyword).toBe('react') // 保留新的 keyword
    expect(result[1].keyword).toBe('TypeScript')
  })

  it('应该在超过 maxCount 时，截断末尾', () => {
    const existing: HistoryRecord[] = Array.from({ length: 9 }, (_, i) => ({
      id: `${i}`,
      keyword: `Item${i}`,
      createdAt: i * 1000,
    }))
    const result = deduplicateAndPrepend(existing, 'NewItem', 5)
    expect(result).toHaveLength(5)
    expect(result[0].keyword).toBe('NewItem')
  })
})

// ── localStorage 读写测试 ──

describe('localStorage read/write', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('localStorage 为空时 loadHistoryFromStorage 返回空数组', () => {
    const result = loadHistoryFromStorage()
    expect(result).toEqual([])
  })

  it('localStorage 存在合法数据时正确反序列化', () => {
    const mockData: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

    const result = loadHistoryFromStorage()
    expect(result).toEqual(mockData)
  })

  it('localStorage 存在非法 JSON 时返回空数组（不抛出异常）', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, 'invalid json{')

    expect(() => {
      loadHistoryFromStorage()
    }).not.toThrow()

    const result = loadHistoryFromStorage()
    expect(result).toEqual([])
  })

  it('saveHistoryToStorage 将数组序列化写入 localStorage', () => {
    const mockData: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]

    saveHistoryToStorage(mockData)

    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    expect(stored).toBeDefined()
    expect(JSON.parse(stored!)).toEqual(mockData)
  })
})

// ── useSearchHistory hook 测试 ──

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('初始化时从 localStorage 读取历史', () => {
    const mockData: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

    const { result } = renderHook(() => useSearchHistory())

    // 初始化是异步的，历史应该被加载
    expect(result.current.history).toEqual(mockData)
  })

  it('addHistory 添加记录后，localStorage 同步更新', async () => {
    const { result } = renderHook(() => useSearchHistory())

    act(() => {
      result.current.addHistory('React')
    })

    // 给异步操作时间完成
    await new Promise((resolve) => setTimeout(resolve, 0))

    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    expect(stored).toBeDefined()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].keyword).toBe('React')
  })

  it('addHistory 空字符串不记录', () => {
    const { result } = renderHook(() => useSearchHistory())

    act(() => {
      result.current.addHistory('   ') // 只有空格
    })

    expect(result.current.history).toHaveLength(0)
  })

  it('removeHistory 删除指定 id 的记录', async () => {
    const mockData: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

    const { result } = renderHook(() => useSearchHistory())

    // 等待初始化
    await new Promise((resolve) => setTimeout(resolve, 0))

    act(() => {
      result.current.removeHistory('1')
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].id).toBe('2')
  })

  it('clearHistory 清空所有记录并更新 localStorage', async () => {
    const mockData: HistoryRecord[] = [
      { id: '1', keyword: 'React', createdAt: 1000 },
      { id: '2', keyword: 'TypeScript', createdAt: 2000 },
    ]
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

    const { result } = renderHook(() => useSearchHistory())

    await new Promise((resolve) => setTimeout(resolve, 0))

    act(() => {
      result.current.clearHistory()
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.history).toHaveLength(0)
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    expect(JSON.parse(stored!)).toEqual([])
  })

  it('连续 addHistory 10 条后，第 11 条挤出最旧一条', async () => {
    const { result } = renderHook(() => useSearchHistory(10))

    // 添加 10 条记录
    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.addHistory(`Item${i}`)
      })
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    expect(result.current.history).toHaveLength(10)

    // 添加第 11 条
    act(() => {
      result.current.addHistory('Item11')
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(result.current.history).toHaveLength(10)
    // 最新的记录应该在头部
    expect(result.current.history[0].keyword).toBe('Item11')
    // 最旧的记录（Item1）应该被移除
    expect(result.current.history.every((r) => r.keyword !== 'Item1')).toBe(true)
  })

  it('maxCount 参数应该正确限制历史记录数量', () => {
    const { result } = renderHook(() => useSearchHistory(5))

    // 添加 6 条记录
    for (let i = 1; i <= 6; i++) {
      act(() => {
        result.current.addHistory(`Item${i}`)
      })
    }

    // 最多保留 5 条
    expect(result.current.history.length).toBeLessThanOrEqual(5)
  })

  it('重复添加同一关键词时，应该更新顺序而不增加数量', async () => {
    const { result } = renderHook(() => useSearchHistory(10))

    act(() => {
      result.current.addHistory('React')
    })
    await new Promise((resolve) => setTimeout(resolve, 10))

    act(() => {
      result.current.addHistory('TypeScript')
    })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].keyword).toBe('TypeScript')

    // 再次添加 React
    act(() => {
      result.current.addHistory('React')
    })
    await new Promise((resolve) => setTimeout(resolve, 10))

    // 数量不变，但顺序改变
    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].keyword).toBe('React')
    expect(result.current.history[1].keyword).toBe('TypeScript')
  })
})
