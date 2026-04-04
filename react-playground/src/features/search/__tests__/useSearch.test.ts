import { describe, it, expect } from 'vitest'
import { splitTextIntoSegments, filterAndHighlight, useSearch } from '../hooks/useSearch'
import type { SearchItem } from '../types'
import { renderHook, act, waitFor } from '@testing-library/react'

// ── splitTextIntoSegments 测试 ──

describe('splitTextIntoSegments', () => {
  it('应该在 keyword 为空时返回单个非匹配 segment', () => {
    const result = splitTextIntoSegments('some text', '')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ text: 'some text', isMatch: false })
  })

  it('应该在头部匹配时正确分段', () => {
    const result = splitTextIntoSegments('React is great', 'react')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ text: 'React', isMatch: true })
    expect(result[1]).toEqual({ text: ' is great', isMatch: false })
  })

  it('应该在中间匹配时正确分段', () => {
    const result = splitTextIntoSegments('the React library', 'react')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ text: 'the ', isMatch: false })
    expect(result[1]).toEqual({ text: 'React', isMatch: true })
    expect(result[2]).toEqual({ text: ' library', isMatch: false })
  })

  it('应该在尾部匹配时正确分段', () => {
    const result = splitTextIntoSegments('I love React', 'react')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ text: 'I love ', isMatch: false })
    expect(result[1]).toEqual({ text: 'React', isMatch: true })
  })

  it('应该处理多次匹配的情况', () => {
    const result = splitTextIntoSegments('hook hooks hook', 'hook')
    const matchSegments = result.filter((seg) => seg.isMatch)
    const nonMatchSegments = result.filter((seg) => !seg.isMatch)
    expect(matchSegments).toHaveLength(3)
    expect(nonMatchSegments).toHaveLength(2)
  })

  it('应该支持大小写不敏感的匹配', () => {
    const result = splitTextIntoSegments('React Hooks', 'hook')
    // 搜索 'hook' (4字符)，在 'Hooks' (5字符) 中匹配前 4 个
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ text: 'React ', isMatch: false })
    expect(result[1]).toEqual({ text: 'Hook', isMatch: true })
    expect(result[2]).toEqual({ text: 's', isMatch: false })
  })

  it('应该在无匹配时返回单个非匹配 segment', () => {
    const result = splitTextIntoSegments('some text', 'xyz')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ text: 'some text', isMatch: false })
  })
})

// ── filterAndHighlight 测试 ──

describe('filterAndHighlight', () => {
  const mockData: SearchItem[] = [
    {
      id: '1',
      title: 'React Hooks Guide',
      description: 'Learn React Hooks',
      tags: ['react', 'hooks', 'frontend'],
      category: 'React',
    },
    {
      id: '2',
      title: 'TypeScript Basics',
      description: 'TypeScript for beginners',
      tags: ['typescript', 'beginner'],
      category: 'TypeScript',
    },
    {
      id: '3',
      title: 'Web Storage API',
      description: 'localStorage and sessionStorage',
      tags: ['web-api', 'storage'],
      category: 'Web API',
    },
  ]

  it('应该在 keyword 为空时返回全部数据，所有 isMatch 为 false', () => {
    const result = filterAndHighlight(mockData, '')
    expect(result).toHaveLength(3)
    result.forEach((item) => {
      expect(item.titleSegments).toEqual([{ text: item.item.title, isMatch: false }])
      expect(item.descriptionSegments).toEqual([{ text: item.item.description, isMatch: false }])
      expect(item.matchedTags).toHaveLength(0)
    })
  })

  it('应该按 title 匹配过滤', () => {
    const result = filterAndHighlight(mockData, 'React')
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('React Hooks Guide')
  })

  it('应该按 description 匹配过滤', () => {
    const result = filterAndHighlight(mockData, 'TypeScript')
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('TypeScript Basics')
  })

  it('应该按 tag 匹配过滤，matchedTags 正确', () => {
    const result = filterAndHighlight(mockData, 'web-api')
    expect(result).toHaveLength(1)
    expect(result[0].item.id).toBe('3')
    expect(result[0].matchedTags).toEqual(['web-api'])
  })

  it('应该支持大小写不敏感的匹配', () => {
    const result = filterAndHighlight(mockData, 'REACT')
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('React Hooks Guide')
  })

  it('应该在无匹配时返回空数组', () => {
    const result = filterAndHighlight(mockData, 'nonexistent')
    expect(result).toHaveLength(0)
  })

  it('应该确保 titleSegments 分段正确', () => {
    const result = filterAndHighlight(mockData, 'Hooks')
    expect(result).toHaveLength(1)
    const titleSegments = result[0].titleSegments
    expect(titleSegments.some((seg) => seg.isMatch && seg.text === 'Hooks')).toBe(true)
  })

  it('应该返回多个匹配项并分别计算分段', () => {
    const result = filterAndHighlight(mockData, 'storage')
    expect(result).toHaveLength(1)
    expect(result[0].descriptionSegments.some((seg) => seg.isMatch)).toBe(true)
  })
})

