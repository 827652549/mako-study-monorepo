export function FlightList({ flightIds }: { flightIds: number[] }) {
  return <>
    {flightIds.map(e => <div>{ e }航班"</div>)}
  </>
}