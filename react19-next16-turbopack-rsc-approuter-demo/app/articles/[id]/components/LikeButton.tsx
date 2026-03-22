'use client'
import { useEffect, useState } from 'react'

export default function LikeButton() {
  const [ isLike, setIsLike ] = useState(false)
  useEffect(() => {
    console.log('水合完成')
  }, [])
  return <div onClick={ () => {
    setIsLike(!isLike)
  } }>点赞按钮 Client Component <span>{ isLike ? '赞' : '未点赞' }</span></div>
}