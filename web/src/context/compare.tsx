'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Laptop } from '@/lib/types'

interface CompareContextValue {
  selected: Laptop[]
  add: (laptop: Laptop) => void
  remove: (id: number) => void
  toggle: (laptop: Laptop) => void
  isSelected: (id: number) => boolean
  clear: () => void
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Laptop[]>([])

  const add = useCallback((laptop: Laptop) => {
    setSelected((prev) =>
      prev.length < 3 && !prev.find((l) => l.id === laptop.id)
        ? [...prev, laptop]
        : prev
    )
  }, [])

  const remove = useCallback((id: number) => {
    setSelected((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const toggle = useCallback((laptop: Laptop) => {
    setSelected((prev) => {
      const exists = prev.find((l) => l.id === laptop.id)
      if (exists) return prev.filter((l) => l.id !== laptop.id)
      if (prev.length >= 3) return prev
      return [...prev, laptop]
    })
  }, [])

  const isSelected = useCallback(
    (id: number) => selected.some((l) => l.id === id),
    [selected]
  )

  const clear = useCallback(() => setSelected([]), [])

  return (
    <CompareContext.Provider
      value={{ selected, add, remove, toggle, isSelected, clear, isFull: selected.length >= 3 }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
