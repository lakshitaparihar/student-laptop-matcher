import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Laptop, Major, Budget, Priority } from '@/lib/types'
import { MAJOR_SCORE_FIELD, SEGMENT_RANGE } from '@/lib/types'
import { computeMatchScore, MAJOR_ICONS, PRIORITY_LABELS } from '@/lib/utils'
import LaptopCard from '@/components/LaptopCard'
import SaveResults from '@/components/SaveResults'

interface Props {
  searchParams: Promise<{ major?: string; budget?: string; priorities?: string }>
}

async function Results({ searchParams }: Props) {
  const params = await searchParams
  const major = params.major as Major | undefined
  const budget = params.budget as Budget | undefined
  const priorities = (params.priorities?.split(',') ?? []) as Priority[]

  if (!major || !budget) {
    return (
      <div className="text-center py-20">
        <p className="text-[#7D6570] mb-4">Missing quiz parameters.</p>
        <Link href="/quiz" className="text-[#FF5C8D] font-semibold hover:text-[#FF8FAB]">
          Retake the quiz
        </Link>
      </div>
    )
  }

  const supabase = await createClient()
  const scoreField = MAJOR_SCORE_FIELD[major]

  const { data: laptops, error } = await supabase
    .from('laptops')
    .select('*')
    .eq('price_segment', budget)
    .order(scoreField as string, { ascending: false })
    .limit(100)

  if (error || !laptops?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-[#7D6570] mb-4">
          {error ? 'Could not load results.' : `No laptops found in the ${budget} segment.`}
        </p>
        <Link href="/quiz" className="text-[#FF5C8D] font-semibold hover:text-[#FF8FAB]">Retake</Link>
      </div>
    )
  }

  const quiz = { major, budget, priorities }
  const ranked = (laptops as Laptop[])
    .map((l) => ({ laptop: l, score: computeMatchScore(l, quiz) }))
    .sort((a, b) => b.score - a.score)

  // top 5 picks; remaining split evenly as "similar" pool for each pick
  const TOP = 5
  const top5 = ranked.slice(0, TOP)
  const rest = ranked.slice(TOP)
  const poolSize = Math.ceil(rest.length / TOP)

  const withSimilar = top5.map((pick, i) => ({
    ...pick,
    similar: rest.slice(i * poolSize, (i + 1) * poolSize),
  }))

  return (
    <>
      {/* summary bar */}
      <div className="glass rounded-2xl border border-[#FFE4EC] p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{MAJOR_ICONS[major]}</span>
          <div>
            <div className="text-xs text-[#7D6570]">Major</div>
            <div className="font-semibold text-[#3A2A30]">{major}</div>
          </div>
        </div>
        <div className="w-px h-8 bg-[#FFE4EC]" />
        <div>
          <div className="text-xs text-[#7D6570]">Budget</div>
          <div className="font-semibold text-[#3A2A30]">{budget}</div>
          <div className="text-xs text-[#7D6570]">{SEGMENT_RANGE[budget]}</div>
        </div>
        {priorities.length > 0 && (
          <>
            <div className="w-px h-8 bg-[#FFE4EC]" />
            <div>
              <div className="text-xs text-[#7D6570]">Priorities</div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {priorities.map((p) => (
                  <span key={p} className="text-xs bg-[#FFE4EC] text-[#FF5C8D] border border-[#FFB7C5] rounded-full px-2 py-0.5 font-medium">
                    {PRIORITY_LABELS[p].icon} {PRIORITY_LABELS[p].label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <SaveResults
            major={major}
            budget={budget}
            priorities={priorities}
            topLaptopId={withSimilar[0]?.laptop.id ?? null}
            topLaptopName={withSimilar[0]?.laptop.name ?? null}
            topScore={withSimilar[0]?.score ?? null}
          />
          <Link
            href="/quiz"
            className="text-sm text-[#FF5C8D] hover:text-[#FF8FAB] font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Retake quiz
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {withSimilar.map(({ laptop, score, similar }, i) => (
          <LaptopCard
            key={laptop.id}
            laptop={laptop}
            major={major}
            matchScore={score}
            rank={i + 1}
            similar={similar}
          />
        ))}
      </div>
    </>
  )
}

export default function ResultsPage(props: Props) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/quiz"
        className="inline-flex items-center gap-1.5 text-sm text-[#7D6570] hover:text-[#3A2A30] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to quiz
      </Link>
      <h1 className="text-2xl font-black text-[#3A2A30] mb-6">Your Top 5 Picks</h1>
      <Suspense fallback={
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-52 shimmer-pink rounded-2xl" />
          ))}
        </div>
      }>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </main>
  )
}
