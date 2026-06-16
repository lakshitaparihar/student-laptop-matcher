'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANDS = ['ASUS', 'Lenovo', 'HP', 'Dell', 'Acer', 'Apple', 'MSI', 'Samsung', 'Motorola', 'Honor']
const SEGMENTS = ['Budget', 'Mid Range', 'Upper Mid', 'Premium']
const RAM_OPTIONS = ['8', '16', '24', '32']
const GPU_TYPES = ['Integrated', 'Dedicated']
const DISPLAY_TYPES = ['IPS', 'OLED', 'OLED (Touch)', 'IPS (Touch)']
const SORT_OPTIONS = [
  { value: 'price_asc',     label: 'Price: Low to High' },
  { value: 'price_desc',    label: 'Price: High to Low' },
  { value: 'score_desc',    label: 'Best Score' },
  { value: 'battery_desc',  label: 'Best Battery' },
  { value: 'weight_asc',    label: 'Lightest' },
]

function CheckItem({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-[#FFB7C5] text-[#FF5C8D] accent-[#FF5C8D] focus:ring-[#FFD6E0]"
      />
      <span className={cn('text-sm', checked ? 'text-[#3A2A30] font-semibold' : 'text-[#7D6570] group-hover:text-[#3A2A30]')}>
        {label}
      </span>
    </label>
  )
}

export default function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const toggleMulti = useCallback(
    (key: string, val: string, checked: boolean) => {
      const current = searchParams.get(key)?.split(',').filter(Boolean) ?? []
      const next = checked ? [...current, val] : current.filter((v) => v !== val)
      update(key, next.length ? next.join(',') : null)
    },
    [searchParams, update]
  )

  const hasMulti = (key: string, val: string) =>
    (searchParams.get(key)?.split(',') ?? []).includes(val)

  const activeFilters = Array.from(searchParams.keys()).filter((k) => k !== 'sort' && k !== 'page')

  return (
    <aside className="w-56 shrink-0 space-y-5">
      {/* active filter count + clear */}
      {activeFilters.length > 0 && (
        <button
          onClick={() => router.push(pathname, { scroll: false })}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5C8D] hover:text-[#FF8FAB]"
        >
          <X className="w-3 h-3" />
          Clear {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''}
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">Sort by</h3>
        <select
          value={searchParams.get('sort') ?? 'score_desc'}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full text-sm border border-[#FFE4EC] rounded-lg px-2 py-1.5 text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">Brand</h3>
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <CheckItem
              key={b}
              label={b}
              checked={hasMulti('brand', b)}
              onChange={(v) => toggleMulti('brand', b, v)}
            />
          ))}
        </div>
      </div>

      {/* Segment */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">Budget</h3>
        <div className="space-y-1.5">
          {SEGMENTS.map((s) => (
            <CheckItem
              key={s}
              label={s}
              checked={hasMulti('segment', s)}
              onChange={(v) => toggleMulti('segment', s, v)}
            />
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">RAM</h3>
        <div className="space-y-1.5">
          {RAM_OPTIONS.map((r) => (
            <CheckItem
              key={r}
              label={`${r} GB`}
              checked={hasMulti('ram', r)}
              onChange={(v) => toggleMulti('ram', r, v)}
            />
          ))}
        </div>
      </div>

      {/* GPU Type */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">GPU Type</h3>
        <div className="space-y-1.5">
          {GPU_TYPES.map((g) => (
            <CheckItem
              key={g}
              label={g}
              checked={hasMulti('gpu', g)}
              onChange={(v) => toggleMulti('gpu', g, v)}
            />
          ))}
        </div>
      </div>

      {/* Display */}
      <div>
        <h3 className="text-xs font-semibold text-[#7D6570] uppercase tracking-wide mb-2">Display</h3>
        <div className="space-y-1.5">
          {DISPLAY_TYPES.map((d) => (
            <CheckItem
              key={d}
              label={d}
              checked={hasMulti('display', d)}
              onChange={(v) => toggleMulti('display', d, v)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
