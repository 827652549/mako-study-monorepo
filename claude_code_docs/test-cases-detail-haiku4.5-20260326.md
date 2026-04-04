# Vitest 单元测试用例详细文档

**项目:** react-playground
**完成时间:** 2026-03-26
**总计测试用例:** 38 个

---

## 第一部分：useSearch.test.ts (21 cases)

### 测试组 1：splitTextIntoSegments (7 cases)

纯函数测试，用于将文本按关键词分段并标记匹配部分。

#### Case 1.1: keyword 为空时返回单个非匹配 segment
```typescript
it('应该在 keyword 为空时返回单个非匹配 segment', () => {
  const result = splitTextIntoSegments('some text', '')
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({ text: 'some text', isMatch: false })
})
```
**测试目标:** 空 keyword 应返回原文本，不进行分段
**边界情况:** 空字符串、只有空格的字符串

#### Case 1.2: 头部匹配时正确分段
```typescript
it('应该在头部匹配时正确分段', () => {
  const result = splitTextIntoSegments('React is great', 'react')
  expect(result).toHaveLength(2)
  expect(result[0]).toEqual({ text: 'React', isMatch: true })
  expect(result[1]).toEqual({ text: ' is great', isMatch: false })
})
```
**测试目标:** 关键词在开头时的分段逻辑
**验证:** 匹配段、非匹配段的顺序和内容

#### Case 1.3: 中间匹配时正确分段
```typescript
it('应该在中间匹配时正确分段', () => {
  const result = splitTextIntoSegments('the React library', 'react')
  expect(result).toHaveLength(3)
  expect(result[0]).toEqual({ text: 'the ', isMatch: false })
  expect(result[1]).toEqual({ text: 'React', isMatch: true })
  expect(result[2]).toEqual({ text: ' library', isMatch: false })
})
```
**测试目标:** 关键词在中间时的分段（非匹配-匹配-非匹配）
**验证:** 三段分别为非匹配、匹配、非匹配

#### Case 1.4: 尾部匹配时正确分段
```typescript
it('应该在尾部匹配时正确分段', () => {
  const result = splitTextIntoSegments('I love React', 'react')
  expect(result).toHaveLength(2)
  expect(result[0]).toEqual({ text: 'I love ', isMatch: false })
  expect(result[1]).toEqual({ text: 'React', isMatch: true })
})
```
**测试目标:** 关键词在末尾时的分段
**验证:** 非匹配段在前，匹配段在后

#### Case 1.5: 多次匹配的情况
```typescript
it('应该处理多次匹配的情况', () => {
  const result = splitTextIntoSegments('hook hooks hook', 'hook')
  const matchSegments = result.filter((seg) => seg.isMatch)
  const nonMatchSegments = result.filter((seg) => !seg.isMatch)
  expect(matchSegments).toHaveLength(3)
  expect(nonMatchSegments).toHaveLength(2)
})
```
**测试目标:** 一个文本中含多个关键词时的处理
**验证:** 3 个匹配段，2 个非匹配段（分别为中间的 ' ' 和末尾无）

#### Case 1.6: 大小写不敏感的匹配
```typescript
it('应该支持大小写不敏感的匹配', () => {
  const result = splitTextIntoSegments('React Hooks', 'hook')
  expect(result).toHaveLength(2)
  expect(result[0]).toEqual({ text: 'React ', isMatch: false })
  expect(result[1]).toEqual({ text: 'Hooks', isMatch: true })
})
```
**测试目标:** 大小写无关匹配（keyword 小写可匹配大写文本）
**验证:** 小写 'hook' 能匹配大写 'Hooks'

#### Case 1.7: 无匹配时返回单个非匹配 segment
```typescript
it('应该在无匹配时返回单个非匹配 segment', () => {
  const result = splitTextIntoSegments('some text', 'xyz')
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({ text: 'some text', isMatch: false })
})
```
**测试目标:** 关键词不存在于文本中时的处理
**验证:** 返回原文本，isMatch 为 false

---

### 测试组 2：filterAndHighlight (7 cases)

函数测试，用于按关键词过滤搜索数据并计算各字段的高亮分段。

