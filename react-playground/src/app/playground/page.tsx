'use client'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

const usePrevious = (state) => {
  const ref = useRef(undefined)
  useEffect(() => {
    ref.current = state
  })
  return ref.current
}

const CountComponent = () => {
  const [ name, setName ] = useState('tom')
  const countRef = useRef<number>(10)
  const [ countState, setCountState ] = useState(countRef.current)
  useEffect(() => {
    const timer = setInterval(() => {
      countRef.current = countRef.current - 1
      setCountState(countRef.current)
      if (countRef.current <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const { items } = useContext(ShoppingCartContext)
  const url = ''
  const numberOfItems = items.length

  function APage() {
    const onNavigate = useEffectEvent((visitedUrl) => {
      logVisit(visitedUrl, numberOfItems)
    })

    useEffect(() => {
      onNavigate(url)
    }, [ url ])

    //...
  }


  return (<div>
    <button onClick={ () => {
      setName('mako')
    } }>切换tom为mako
    </button>
    <div>
      <p>name:{ name }</p>
      <p>count: { countState }</p>
    </div>
  </div>)
}
export default CountComponent