练习需求：技术文章平台（mini）
场景选择理由：结构天然契合 RSC 分层，有慢速数据（推荐系统）、有交互（点赞/评论），能把所有核心概念都踩到。

页面结构
app/
layout.tsx              ← 导航栏（Server Component，持久化）
page.tsx                ← 文章列表页
articles/[id]/
page.tsx              ← 文章详情页
components/
ArticleBody.tsx     ← 文章正文（Server Component）
CommentList.tsx     ← 评论列表（Server Component，深层直接取数）
CommentForm.tsx     ← 发表评论（Client Component + Server Action）
LikeButton.tsx      ← 点赞（Client Component）
Recommendations.tsx ← 相关推荐（Server Component，故意慢3秒）

各模块要求
① 文章列表页 page.tsx
用 async/await 直接取数，不用 getServerSideProps，感受组件即数据层：
tsx// 目标写法
export default async function HomePage() {
const articles = await getArticles()  // 直接取，没有props
return <ArticleList articles={articles} />
}
② 文章详情页 — 体会 Streaming
用 Suspense 包裹慢速组件，让正文先出来，推荐后出来：
tsxexport default async function ArticlePage({ params }) {
const article = await getArticle(params.id)  // 快，正常速度

return (
<>
<ArticleBody article={article} />
<LikeButton articleId={params.id} />  {/* "use client" */}

      <Suspense fallback={<div>加载推荐中...</div>}>
        <Recommendations articleId={params.id} />  {/* 故意 sleep 3s */}
      </Suspense>

      <Suspense fallback={<div>加载评论中...</div>}>
        <CommentList articleId={params.id} />  {/* 深层Server Component，自己取数 */}
      </Suspense>

      <CommentForm articleId={params.id} />
    </>
)
}
③ CommentList — 体会深层组件直接取数
不需要从页面 props 下钻，自己取：
tsx// CommentList.tsx（Server Component）
export default async function CommentList({ articleId }) {
const comments = await getComments(articleId)  // 自己取，没有人传给它
return <ul>{comments.map(c => <li>{c.content}</li>)}</ul>
}
对比 Pages Router 你需要在 getServerSideProps 取完再传下来的写法，感受差异。
④ CommentForm — 体会 Server Action + useActionState
tsx'use client'
import { useActionState } from 'react'
import { submitComment } from '../actions'

export default function CommentForm({ articleId }) {
const [state, action, isPending] = useActionState(submitComment, null)

return (
<form action={action}>
<input type="hidden" name="articleId" value={articleId} />
<textarea name="content" placeholder="写下你的评论" />
{state?.error && <p style={{color:'red'}}>{state.error}</p>}
{state?.success && <p>评论成功！</p>}
<button disabled={isPending}>{isPending ? '提交中...' : '发表评论'}</button>
</form>
)
}
tsx// actions.ts
'use server'
export async function submitComment(prevState: any, formData: FormData) {
const content = formData.get('content') as string
const articleId = formData.get('articleId') as string

if (!content?.trim()) return { error: '评论不能为空' }

await saveComment({ articleId, content })  // 直接操作，不走API
return { success: true }
}
⑤ LikeButton — 体会 Client/Server 边界
tsx'use client'
import { useState } from 'react'

export default function LikeButton({ articleId }) {
const [liked, setLiked] = useState(false)

return (
<button onClick={() => setLiked(!liked)}>
{liked ? '❤️ 已点赞' : '🤍 点赞'}
</button>
)
}

数据 Mock
不需要真实数据库，直接 mock + sleep 模拟延迟：
tsx// lib/data.ts
export async function getArticles() {
await sleep(100)
return [
{ id: '1', title: 'React 19 新特性解析', author: 'Mako' },
{ id: '2', title: 'Next.js 16 全面升级', author: 'Mako' },
]
}

export async function getRecommendations(articleId: string) {
await sleep(3000)  // 故意慢，触发 Streaming
return [{ id: '2', title: 'Next.js 16 全面升级' }]
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
```

---

### 你要感受的核心对比

| 体感 | Pages Router 的写法 | App Router 的感受 |
|---|---|---|
| 取数位置 | 只能顶层 `getServerSideProps` | 任意组件直接 `async/await` |
| 慢速数据 | 整页等待 | Suspense 局部 loading |
| 表单提交 | 手写 `fetch('/api/...')` | 直接绑 Server Action |
| 客户端标记 | 默认就是客户端 | 要交互才加 `"use client"` |

---

### 半天时间分配
```
1h  →  搭项目骨架，跑通 Server Component 取数
1h  →  加 Suspense，观察 Streaming 效果（打开Network面板看瀑布）
1h  →  写 Server Action + useActionState 表单
30m →  整理：你踩了什么坑，和 Pages Router 有什么不同
最后那 30 分钟最重要，用自己的话总结出来，面试时才是真的你的东西。