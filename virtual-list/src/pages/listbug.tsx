'use client'
import React from 'react'
import VirtualList from 'rc-virtual-list'
import { Index } from '@/components/FlightCard'

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

  return (
    <div>
      <VirtualList data={ flightList } itemKey={ 'id' } height={ 600 } itemHeight={ 100 }>
        { (item) => <Index key={ item.id } height={ item.height }
                           rgb={ item.rgb }>{ (item.value + '') }</Index> }
      </VirtualList>
    </div>)
}