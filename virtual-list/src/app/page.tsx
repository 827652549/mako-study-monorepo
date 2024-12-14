'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={ { border: '1px solid red' } }>
      <p>动态高度虚拟列表页</p>
      <ul>
        <li><Link href={ '/list' }>使用「npm:react-viewport-list」</Link></li>
        <li><Link href={ '/listbug' }>有bug,使用npm「rc-virtual-list」</Link></li>
      </ul>
    </div>
  )
}