// ── useSearch hook 测试 ──

describe('useSearch', () => {
  const mockData: SearchItem[] = [
    {
      id: '1',
      title: 'React Hooks',
      description: 'A guide to React Hooks',
      tags: ['react', 'hooks'],
      category: 'React',
    },
    {
      id: '2',
      title: 'TypeScript Guide',
      description: 'Learn TypeScript',
      tags: ['typescript'],
      category: 'TypeScript',
    },
  ]

  it('初始状态时 isEmpty 为 true，results 显示全部数据', () => {
    const { result } = renderHook(() => useSearch(mockData))
    expect(result.current.isEmpty).toBe(true)
    // 初始状态时，搜索词为空，显示全部数据
    expect(result.current.results).toHaveLength(mockData.length)
    expect(result.current.query).toBe('')
    expect(result.current.debouncedQuery).toBe('')
    expect(result.current.hasResults).toBe(true)
  })

  it('设置 query 后 isSearching 为 true（防抖期间）', async () => {
    const { result } = renderHook(() => useSearch(mockData))

    act(() => {
      result.current.setQuery('React')
    })

    // 防抖期间，isSearching 应该为 true
    expect(result.current.query).toBe('React')
    expect(result.current.isSearching).toBe(true)
  })

  it('防抖结束后 results 更新，isSearching 为 false', async () => {
    const { result } = renderHook(() => useSearch(mockData))

    act(() => {
      result.current.setQuery('React')
    })

    // 等待防抖完成（300ms）
    await waitFor(
      () => {
        expect(result.current.isSearching).toBe(false)
      },
      { timeout: 500 }
    )

    expect(result.current.debouncedQuery).toBe('React')
    expect(result.current.results.length).toBeGreaterThan(0)
  })

  it('清空 query 后回到初始状态', async () => {
    const { result } = renderHook(() => useSearch(mockData))

    act(() => {
      result.current.setQuery('React')
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })

    act(() => {
      result.current.setQuery('')
    })

    await waitFor(() => {
      expect(result.current.debouncedQuery).toBe('')
    })

    expect(result.current.isEmpty).toBe(true)
    // 清空后回到初始状态，显示全部数据
    expect(result.current.results).toHaveLength(mockData.length)
    expect(result.current.hasResults).toBe(true)
  })

  it('hasResults 在有结果时为 true', async () => {
    const { result } = renderHook(() => useSearch(mockData))

    act(() => {
      result.current.setQuery('React')
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })

    expect(result.current.hasResults).toBe(true)
  })

  it('hasResults 在无结果时为 false', async () => {
    const { result } = renderHook(() => useSearch(mockData))

    act(() => {
      result.current.setQuery('nonexistent')
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })

    expect(result.current.hasResults).toBe(false)
  })
})
