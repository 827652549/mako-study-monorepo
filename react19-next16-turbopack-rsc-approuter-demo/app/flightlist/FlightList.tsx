'use client'

import { use, useRef } from 'react'
import { ViewportList } from '@/app/flightlist/lib'

const FlightList = ({flightIdsPromise}) => {
  const flightIds = use<number[]>(flightIdsPromise);
  const ref = useRef<HTMLDivElement | null>(
    null,
  )

  const ssrRender = <>
    { flightIds?.map(e => <div key={ e }>{ e }---航班</div>) }
  </>

  const virtualListRender = <div
    ref={ref}
    style={{
      height: '200px',
      overflow: 'auto',
      border: '1px solid #ccc'
    }}
  >
    <ViewportList
      viewportRef={ ref }
      items={flightIds}
      // itemSize={66}
      // overscan={1}
    >
      {(flt, index) => <div style={{ height: '50px', padding: '8px' }} key={index}>{ flt } + { index }</div>}
    </ViewportList>
  </div>

  // useEffect(() => {
  //
  // }, [])
  return virtualListRender
}
export default FlightList