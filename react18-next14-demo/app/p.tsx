'use client'
import { StrictMode, useEffect, useLayoutEffect, useState } from 'react'

const C = function () {
  const [ s, setS ] = useState(0)

  function onClick() {
    setS(s => s + 1)
    Promise.resolve().then(() => {
      setS(s => {
        console.log('p')
        return s + 1
      })
    })
    setTimeout(() => {
      setS(s => {
        console.log('setTimeout')
        return s + 1
      })
    }, 0)
  }

  useEffect(() => {
    console.log('useEffect')
  })

  useLayoutEffect(() => {
    console.log('useLayoutEffect')
  })
  return (<button onClick={ onClick }>{ s }</button>)

}
// react 19

export default function Page() {
  return <StrictMode>
    <C/>
  </StrictMode>
}
