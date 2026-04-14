// 'use client'
// // 防抖
// import { useCallback, useRef } from 'react'
//
// type AnyFunction = (...args: unknown[]) => unknown
// type DebounceTypeHook = (fn: AnyFunction, delay: number) => AnyFunction
// const useDebounce: DebounceTypeHook = (fn: AnyFunction, delay: number) => {
//   const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
//   const fnRef = useRef<AnyFunction>(undefined)
//   fnRef.current = fn
//   return useCallback(function (this: unknown, ...args) {
//     clearTimeout(timerRef.current)
//     timerRef.current = setTimeout(() => {
//       fnRef?.current?.call(this, ...args)
//     }, delay)
//   }, [ delay ])
// }
//
//
// export default function TempComponent() {
//   const fn = useDebounce(() => {
//     console.log('log')
//   }, 1000)
//
//   return <div>
//     <div onClick={ fn }>点击</div>
//     <div className>正</div>
//   </div>
//
//