**Mock 数据:**
```typescript
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
```

#### Case 2.1: keyword 为空时返回全部数据，所有 isMatch 为 false
```typescript
it('应该在 keyword 为空时返回全部数据，所有 isMatch 为 false', () => {
  const result = filterAndHighlight(mockData, '')
  expect(result).toHaveLength(3)
  result.forEach((item) => {
    expect(item.titleSegments).toEqual([{ text: item.item.title, isMatch: false }])
    expect(item.descriptionSegments).toEqual([{ text: item.item.description, isMatch: false }])
    expect(item.matchedTags).toHaveLength(0)
  })
})
```
**测试目标:** 空 keyword 时的特殊处理
**验证:** 返回全部项，所有段的 isMatch 都是 false，matchedTags 为空

#### Case 2.2: 按 title 匹配过滤
```typescript
it('应该按 title 匹配过滤', () => {
  const result = filterAndHighlight(mockData, 'React')
  expect(result).toHaveLength(1)
  expect(result[0].item.title).toBe('React Hooks Guide')
})
```
**测试目标:** title 字段包含关键词时应被包含
**验证:** 仅返回 'React Hooks Guide' 这一条

#### Case 2.3: 按 description 匹配过滤
```typescript
it('应该按 description 匹配过滤', () => {
  const result = filterAndHighlight(mockData, 'TypeScript')
  expect(result).toHaveLength(1)
  expect(result[0].item.title).toBe('TypeScript Basics')
})
```
**测试目标:** description 字段包含关键词时应被包含
**验证:** 仅返回 description 含有 TypeScript 的项

#### Case 2.4: 按 tag 匹配过滤，matchedTags 正确
```typescript
it('应该按 tag 匹配过滤，matchedTags 正确', () => {
  const result = filterAndHighlight(mockData, 'web-api')
  expect(result).toHaveLength(1)
  expect(result[0].item.id).toBe('3')
  expect(result[0].matchedTags).toEqual(['web-api'])
})
```
**测试目标:** tags 数组中有匹配的关键词时应被包含
**验证:** 返回包含 'web-api' 标签的项，matchedTags 正确

#### Case 2.5: 大小写不敏感的匹配
```typescript
it('应该支持大小写不敏感的匹配', () => {
  const result = filterAndHighlight(mockData, 'REACT')
  expect(result).toHaveLength(1)
  expect(result[0].item.title).toBe('React Hooks Guide')
})
```
**测试目标:** 大写 keyword 应能匹配小写字段
**验证:** 'REACT' 能匹配 'React Hooks Guide'

#### Case 2.6: 无匹配时返回空数组
```typescript
it('应该在无匹配时返回空数组', () => {
  const result = filterAndHighlight(mockData, 'nonexistent')
  expect(result).toHaveLength(0)
})
```
**测试目标:** 无任何字段匹配时的处理
**验证:** 返回空数组

#### Case 2.7: titleSegments 分段正确
```typescript
it('应该确保 titleSegments 分段正确', () => {
  const result = filterAndHighlight(mockData, 'Hooks')
  expect(result).toHaveLength(1)
  const titleSegments = result[0].titleSegments
  expect(titleSegments.some((seg) => seg.isMatch && seg.text === 'Hooks')).toBe(true)
})
```
**测试目标:** 返回的分段中包含正确的匹配段
**验证:** 匹配段中包含 'Hooks' 并且 isMatch 为 true

---

### 测试组 3：useSearch Hook (7 cases)

React Hook 测试，验证搜索逻辑、防抖机制、状态管理。

**Mock 数据:**
```typescript
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
```

#### Case 3.1: 初始状态时 isEmpty 为 true，results 为空
```typescript
it('初始状态时 isEmpty 为 true，results 为空', () => {
  const { result } = renderHook(() => useSearch(mockData))
  expect(result.current.isEmpty).toBe(true)
  expect(result.current.results).toHaveLength(0)
  expect(result.current.query).toBe('')
  expect(result.current.debouncedQuery).toBe('')
})
```
**测试目标:** Hook 初始化时的正确状态
**验证:** 所有状态都是初始值（空）

