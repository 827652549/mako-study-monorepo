import ArticleDetailPage from '@/app/articles/[id]/page'
import Link from 'next/link'

// 强制动态渲染，因为子组件包含动态内容
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="flex">
      <Link href="/flightlist">点我 Link 到航班列表页</Link>
      <div>文章列表</div>
      <ArticleDetailPage/>
    </div>
  );
}
