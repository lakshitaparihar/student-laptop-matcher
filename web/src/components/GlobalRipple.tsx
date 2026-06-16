'use client'

import { useEffect } from 'react'

export default function GlobalRipple() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('button, a, [role="button"]') as HTMLElement | null
      if (!target) return

      const computed = window.getComputedStyle(target)
      if (computed.position === 'static') target.style.position = 'relative'
      if (computed.overflow === 'visible') target.style.overflow = 'hidden'

      const rect = target.getBoundingClientRect()
      const span = document.createElement('span')
      span.className = 'animate-ripple'
      Object.assign(span.style, {
        position: 'absolute',
        left: `${e.clientX - rect.left}px`,
        top: `${e.clientY - rect.top}px`,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.38)',
        pointerEvents: 'none',
        zIndex: '9999',
      })
      target.appendChild(span)
      setTimeout(() => span.remove(), 700)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
