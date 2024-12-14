'use client'
import { ViewportList } from 'react-viewport-list'

import React, { useRef } from 'react'
import listStyles from './list.module.scss'
import FlightCard from '@/components/FlightCard'

export default function List() {
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
  const ref = useRef<HTMLDivElement | null>(
    null,
  )
  return (
    <div
    >
      <div className={ listStyles.list } ref={ ref } style={ { border: '1px solid red' } }>
        <ViewportList
          viewportRef={ ref }
          items={ flightList }
        >
          { (item) => <FlightCard key={ item.id } height={ item.height }
                                  rgb={ item.rgb }>{ (item.value + '') }</FlightCard> }

        </ViewportList>
      </div>
    </div>
  )
}