import styles from './index.module.scss'
import { ReactNode } from 'react'

export default function FlightCard({ children, height, rgb }: {
  children: ReactNode, height: number, rgb: {
    r1: number,
    r2: number,
    r3: number
  }
}) {
  return (
    <div className={ styles.flightCard } style={ {
      background: `rgb(
        ${ rgb.r1 }, ${ rgb.r2 }, ${ rgb.r3 })`,
      height: height,
    } }>
      机票航班卡片{ children }
    </div>
  )
}