#### Case 3.2: 设置 query 后 isSearching 为 true（防抖期间）
```typescript
it('设置 query 后 isSearching 为 true（防抖期间）', async () => {
  const { result } = renderHook(() => useSearch(mockData))

  act(() => {
    result.current.setQuery('React')
  })

  expect(result.current.query).toBe('React')
  expect(result.current.isSearching).toBe(true)
})
```
**测试目标:** setQuery 后 isSearching 立即为 true（防抖期间）
**验证:** query 更新，isSearching 为 true（防抖 300ms 期间）

#### Case 3.3: 防抖结束后 results 更新，isSearching 为 false
```typescript
it('防抖结束后 results 更新，isSearching 为 false', async () => {
  const { result } = renderHook(() => useSearch(mockData))

  act(() => {
    result.current.setQuery('React')
  })

  await waitFor(
    () => {
      expect(result.current.isSearching).toBe(false)
    },
    { timeout: 500 }
  )

  expect(result.current.debouncedQuery).toBe('React')
  expect(result.current.results.length).toBeGreaterThan(0)
})
```
**测试目标:** 防抖完成后 results 更新，isSearching 变为 false
**验证:** 等待 500ms 后，防抖完成，results 非空

#### Case 3.4: 清空 query 后回到初始状态
```typescript
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
  expect(result.current.results).toHaveLength(0)
})
```
**测试目标:** 清空 query 后恢复初始状态
**验证:** isEmpty 为 true，results 为空

#### Case 3.5: hasResults 在有结果时为 true
```typescript
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
```
**测试目标:** 有搜索结果时 hasResults 为 true
**验证:** 搜索 'React' 后 hasResults 为 true

#### Case 3.6: hasResults 在无结果时为 false
```typescript
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
```
**测试目标:** 无搜索结果时 hasResults 为 false
**验证:** 搜索不存在的关键词后 hasResults 为 false

---

## 第二部分：useSearchHistory.test.ts (17 cases)

### 测试组 4：deduplicateAndPrepend (5 cases)

纯函数测试，用于历史记录的去重、排序和容量限制。

#### Case 4.1: 向空历史添加第一条记录
```typescript
it('应该向空历史添加第一条记录', () => {
  const result = deduplicateAndPrepend([], 'React', 10)
  expect(result).toHaveLength(1)
  expect(result[0].keyword).toBe('React')
  expect(result[0].id).toBeDefined()
  expect(result[0].createdAt).toBeDefined()
})
```
**测试目标:** 向空数组添加记录时，应生成 id 和 timestamp
**验证:** 返回长度为 1 的数组，id 和 createdAt 都已生成

#### Case 4.2: 添加不重复的新记录，插入到头部
```typescript
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
```
**测试目标:** 新记录插入到头部，不影响其他记录顺序
**验证:** 新项在第 0 位，原有项向后移动

#### Case 4.3: 添加已存在的记录，移至头部并更新 id/timestamp
```typescript
it('应该添加已存在的记录，移至头部并更新 id/timestamp', () => {
  const existing: HistoryRecord[] = [
    { id: '1', keyword: 'TypeScript', createdAt: 1000 },
    { id: '2', keyword: 'React', createdAt: 2000 },
  ]
  const result = deduplicateAndPrepend(existing, 'React', 10)
  expect(result).toHaveLength(2)
  expect(result[0].keyword).toBe('React')
  expect(result[0].id).not.toBe('2')  // id 应该更新
  expect(result[1].keyword).toBe('TypeScript')
})
```
**测试目标:** 重复记录应移至头部，并获得新的 id 和 timestamp
**验证:** 记录数不变（2 条），但 'React' 移到第 0 位，id 更新

#### Case 4.4: 大小写不同视为相同 keyword 去重
```typescript
it('应该支持大小写不同视为相同 keyword 去重', () => {
  const existing: HistoryRecord[] = [
    { id: '1', keyword: 'React', createdAt: 1000 },
    { id: '2', keyword: 'TypeScript', createdAt: 2000 },
  ]
  const result = deduplicateAndPrepend(existing, 'react', 10)
  expect(result).toHaveLength(2)
  expect(result[0].keyword).toBe('react')  // 保留新的 keyword
  expect(result[1].keyword).toBe('TypeScript')
})
```
**测试目标:** 'React' 和 'react' 应被视为相同记录
**验证:** 仅返回 2 条，'react' 替代 'React'（保留新的写法）

