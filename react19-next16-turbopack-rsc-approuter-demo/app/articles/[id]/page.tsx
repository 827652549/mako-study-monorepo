import ArticleBody from '@/app/articles/[id]/components/ArticleBody'
import LikeButton from '@/app/articles/[id]/components/LikeButton'
import CommentList from '@/app/articles/[id]/components/CommentList'
import Recommendations from '@/app/articles/[id]/components/Recommendations'
import { Suspense } from 'react'
export default function ArticleDetailPage() {
  return <div>文章详情
    <ArticleBody/>

    <LikeButton/>
    {/*<CommentList/>*/}
    {/*<CommentList/>*/}
    {/*<CommentList/>*/}
    <Suspense fallback={<span>🚗加载中...</span>}>
      <Recommendations/>
    </Suspense>
  </div>
}