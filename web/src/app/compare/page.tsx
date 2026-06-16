import { Suspense } from 'react'
import Link from 'next/link'
import { Check, X, GitCompare, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Laptop } from '@/lib/types'
import { formatPriceExact, scoreColor, scoreBg, sentimentColor, cn } from '@/lib/utils'
import ScoreBar from '@/components/ScoreBar'

interface Props {
  searchParams: Promise<{ ids?: string }>
}

const SCORE_ROWS: { label: string; field: keyof Laptop }[] = [
  { label: 'AI/ML',          field: 'ai_ml_score' },
  { label: 'Computer Science', field: 'coding_score' },
  { label: 'Mechanical',     field: 'mechanical_score' },
  { label: 'Civil',          field: 'civil_score' },
  { label: 'Electronics',    field: 'electronics_score' },
  { label: 'MBA',            field: 'mba_score' },
  { label: 'Marketing',      field: 'marketing_score' },
  { label: 'Design',         field: 'design_score' },
  { label: 'Gaming',         field: 'gaming_score' },
  { label: 'Future-proof',   field: 'future_proof_score' },
  { label: 'Battery',        field: 'estimated_battery_score' },
  { label: 'Portability',    field: 'estimated_portability_score' },
]

const SPEC_ROWS: { label: string; render: (l: Laptop) => string }[] = [
  { label: 'Price',         render: (l) => formatPriceExact(l.price_inr) },
  { label: 'Segment',       render: (l) => l.price_segment },
  { label: 'CPU',           render: (l) => l.cpu },
  { label: 'CPU Gen',       render: (l) => l.cpu_generation },
  { label: 'RAM',           render: (l) => `${l.ram_gb} GB${l.ram_upgradeable ? ' ✓' : ''}` },
  { label: 'Storage',       render: (l) => `${l.storage}${l.storage_upgradeable ? ' ✓' : ''}` },
  { label: 'GPU',           render: (l) => l.gpu },
  { label: 'GPU Type',      render: (l) => l.gpu_type },
  { label: 'Screen',        render: (l) => `${l.screen_size}" ${l.screen_resolution}` },
  { label: 'Display',       render: (l) => l.display_type },
  { label: 'Refresh Rate',  render: (l) => `${l.refresh_rate} Hz` },
  { label: 'Battery',       render: (l) => `${l.battery_wh} Wh` },
  { label: 'Weight',        render: (l) => `${l.weight_kg} kg` },
  { label: 'Availability',  render: (l) => l.india_availability },
  { label: 'Community',     render: (l) => l.community_sentiment },
]

function BoolCell({ v }: { v: boolean }) {
  return v
    ? <Check className="w-4 h-4 text-[#FF5C8D] mx-auto" />
    : <X className="w-4 h-4 text-[#FF8FAB] mx-auto" />
}

function bestIdx(laptops: Laptop[], field: keyof Laptop): number {
  let best = -1, bestVal = -Infinity
  laptops.forEach((l, i) => {
    const v = l[field] as number
    if (v > bestVal) { bestVal = v; best = i }
  })
  return best
}

