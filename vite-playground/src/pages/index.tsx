import { useState } from 'react'

function Sub1() {
  return <div>sub1</div>
}

function Sub2() {
  const [ s, setS ] = useState(10)

  return <div>
    <button onClick={ () => {
      setS(s => s + 1)
    } }>点我
    </button>
    sub2+{ s }</div>
}
export default function Index() {
  return <div>
    Hello World

    <Sub2/>
    <Sub1/>
  </div>
}
