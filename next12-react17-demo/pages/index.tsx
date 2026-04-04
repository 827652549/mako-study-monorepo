import { FlightList } from './components/FlightList'
import dynamic from 'next/dynamic'

const FlightListDynamic = dynamic(() => import('./components/FlightList').then(mod => mod.FlightList), {
  ssr: false,
  loading: () => <p>loading...</p>
})

export default function Home(props: {
  flightIds: number[]
}) {
  return (
    <div>
      <h1>Hello Next.js 12 + React 17</h1>
      <FlightListDynamic flightIds={ props.flightIds }/>
    </div>
  )
}

// 服务端处理请求, 拿到res后, 发给客户端

export async function getServerSideProps() {
  const flightIds = await new Promise<number[]>((r) => {
    setTimeout(() => {
      r([ 1, 3, 5, 7, 9 ])
    }, 3000)
  })
  return {
    props: {
      flightIds,
    },
  }
}