async function CompareTable({ laptops }: { laptops: Laptop[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left py-3 pr-4 font-semibold text-[#7D6570] text-xs uppercase tracking-wide w-36">
              Laptop
            </th>
            {laptops.map((l) => (
              <th key={l.id} className="py-3 px-3 text-left min-w-[180px]">
                <div className="font-black text-[#3A2A30] text-sm leading-tight">{l.name}</div>
                <div className="font-bold text-[#FF5C8D]">{formatPriceExact(l.price_inr)}</div>
                <span className={cn('inline-block text-xs px-2 py-0.5 rounded-full mt-1', sentimentColor(l.community_sentiment))}>
                  {l.community_sentiment}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Score section */}
          <tr><td colSpan={laptops.length + 1} className="py-3 pt-5">
            <div className="text-xs font-bold text-[#7D6570] uppercase tracking-wide border-b border-[#FFE4EC] pb-1">Scores</div>
          </td></tr>
          {SCORE_ROWS.map(({ label, field }) => {
            const bi = bestIdx(laptops, field)
            return (
              <tr key={field} className="hover:bg-[#FFF8FB]">
                <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">{label}</td>
                {laptops.map((l, i) => {
                  const v = l[field] as number
                  return (
                    <td key={l.id} className={cn('py-2 px-3', i === bi && 'bg-[#FFE4EC]/50')}>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold tabular-nums text-sm', scoreColor(v))}>{v.toFixed(1)}</span>
                        <div className="flex-1 h-1.5 bg-[#FFE4EC] rounded-full overflow-hidden max-w-[60px]">
                          <div className={cn('h-full rounded-full', scoreBg(v))} style={{ width: `${(v / 10) * 100}%` }} />
                        </div>
                        {i === bi && <span className="text-[10px] font-black text-[#FF5C8D]">BEST</span>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}

          {/* Spec section */}
          <tr><td colSpan={laptops.length + 1} className="py-3 pt-5">
            <div className="text-xs font-bold text-[#7D6570] uppercase tracking-wide border-b border-[#FFE4EC] pb-1">Specifications</div>
          </td></tr>
          {SPEC_ROWS.map(({ label, render }) => (
            <tr key={label} className="hover:bg-[#FFF8FB]">
              <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">{label}</td>
              {laptops.map((l) => (
                <td key={l.id} className="py-2 px-3 text-xs text-[#3A2A30]">{render(l)}</td>
              ))}
            </tr>
          ))}

          {/* Upgradeable */}
          <tr className="hover:bg-[#FFF8FB]">
            <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">RAM upgradeable</td>
            {laptops.map((l) => <td key={l.id} className="py-2 px-3"><BoolCell v={l.ram_upgradeable} /></td>)}
          </tr>
          <tr className="hover:bg-[#FFF8FB]">
            <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">Storage upgradeable</td>
            {laptops.map((l) => <td key={l.id} className="py-2 px-3"><BoolCell v={l.storage_upgradeable} /></td>)}
          </tr>

          {/* Pros/Cons */}
          <tr><td colSpan={laptops.length + 1} className="py-3 pt-5">
            <div className="text-xs font-bold text-[#7D6570] uppercase tracking-wide border-b border-[#FFE4EC] pb-1">Pros & Cons</div>
          </td></tr>
          <tr className="hover:bg-[#FFF8FB] align-top">
            <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">Pros</td>
            {laptops.map((l) => (
              <td key={l.id} className="py-2 px-3">
                <ul className="space-y-0.5">
                  {l.pros.split(';').map((p) => (
                    <li key={p} className="flex items-start gap-1 text-xs text-[#FF5C8D]">
                      <Check className="w-3 h-3 mt-0.5 shrink-0" /> {p.trim()}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr className="hover:bg-[#FFF8FB] align-top">
            <td className="py-2 pr-4 text-xs text-[#7D6570] font-medium">Cons</td>
            {laptops.map((l) => (
              <td key={l.id} className="py-2 px-3">
                <ul className="space-y-0.5">
                  {l.cons.split(';').map((c) => (
                    <li key={c} className="flex items-start gap-1 text-xs text-[#7D6570]">
                      <X className="w-3 h-3 mt-0.5 shrink-0 text-[#FF8FAB]" /> {c.trim()}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

async function CompareContent({ searchParams }: Props) {
  const { ids } = await searchParams
  const idList = ids?.split(',').map(Number).filter(Boolean) ?? []

  if (idList.length < 2) {
    return (
      <div className="text-center py-20">
        <GitCompare className="w-12 h-12 text-[#FFB7C5] mx-auto mb-4" />
        <h2 className="text-lg font-black text-[#3A2A30] mb-2">No laptops selected</h2>
        <p className="text-[#7D6570] mb-5 text-sm">Add laptops from Browse or Results to compare them here.</p>
        <Link href="/browse" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all">
          <LayoutGrid className="w-4 h-4" /> Browse Laptops
        </Link>
      </div>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase.from('laptops').select('*').in('id', idList)
  const laptops = (data ?? []) as Laptop[]

  if (!laptops.length) {
    return <p className="text-[#7D6570] text-center py-10">Could not load selected laptops.</p>
  }

  return <CompareTable laptops={laptops} />
}

export default function ComparePage(props: Props) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#3A2A30] mb-6">Compare Laptops</h1>
      <Suspense fallback={<div className="h-96 shimmer-pink rounded-2xl" />}>
        <CompareContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  )
}
