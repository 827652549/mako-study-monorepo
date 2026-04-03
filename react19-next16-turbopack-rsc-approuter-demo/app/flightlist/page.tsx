import { Suspense } from 'react'
import FlightList from '@/app/flightlist/FlightList'


const FLightListComponent = async () => {
  const fetchSearchFlightList = async () => {
    return new Promise<number[]>((r) => {
      setTimeout(() => {
        r([ 2, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67, 4, 5, 8, 9, 67 ])
      }, 1000)
    })
  }

  const flightIdsPromise = fetchSearchFlightList()
  return <>
    <h1>Header</h1>
    <FlightList flightIdsPromise={ flightIdsPromise }/>
  </>
}

export default FLightListComponent