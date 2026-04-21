'use client'
import { useEffect, useLayoutEffect, useState } from 'react'

// react 19

export default function Page() {
  const [ s, setS ] = useState(0)

  function onClick() {
    setS(s => s + 1)
    Promise.resolve().then(() => {
      setS(s => s + 1)
    })
    setTimeout(() => {
      setS(s => s + 1)
    }, 0)
  }

  useEffect(() => {
    console.log('useEffect')
  })

  useLayoutEffect(() => {
    console.log('useLayoutEffect')
  })

  return (<button onClick={ onClick }>{s}</button>)
}