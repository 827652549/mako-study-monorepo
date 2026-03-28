import { Suspense } from 'react'
import FlightList from '@/app/flightlist/FlightList'


const FLightListComponent = () => {
  return <>
    Header
    <Suspense fallback="loading...">
      <FlightList/>
    </Suspense>
  </>
}

export default FLightListComponent