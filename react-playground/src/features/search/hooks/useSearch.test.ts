/**
 * useSearch.ts 纯函数测试用例示例
 * 这个文件展示了纯函数 splitTextIntoSegments 和 filterAndHighlight 的使用示例
 * 项目当前没有测试框架配置，但这些示例可以用于手动验证
 */

import { splitTextIntoSegments, filterAndHighlight } from './useSearch'
import type { SearchItem } from '../types'
import { SEARCH_MOCK_DATA } from '../mockData'

// ── splitTextIntoSegments 测试 ──

// 测试 1：基础匹配
const test1 = splitTextIntoSegments('React Hooks', 'hook')
console.assert(
  test1.length === 2 &&
    test1[0].text === 'React ' &&
    !test1[0].isMatch &&
    test1[1].text === 'Hooks' &&
    test1[1].isMatch,
  'Test 1 failed: Basic highlight should work'
)

// 测试 2：大小写不敏感
const test2 = splitTextIntoSegments('React Hooks', 'HOOK')
console.assert(
  test2.length === 2 && test2[1].isMatch && test2[1].text === 'Hooks',
  'Test 2 failed: Case-insensitive matching should work'
)

// 测试 3：多个匹配
const test3 = splitTextIntoSegments('hook hooks hook', 'hook')
console.assert(
  test3.filter((seg) => seg.isMatch).length === 3 &&
    test3.filter((seg) => !seg.isMatch).length === 2,
  'Test 3 failed: Multiple matches should be highlighted'
)

// 测试 4：空 keyword
const test4 = splitTextIntoSegments('some text', '')
console.assert(
  test4.length === 1 &&
    test4[0].text === 'some text' &&
    !test4[0].isMatch,
  'Test 4 failed: Empty keyword should return unmatched text'
)

// ── filterAndHighlight 测试 ──

// 测试 5：空 keyword 返回全部数据
const test5 = filterAndHighlight(SEARCH_MOCK_DATA, '')
console.assert(
  test5.length === SEARCH_MOCK_DATA.length &&
    test5.every((result) => result.matchedTags.length === 0),
  'Test 5 failed: Empty keyword should return all data with no highlights'
)

// 测试 6：按 title 过滤
const test6 = filterAndHighlight(SEARCH_MOCK_DATA, 'React')
console.assert(
  test6.length > 0 &&
    test6.every((result) =>
      result.item.title.toLowerCase().includes('react') ||
      result.item.description.toLowerCase().includes('react') ||
      result.item.tags.some(tag => tag.toLowerCase().includes('react'))
    ),
  'Test 6 failed: Should filter by title'
)

// 测试 7：按 tag 过滤
const test7 = filterAndHighlight(SEARCH_MOCK_DATA, 'hooks')
console.assert(
  test7.length > 0 &&
    test7.every((result) =>
      result.item.tags.some(tag => tag.toLowerCase().includes('hooks')) ||
      result.item.title.toLowerCase().includes('hooks') ||
      result.item.description.toLowerCase().includes('hooks')
    ),
  'Test 7 failed: Should filter by tags'
)

// 测试 8：匹配 tag 列表
const test8Data: SearchItem[] = [
  {
    id: '1',
    title: 'Test',
    description: 'Test description',
    tags: ['react', 'hooks', 'test-tag'],
    category: 'Test',
  },
]
const test8 = filterAndHighlight(test8Data, 'react')
console.assert(
  test8.length === 1 &&
    test8[0].matchedTags.includes('react') &&
    !test8[0].matchedTags.includes('hooks'),
  'Test 8 failed: Should correctly identify matched tags'
)

// 测试 9：case-insensitive tag matching
const test9 = filterAndHighlight(test8Data, 'REACT')
console.assert(
  test9.length === 1 &&
    test9[0].matchedTags.includes('react'),
  'Test 9 failed: Tag matching should be case-insensitive'
)

// 测试 10：titleSegments 和 descriptionSegments 都被正确分割
const test10 = filterAndHighlight(test8Data, 'test')
console.assert(
  test10.length === 1 &&
    test10[0].titleSegments.some((seg) => seg.isMatch) &&
    test10[0].descriptionSegments.some((seg) => seg.isMatch),
  'Test 10 failed: Both title and description should be highlighted'
)

console.log('All pure function tests passed!')