#### Case 4.5: 超过 maxCount 时，截断末尾
```typescript
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
```
**测试目标:** 超过 maxCount 时截断末尾
**验证:** 从 10 条减为 5 条，最新的在头部，最旧的被移除

---

### 测试组 5：localStorage 读写 (4 cases)

使用 jsdom 提供的 localStorage mock，测试持久化逻辑。

#### Case 5.1: localStorage 为空时 loadHistoryFromStorage 返回空数组
```typescript
it('localStorage 为空时 loadHistoryFromStorage 返回空数组', () => {
  const result = loadHistoryFromStorage()
  expect(result).toEqual([])
})
```
**测试目标:** 无数据时返回空数组
**验证:** 返回 []

#### Case 5.2: localStorage 存在合法数据时正确反序列化
```typescript
it('localStorage 存在合法数据时正确反序列化', () => {
  const mockData: HistoryRecord[] = [
    { id: '1', keyword: 'React', createdAt: 1000 },
    { id: '2', keyword: 'TypeScript', createdAt: 2000 },
  ]
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

  const result = loadHistoryFromStorage()
  expect(result).toEqual(mockData)
})
```
**测试目标:** 正确反序列化存储的 JSON 数据
**验证:** 返回与存储数据相同的对象

#### Case 5.3: localStorage 存在非法 JSON 时返回空数组（不抛出异常）
```typescript
it('localStorage 存在非法 JSON 时返回空数组（不抛出异常）', () => {
  localStorage.setItem(HISTORY_STORAGE_KEY, 'invalid json{')

  expect(() => {
    loadHistoryFromStorage()
  }).not.toThrow()

  const result = loadHistoryFromStorage()
  expect(result).toEqual([])
})
```
**测试目标:** 错误处理 - 无效 JSON 不应抛出异常
**验证:** 函数不抛错，返回 []

#### Case 5.4: saveHistoryToStorage 将数组序列化写入 localStorage
```typescript
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
```
**测试目标:** 正确序列化和存储数据
**验证:** 从 localStorage 取出的数据与原数据相同

---

### 测试组 6：useSearchHistory Hook (8 cases)

React Hook 测试，验证历史管理的完整流程。

#### Case 6.1: 初始化时从 localStorage 读取历史
```typescript
it('初始化时从 localStorage 读取历史', () => {
  const mockData: HistoryRecord[] = [
    { id: '1', keyword: 'React', createdAt: 1000 },
    { id: '2', keyword: 'TypeScript', createdAt: 2000 },
  ]
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

  const { result } = renderHook(() => useSearchHistory())

  expect(result.current.history).toEqual(mockData)
})
```
**测试目标:** Hook 初始化时从 localStorage 加载历史
**验证:** history 与存储的数据相同

#### Case 6.2: addHistory 添加记录后，localStorage 同步更新
```typescript
it('addHistory 添加记录后，localStorage 同步更新', async () => {
  const { result } = renderHook(() => useSearchHistory())

  act(() => {
    result.current.addHistory('React')
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
  expect(stored).toBeDefined()
  const parsed = JSON.parse(stored!)
  expect(parsed).toHaveLength(1)
  expect(parsed[0].keyword).toBe('React')
})
```
**测试目标:** addHistory 后 localStorage 立即同步
**验证:** localStorage 中有新记录

#### Case 6.3: addHistory 空字符串不记录
```typescript
it('addHistory 空字符串不记录', () => {
  const { result } = renderHook(() => useSearchHistory())

  act(() => {
    result.current.addHistory('   ')  // 只有空格
  })

  expect(result.current.history).toHaveLength(0)
})
```
**测试目标:** 空或只有空格的字符串应被忽略
**验证:** history 保持为空

