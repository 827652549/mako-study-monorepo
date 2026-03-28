'use client'
import { useEffect, useRef, useState } from 'react'
import SearchContainer from '@/features/search/components/SearchContainer'
import { SEARCH_MOCK_DATA } from '@/features/search/mockData'

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

export default function PlaygroundPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">React Playground</h1>
        <CountComponent />
      </div>
      <hr className="border-gray-200" />
      <SearchContainer data={SEARCH_MOCK_DATA} />
    </div>
  )
}