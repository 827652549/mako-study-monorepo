'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={ { border: '1px solid red' } }>
      <ul>
        <li style={{fontSize:'18px'}}><Link href={ '/list' }>use「npm:react-viewport-list7-1-2」</Link></li>
        <li style={{fontSize:'18px'}}><Link href={ '/listbugfix' }>use「npm:react-viewport-list7-1-2-bugfix」</Link></li>
      </ul>
    </div>
  )
}
