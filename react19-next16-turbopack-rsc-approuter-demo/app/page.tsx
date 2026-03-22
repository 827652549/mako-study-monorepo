import ArticleDetailPage from '@/app/articles/[id]/page'

// 强制动态渲染，因为子组件包含动态内容
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="flex">
      <div>文章列表</div>
      <ArticleDetailPage/>
    </div>
  );
}
