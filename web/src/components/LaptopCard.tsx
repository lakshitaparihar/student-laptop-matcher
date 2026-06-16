'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Check, ArrowRight, Zap, Cpu, HardDrive, Monitor, ChevronDown, LayoutList } from 'lucide-react'
import type { Laptop, Major } from '@/lib/types'
import { MAJOR_SCORE_FIELD } from '@/lib/types'
import { cn, formatPrice, sentimentColor, scoreColor, scoreBg, BRAND_COLORS } from '@/lib/utils'
import { useCompare } from '@/context/compare'
import ScoreBar from './ScoreBar'

type ScoredLaptop = { laptop: Laptop; score: number }

interface Props {
  laptop: Laptop
  major?: Major
  matchScore?: number
  rank?: number
  similar?: ScoredLaptop[]
}

export default function LaptopCard({ laptop, major, matchScore, rank, similar }: Props) {
  const { toggle, isSelected, isFull } = useCompare()
  const selected = isSelected(laptop.id)
  const [expanded, setExpanded] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryScore = major
    ? (laptop[MAJOR_SCORE_FIELD[major]] as number)
    : matchScore ?? laptop.coding_score
  const score = matchScore ?? primaryScore

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (rank ?? 0) * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(255,92,141,0.18)' }}
      className={cn(
        'relative bg-white rounded-2xl border flex flex-col transition-all duration-300',
        selected
          ? 'border-[#FF8FAB] shadow-lg shadow-[#FFB7C5]/30 ring-2 ring-[#FFD6E0]'
          : 'border-[#FFE4EC] shadow-sm shadow-[#FFE4EC]/50'
      )}
    >
      {/* rank badge */}
      {rank !== undefined && (
        <div className="absolute -top-3 -left-3 w-7 h-7 bg-gradient-to-br from-[#FF5C8D] to-[#FF8FAB] text-white rounded-full flex items-center justify-center text-xs font-black shadow-md shadow-[#FFB7C5]/40">
          {rank}
        </div>
      )}

      {/* clickable body */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="p-4 flex-1 text-left w-full"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <span className={cn('inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5', BRAND_COLORS[laptop.brand] ?? 'bg-[#FFE4EC] text-[#FF8FAB]')}>
              {laptop.brand}
            </span>
            <h3 className="font-semibold text-[#3A2A30] text-sm leading-tight line-clamp-2">
              {laptop.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-black text-[#3A2A30]">{formatPrice(laptop.price_inr)}</div>
            <div className="text-xs text-[#7D6570]">{laptop.price_segment}</div>
          </div>
        </div>

        {/* score */}
        <div className="flex items-center gap-2">
          <div className={cn('text-3xl font-black tabular-nums', scoreColor(score))}>
            {score.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#7D6570]">
              {major ? `${major} score` : 'Match score'}
            </div>
            <div className="h-2 rounded-full bg-[#FFE4EC] mt-1 overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', scoreBg(score))}
                initial={{ width: 0 }}
                animate={{ width: `${(score / 10) * 100}%` }}
                transition={{ duration: 0.8, delay: (rank ?? 0) * 0.08 + 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-[#FFB7C5] transition-transform duration-200 shrink-0', expanded && 'rotate-180')} />
        </div>

        {/* expandable details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-[#FFE4EC]"
          >
            <div className="grid grid-cols-2 gap-1.5 mb-3 text-xs">
              <div className="flex items-center gap-1 text-[#7D6570]">
                <Cpu className="w-3 h-3 text-[#FFB7C5] shrink-0" />
                <span className="truncate">{laptop.cpu.replace('Intel Core ', '').replace('AMD ', '')}</span>
              </div>
              <div className="flex items-center gap-1 text-[#7D6570]">
                <HardDrive className="w-3 h-3 text-[#FFB7C5] shrink-0" />
                <span>{laptop.ram_gb}GB · {laptop.storage.replace(' SSD', '')}</span>
              </div>
              <div className="flex items-center gap-1 text-[#7D6570]">
                <Zap className="w-3 h-3 text-[#FFB7C5] shrink-0" />
                <span className="truncate">{laptop.gpu.replace('NVIDIA GeForce ', '').replace('Intel ', '')}</span>
              </div>
              <div className="flex items-center gap-1 text-[#7D6570]">
                <Monitor className="w-3 h-3 text-[#FFB7C5] shrink-0" />
                <span>{laptop.screen_size}" · {laptop.refresh_rate}Hz</span>
              </div>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Battery" score={laptop.estimated_battery_score} compact />
              <ScoreBar label="Portability" score={laptop.estimated_portability_score} compact />
              <ScoreBar label="Future-proof" score={laptop.future_proof_score} compact />
            </div>
            <div className="mt-2 flex justify-end">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', sentimentColor(laptop.community_sentiment))}>
                {laptop.community_sentiment}
              </span>
            </div>
          </motion.div>
        )}
      </button>

      {/* footer */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => toggle(laptop)}
          disabled={!selected && isFull}
          className={cn(
            'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200',
            selected
              ? 'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white border-transparent shadow-md shadow-[#FFB7C5]/40'
              : isFull
              ? 'bg-[#FFF8FB] text-[#FFB7C5] border-[#FFE4EC] cursor-not-allowed'
              : 'bg-white text-[#7D6570] border-[#FFE4EC] hover:border-[#FFB7C5] hover:text-[#FF5C8D]'
          )}
        >
          {selected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {selected ? 'Added' : 'Compare'}
        </button>
        <Link
          href={`/laptop/${laptop.id}`}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-[#FF5C8D] bg-[#FFE4EC] hover:bg-[#FFD6E0] rounded-xl py-2 transition-colors"
        >
          Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* more like this */}
      {similar && similar.length > 0 && (
        <div className="border-t border-[#FFE4EC] px-3 pb-3 pt-2">
          <button
            onClick={() => setMoreOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#7D6570] hover:text-[#FF5C8D] font-medium w-full transition-colors"
          >
            <LayoutList className="w-3.5 h-3.5 text-[#FFB7C5]" />
            {moreOpen ? 'Hide alternatives' : `${similar.length} more like this`}
            <ChevronDown className={cn('w-3 h-3 ml-auto text-[#FFB7C5] transition-transform duration-150', moreOpen && 'rotate-180')} />
          </button>

          {moreOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 space-y-0.5"
            >
              {similar.map(({ laptop: s, score: sc }) => (
                <Link
                  key={s.id}
                  href={`/laptop/${s.id}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#FFF8FB] transition-colors group"
                >
                  <span className={cn('text-xs font-black tabular-nums shrink-0 w-8', scoreColor(sc))}>
                    {sc.toFixed(1)}
                  </span>
                  <span className="flex-1 text-xs text-[#3A2A30] truncate group-hover:text-[#FF5C8D] transition-colors">
                    {s.name}
                  </span>
                  <span className="text-xs text-[#7D6570] shrink-0">{formatPrice(s.price_inr)}</span>
                  <ArrowRight className="w-3 h-3 text-[#FFB7C5] group-hover:text-[#FF5C8D] shrink-0 transition-colors" />
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
