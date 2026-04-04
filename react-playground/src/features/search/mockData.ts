import { SearchItem } from './types'

export const SEARCH_MOCK_DATA: SearchItem[] = [
  {
    id: '1',
    title: 'React Hooks 完整指南',
    description: '深入讲解 useState、useEffect、useRef 等核心 Hook 的使用方式和最佳实践',
    tags: ['react', 'hooks', 'frontend'],
    category: 'React',
  },
  {
    id: '2',
    title: '理解 useEffect 的执行时机',
    description: 'useEffect 的依赖数组、清理函数以及常见的副作用处理模式详解',
    tags: ['react', 'useEffect', 'lifecycle'],
    category: 'React',
  },
  {
    id: '3',
    title: 'TypeScript 泛型入门',
    description: '从零开始学习 TypeScript 泛型，掌握泛型函数、泛型接口和泛型约束',
    tags: ['typescript', 'generics', 'types'],
    category: 'TypeScript',
  },
  {
    id: '4',
    title: 'Next.js App Router 完全解析',
    description: 'Next.js 13+ App Router 架构介绍，包括 Server Components、路由约定和数据获取',
    tags: ['nextjs', 'app-router', 'server-components'],
    category: 'Next.js',
  },
  {
    id: '5',
    title: 'Tailwind CSS 实战技巧',
    description: '常用的 Tailwind CSS 布局技巧，包括 Flexbox、Grid 以及响应式设计',
    tags: ['tailwind', 'css', 'styling'],
    category: 'CSS',
  },
  {
    id: '6',
    title: '自定义 React Hook 设计模式',
    description: '如何提取业务逻辑到自定义 Hook，实现逻辑复用和关注点分离',
    tags: ['react', 'hooks', 'design-pattern'],
    category: 'React',
  },
  {
    id: '7',
    title: 'localStorage 与 sessionStorage 的区别',
    description: '浏览器存储 API 对比：持久化时间、容量限制和使用场景选择',
    tags: ['browser', 'storage', 'web-api'],
    category: 'Web API',
  },
  {
    id: '8',
    title: 'TypeScript 类型体操入门',
    description: '学习条件类型、映射类型、infer 关键字等高级 TypeScript 类型操作',
    tags: ['typescript', 'advanced', 'types'],
    category: 'TypeScript',
  },
]
