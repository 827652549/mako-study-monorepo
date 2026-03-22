import { use } from 'react'

export default function Recommendations() {
  const r = use(new Promise<string>((r)=>{
    setTimeout(()=>{
      r("慢组件res")
    },5000)
  }))
  return <div>相关推荐 Server Component 慢组件{r}</div>
}