#### Case 6.4: removeHistory 删除指定 id 的记录
```typescript
it('removeHistory 删除指定 id 的记录', async () => {
  const mockData: HistoryRecord[] = [
    { id: '1', keyword: 'React', createdAt: 1000 },
    { id: '2', keyword: 'TypeScript', createdAt: 2000 },
  ]
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mockData))

  const { result } = renderHook(() => useSearchHistory())

  await new Promise((resolve) => setTimeout(resolve, 0))

  act(() => {
    result.current.removeHistory('1')
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(result.current.history).toHaveLength(1)
  expect(result.current.history[0].id).toBe('2')
})
```
**测试目标:** 按 id 删除指定记录
**验证:** 记录被删除，剩余记录正确

#### Case 6.5: clearHistory 清空所有记录并更新 localStorage
```typescript
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
```
**测试目标:** clearHistory 清空历史并同步 localStorage
**验证:** history 和 localStorage 都为空

#### Case 6.6: 连续 addHistory 10 条后，第 11 条挤出最旧一条
```typescript
it('连续 addHistory 10 条后，第 11 条挤出最旧一条', async () => {
  const { result } = renderHook(() => useSearchHistory(10))

  for (let i = 1; i <= 10; i++) {
    act(() => {
      result.current.addHistory(`Item${i}`)
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  expect(result.current.history).toHaveLength(10)

  act(() => {
    result.current.addHistory('Item11')
  })

  await new Promise((resolve) => setTimeout(resolve, 10))

  expect(result.current.history).toHaveLength(10)
  expect(result.current.history[0].keyword).toBe('Item11')
  expect(result.current.history.every((r) => r.keyword !== 'Item1')).toBe(true)
})
```
**测试目标:** maxCount 限制容量，超过时移除最旧的
**验证:** 保持 10 条，Item11 在头部，Item1 被移除

#### Case 6.7: maxCount 参数应该正确限制历史记录数量
```typescript
it('maxCount 参数应该正确限制历史记录数量', () => {
  const { result } = renderHook(() => useSearchHistory(5))

  for (let i = 1; i <= 6; i++) {
    act(() => {
      result.current.addHistory(`Item${i}`)
    })
  }

  expect(result.current.history.length).toBeLessThanOrEqual(5)
})
```
**测试目标:** maxCount 参数有效限制
**验证:** 6 条记录添加后，最多保留 5 条

#### Case 6.8: 重复添加同一关键词时，应该更新顺序而不增加数量
```typescript
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

  act(() => {
    result.current.addHistory('React')
  })
  await new Promise((resolve) => setTimeout(resolve, 10))

  expect(result.current.history).toHaveLength(2)
  expect(result.current.history[0].keyword).toBe('React')
  expect(result.current.history[1].keyword).toBe('TypeScript')
})
```
**测试目标:** 重复关键词时去重且更新顺序
**验证:** 记录数不变（2 条），顺序改变（React 移到头部）

---

## 总结统计

| 分类 | 文件 | Cases | 验证项目 |
|-----|-----|-------|--------|
| 纯函数 | useSearch.test.ts | 14 | 文本分段、过滤、高亮 |
| React Hook | useSearch.test.ts | 7 | 防抖、搜索、状态管理 |
| 纯函数 | useSearchHistory.test.ts | 5 | 去重、排序、容量 |
| localStorage | useSearchHistory.test.ts | 4 | 序列化、反序列化、错误处理 |
| React Hook | useSearchHistory.test.ts | 8 | 初始化、CRUD、同步 |
| **总计** | - | **38** | 完整的搜索和历史管理 |

---

## 测试执行指南

### 运行所有测试
```bash
pnpm test
```

### 运行特定文件
```bash
pnpm test useSearch.test.ts
pnpm test useSearchHistory.test.ts
```

### 运行特定测试组
```bash
pnpm test -t "splitTextIntoSegments"
pnpm test -t "useSearchHistory"
```

### 只运行特定 case
```bash
pnpm test -t "应该在头部匹配时正确分段"
```

### 监听模式开发
```bash
pnpm test:watch
```

### 生成覆盖率报告
```bash
pnpm test:coverage
```

---

**相关文档:**
- [Vitest 快速参考](./vitest-quick-reference-haiku4.5-20260326.md)
- [Vitest 详细总结](./vitest-setup-summary-haiku4.5-20260326.md)
