'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Laptop, Major } from '@/lib/types'
import LaptopCard from './LaptopCard'

type ScoredLaptop = { laptop: Laptop; score: number }

interface Props {
  groups: ScoredLaptop[][]
  major: Major
}

export default function ResultsGrid({ groups, major }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  // compute global rank for the first item of each group
  const groupStartRanks = groups.reduce<number[]>((acc, g, i) => {
    acc.push(i === 0 ? 1 : acc[i - 1] + groups[i - 1].length)
    return acc
  }, [])

  return (
    <div className="space-y-5">
      {groups.map((group, gi) => {
        const [best, ...rest] = group
        const startRank = groupStartRanks[gi]
        const isOpen = expanded.has(gi)

        return (
          <div key={best.laptop.id}>
            {/* main card + alternatives side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* best laptop for this group */}
              <div>
                <LaptopCard
                  laptop={best.laptop}
                  major={major}
                  matchScore={best.score}
                  rank={startRank}
                />
              </div>

              {/* right panel */}
              <div className="sm:col-span-2">
                {rest.length === 0 ? null : isOpen ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Similar options (ranks {startRank + 1}–{startRank + group.length - 1})
                      </span>
                      <button
                        onClick={() => toggle(gi)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        Hide
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {rest.map(({ laptop, score }, ri) => (
                        <LaptopCard
                          key={laptop.id}
                          laptop={laptop}
                          major={major}
                          matchScore={score}
                          rank={startRank + ri + 1}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggle(gi)}
                    className="h-full min-h-[80px] w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {rest.length} more like this
                    </span>
                    <span className="text-xs text-slate-300">
                      Ranks {startRank + 1}–{startRank + group.length - 1}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {gi < groups.length - 1 && (
              <div className="mt-5 border-t border-slate-100" />
            )}
          </div>
        )
      })}
    </div>
  )
}
