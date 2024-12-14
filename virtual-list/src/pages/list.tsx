'use client'
import VirtualList from 'rc-virtual-list'
import { FlightCard } from '@/components/FlightCard'
import { ViewportList } from 'react-viewport-list'

import React, { useRef } from 'react'
import listStyles from './list.module.scss'

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
      // style={ { border: '1px solid red' } }
    >
      {/*{*/ }
      {/*  <VirtualList data={ flightList } itemKey={ 'id' } height={ 600 } itemHeight={ 100 }>*/ }
      {/*    { (item) => <FlightCard key={ item.id } height={ item.height }*/ }
      {/*                            rgb={ item.rgb }>{ (item.value + '') }</FlightCard> }*/ }
      {/*  </VirtualList>*/ }
      {/*}*/ }
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