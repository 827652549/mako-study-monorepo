import { getComments } from '@/app/api'

// 强制动态渲染，避免 build 后静态缓存

export default async function CommentList() {
  const comments = await getComments(Math.random().toString());
  return <div>评论列表 Server Component+深层取数, 取到了{comments}</div>
}