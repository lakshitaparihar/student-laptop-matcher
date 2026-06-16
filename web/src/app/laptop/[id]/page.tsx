import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Laptop } from '@/lib/types'
import {
  formatPriceExact, sentimentColor, BRAND_COLORS, getPurchaseLinks, cn,
} from '@/lib/utils'

interface Props { params: Promise<{ id: string }> }

export default async function LaptopPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('laptops').select('*').eq('id', Number(id)).single()
  if (!data) notFound()

  const laptop = data as Laptop
  const links = getPurchaseLinks(laptop)
  const pros = laptop.pros.split(';').map((s) => s.trim()).filter(Boolean)
  const cons = laptop.cons.split(';').map((s) => s.trim()).filter(Boolean)
  const majors = laptop.major_fit ?? []

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-[#7D6570] hover:text-[#3A2A30] mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid gap-6">
        {/* LEFT — main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* header card */}
          <div className="glass rounded-2xl border border-[#FFE4EC] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className={cn('inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2', BRAND_COLORS[laptop.brand] ?? 'bg-[#FFE4EC] text-[#FF8FAB]')}>
                  {laptop.brand}
                </span>
                <h1 className="text-xl font-black text-[#3A2A30] leading-snug">{laptop.name}</h1>
                <p className="text-[#7D6570] text-sm mt-1">{laptop.model}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-[#3A2A30]">{formatPriceExact(laptop.price_inr)}</div>
                <div className="text-sm text-[#7D6570] mt-0.5">{laptop.price_segment}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-5">
              <span className={cn('text-sm font-semibold px-3 py-1 rounded-full', sentimentColor(laptop.community_sentiment))}>
                Community: {laptop.community_sentiment}
              </span>
              <span className="text-sm text-[#7D6570]">{laptop.india_availability}</span>
            </div>

            {/* buy links */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    {label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* specs grid */}
          <div className="glass rounded-2xl border border-[#FFE4EC] p-6">
            <h2 className="font-black text-[#3A2A30] mb-4">Full Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {[
                ['CPU',           laptop.cpu],
                ['CPU Generation',laptop.cpu_generation],
                ['GPU',           laptop.gpu],
                ['GPU Type',      laptop.gpu_type],
                ['RAM',           `${laptop.ram_gb} GB`],
                ['RAM Upgradeable', laptop.ram_upgradeable ? '✓ Yes' : '✗ No'],
                ['Storage',       laptop.storage],
                ['Storage Upgradeable', laptop.storage_upgradeable ? '✓ Yes' : '✗ No'],
                ['Screen Size',   `${laptop.screen_size}"`],
                ['Resolution',    laptop.screen_resolution],
                ['Display Type',  laptop.display_type],
                ['Refresh Rate',  `${laptop.refresh_rate} Hz`],
                ['Battery',       `${laptop.battery_wh} Wh`],
                ['Weight',        `${laptop.weight_kg} kg`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-[#7D6570] w-36 shrink-0">{label}</span>
                  <span className="font-medium text-[#3A2A30]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* pros / cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF8FB] border border-[#FFE4EC] rounded-2xl p-4">
              <h3 className="font-semibold text-[#FF5C8D] mb-3">Pros</h3>
              <ul className="space-y-1.5">
                {pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-[#3A2A30]">
                    <Check className="w-3.5 h-3.5 mt-0.5 text-[#FF5C8D] shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-[#FFE4EC] rounded-2xl p-4">
              <h3 className="font-semibold text-[#7D6570] mb-3">Cons</h3>
              <ul className="space-y-1.5">
                {cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-[#3A2A30]">
                    <X className="w-3.5 h-3.5 mt-0.5 text-[#FF8FAB] shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* major fit */}
          {majors.length > 0 && (
            <div className="glass rounded-2xl border border-[#FFE4EC] p-5">
              <h3 className="font-semibold text-[#3A2A30] mb-3">Best suited for</h3>
              <div className="flex flex-wrap gap-2">
                {majors.map((m) => (
                  <span key={m} className="text-sm bg-[#FFE4EC] border border-[#FFB7C5] text-[#FF5C8D] rounded-full px-3 py-1 font-semibold">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
