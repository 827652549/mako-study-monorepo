'use client'

import { use, useEffect, useRef } from 'react'
import { ViewportList } from '@/app/flightlist/lib'

const fetchSearchFlightList = async () => {
  return new Promise<number[]>((r) => {
    setTimeout(() => {
      r([ 2, 4, 5, 8, 9, 67 ])
    }, 3000)
  })
}
// const promise = fetchSearchFlightList()
const FlightList = () => {
  const ref = useRef<HTMLDivElement | null>(
    null,
  )

  const flightIds = use(fetchSearchFlightList())
  const ssrRender = <>
    { flightIds.map(e => <div key={ e }>{ e }---航班</div>) }
  </>

  const virtualListRender = <ViewportList viewportRef={ ref } items={flightIds}>{
    (flt, index) => <div>{ flt } + { index }</div>
  }</ViewportList>

  // useEffect(() => {
  //
  // }, [])
  return virtualListRender
}
export default FlightList