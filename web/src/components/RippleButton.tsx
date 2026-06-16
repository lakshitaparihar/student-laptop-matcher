'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Ripple { id: number; x: number; y: number }

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function RippleButton({
  children, onClick, className, variant = 'primary', disabled, ...props
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700)
    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden transition-all duration-200 font-semibold select-none',
        variant === 'primary' && [
          'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white',
          'shadow-lg shadow-[#FFB7C5]/50',
          'hover:shadow-xl hover:shadow-[#FF8FAB]/40 hover:-translate-y-0.5',
          'active:translate-y-0',
        ],
        variant === 'secondary' && [
          'bg-white border-2 border-[#FFE4EC] text-[#FF5C8D]',
          'hover:border-[#FFB7C5] hover:bg-[#FFF8FB]',
        ],
        variant === 'ghost' && 'text-[#FF5C8D] hover:bg-[#FFF8FB]',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
      {ripples.map(({ id, x, y }) => (
        <span
          key={id}
          className="animate-ripple absolute pointer-events-none rounded-full bg-white/35"
          style={{ left: x, top: y, width: 20, height: 20 }}
        />
      ))}
    </button>
  )
}
