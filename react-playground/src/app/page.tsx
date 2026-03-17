'use client'
import { useState, useCallback, useRef, useLayoutEffect } from 'react'

const products = [
  { id: 1, emoji: '⌚', name: 'Minimal Watch', price: '¥2,890', bg: 'linear-gradient(135deg,#667eea,#764ba2)', tag: 'NEW ARRIVAL', desc: 'A minimalist design with premium materials. Features sapphire crystal, Swiss movement, and 50m water resistance.' },
  { id: 2, emoji: '🏺', name: 'Ceramic Vase',  price: '¥680',   bg: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'HANDCRAFTED', desc: 'Hand-thrown ceramic vase with organic shape. Each piece is unique with subtle glaze variations.' },
  { id: 3, emoji: '👟', name: 'Running Shoe',  price: '¥1,299', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', tag: 'PERFORMANCE', desc: 'Lightweight running shoe with responsive cushioning. Breathable mesh upper and durable rubber outsole.' },
  { id: 4, emoji: '🧥', name: 'Linen Jacket',  price: '¥3,200', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)', tag: 'SUMMER COLLECTION', desc: 'Relaxed-fit linen jacket perfect for warm weather. Unlined for breathability with natural texture.' },
  { id: 5, emoji: '💍', name: 'Gold Ring',     price: '¥5,600', bg: 'linear-gradient(135deg,#fa709a,#fee140)', tag: 'FINE JEWELRY', desc: '18k solid gold ring with brushed finish. Minimalist design suitable for everyday wear.' },
  { id: 6, emoji: '🪨', name: 'Stone Bowl',    price: '¥420',   bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', tag: 'ZEN HOME', desc: 'Natural stone bowl carved from single piece of granite. Perfect for incense or small items.' },
]

export default function ListPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const listViewRef = useRef<HTMLDivElement>(null)
  const detailViewRef = useRef<HTMLDivElement>(null)

  const selectedProduct = products.find(p => p.id === selectedId)

  // 使用 useLayoutEffect 来处理 View Transition
  useLayoutEffect(() => {
    // 如果没有 View Transition API，直接返回
    if (!document.startViewTransition) {
      return
    }

    const goingToDetail = selectedId !== null

    // 获取所有卡片元素
    const listCardImages = listViewRef.current?.querySelectorAll<HTMLElement>('[data-transition-name]')
    const detailCardImages = detailViewRef.current?.querySelectorAll<HTMLElement>('[data-transition-name]')

    if (goingToDetail) {
      // 进入详情页：
      // 1. 在 View Transition 捕获前移除列表视图的 view-transition-name
      listCardImages?.forEach(card => {
        card.style.viewTransitionName = ''
      })
      // 2. 预先设置详情视图目标卡片的 view-transition-name
      const targetCard = detailViewRef.current?.querySelector<HTMLElement>(`[data-transition-name="block-${selectedId}"]`)
      if (targetCard) {
        targetCard.style.viewTransitionName = `block-${selectedId}`
      }
    } else {
      // 返回列表：
      // 1. 在 View Transition 捕获前移除详情视图的 view-transition-name
      detailCardImages?.forEach(card => {
        card.style.viewTransitionName = ''
      })
      // 2. 恢复列表视图的 view-transition-name
      listCardImages?.forEach(card => {
        card.style.viewTransitionName = card.dataset.transitionName || ''
      })
    }

    // 使用 requestAnimationFrame 确保 DOM 更新已经应用
    requestAnimationFrame(() => {
      const transition = document.startViewTransition(() => {
        // 在 callback 中切换可见性
        if (goingToDetail) {
          // 显示详情视图，隐藏列表视图
          if (detailViewRef.current) {
            detailViewRef.current.style.visibility = 'visible'
            detailViewRef.current.style.position = 'static'
          }
          if (listViewRef.current) {
            listViewRef.current.style.visibility = 'hidden'
            listViewRef.current.style.position = 'absolute'
          }
        } else {
          // 显示列表视图，隐藏详情视图
          if (listViewRef.current) {
            listViewRef.current.style.visibility = 'visible'
            listViewRef.current.style.position = 'static'
          }
          if (detailViewRef.current) {
            detailViewRef.current.style.visibility = 'hidden'
            detailViewRef.current.style.position = 'absolute'
          }
        }
      })

      transition.finished.then(() => {
        console.log('[VT] Animation finished')
      })
    })
  }, [selectedId])

  const goToDetail = useCallback((id: number) => {
    setSelectedId(id)
  }, [])

  const goBack = useCallback(() => {
    setSelectedId(null)
  }, [])

  return (
    <div style={{ background: '#111', minHeight: '100vh', padding: 32, color: '#f0ede8' }}>
      {/* 列表视图 */}
      <div ref={listViewRef} style={{ visibility: selectedId ? 'hidden' : 'visible', position: selectedId ? 'absolute' : 'static' }}>
        <h1 style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>
          View Transitions Demo — 点击卡片
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 600 }}>
          {products.map(p => (
            <div
              key={p.id}
              onClick={() => goToDetail(p.id)}
              style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: '#1c1c1c', border: '1px solid #2a2a2a' }}
            >
              <div style={{
                background: p.bg,
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                viewTransitionName: `block-${p.id}`,
              }} data-transition-name={`block-${p.id}`}>
                {p.emoji}
              </div>
              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 详情视图 - 始终渲染在 DOM 中，但默认隐藏 */}
      <div
        ref={detailViewRef}
        style={{ visibility: 'hidden', position: 'absolute', gap: 32, maxWidth: 600, alignItems: 'flex-start' }}
      >
        {products.map(p => (
          <div key={p.id} style={{ display: selectedId === p.id ? 'flex' : 'none', width: '100%' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 180,
                flexShrink: 0,
                aspectRatio: '1/1',
                borderRadius: 10,
                background: p.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                viewTransitionName: `block-${p.id}`,
                cursor: 'pointer',
              }}
              data-transition-name={`block-${p.id}`}
              onClick={goBack}
            >
              {p.emoji}
            </div>

            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>
                {p.tag}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, marginBottom: 10 }}>{p.name}</div>
              <div style={{ fontSize: 20, fontWeight: 300, color: '#c8b89a', marginBottom: 16 }}>{p.price}</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: '#666', marginBottom: 28 }}>{p.desc}</div>
              <button
                onClick={goBack}
                style={{
                  background: 'none', border: '1px solid #333', color: '#666',
                  fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                  padding: '8px 16px', borderRadius: 6, cursor: 'pointer'
                }}
              >
                ← 返回列表
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
