'use client'

import React, { useRef } from 'react'
import listStyles from './list.module.scss'
import FlightCard from '@/components/FlightCard'
import { ViewportList } from '@/components/react-viewport-list-7-1-2-bugifx'
import Link from 'next/link'
const flightList = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  value: i + 'value',
  height: Math.floor(Math.random() * 200),
  rgb: {
    r1: Math.floor(Math.random() * 255),
    r2: Math.floor(Math.random() * 255),
    r3: Math.floor(Math.random() * 255),
  },
}))
export default function List({list=flightList}) {

  const ref1 = useRef<HTMLDivElement | null>(
    null,
  )
  const listRef1 = useRef(null);

  return (
    <>
      <li style={{fontSize:'18px'}}><Link href={ '/list' }>use「npm:react-viewport-list7-1-2」</Link></li>
      <li style={{fontSize:'18px'}}><Link href={ '/listbugfix' }>use「npm:react-viewport-list7-1-2-bugfixed」</Link></li>
      <div style={{fontSize:'25px'}}>fixed</div>
      <p style={{fontSize:'18px'}}>in ios native, refresh page, and scroll some items, then click the button</p>
      <div
        style={{display:'flex', flexDirection:"row"}}
      >
        <div>
          <button onClick={
            ()=>{
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              listRef1.current.scrollToIndex({
                index: 0,
                // offset: 0,
              });}
          }>Back to Index 0</button>

          <div className={ listStyles.list } ref={ ref1 } style={ { border: '1px solid red' } }>
            <ViewportList
              ref={listRef1}
              viewportRef={ ref1 }
              items={ list }
            >
              { (item) => <FlightCard key={ item.id } height={ item.height }
                                      rgb={ item.rgb }>{ (item.value + '') }</FlightCard> }

            </ViewportList>
          </div>
        </div>
      </div>
    </>

  )
}