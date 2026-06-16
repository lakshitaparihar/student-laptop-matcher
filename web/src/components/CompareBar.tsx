'use client'

import { useRouter } from 'next/navigation'
import { X, GitCompare } from 'lucide-react'
import { useCompare } from '@/context/compare'
import { formatPrice } from '@/lib/utils'

export default function CompareBar() {
  const { selected, remove, clear } = useCompare()
  const router = useRouter()

  if (selected.length === 0) return null

  const ids = selected.map((l) => l.id).join(',')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#FFE4EC] shadow-2xl shadow-[#FFB7C5]/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-[#7D6570] shrink-0">
          Compare ({selected.length}/3)
        </span>

        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {selected.map((laptop) => (
            <div
              key={laptop.id}
              className="flex items-center gap-1.5 bg-[#FFE4EC] border border-[#FFB7C5] rounded-xl px-2.5 py-1"
            >
              <span className="text-xs font-medium text-[#3A2A30] max-w-[140px] truncate">
                {laptop.name}
              </span>
              <span className="text-xs text-[#FF8FAB]">{formatPrice(laptop.price_inr)}</span>
              <button onClick={() => remove(laptop.id)} className="text-[#FFB7C5] hover:text-[#FF5C8D] transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {selected.length < 3 && (
            <div className="flex items-center border border-dashed border-[#FFB7C5] rounded-xl px-3 py-1">
              <span className="text-xs text-[#FFB7C5]">Add {3 - selected.length} more</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-sm text-[#7D6570] hover:text-[#FF5C8D] px-3 py-1.5 rounded-xl hover:bg-[#FFE4EC] transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => router.push(`/compare?ids=${ids}`)}
            disabled={selected.length < 2}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-sm font-semibold px-4 py-1.5 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            <GitCompare className="w-4 h-4" />
            Compare Now
          </button>
        </div>
      </div>
    </div>
  )
}
