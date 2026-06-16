import Link from 'next/link'
import { Sparkles, LayoutGrid, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* gradient bg */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(145deg, #FFD6E0 0%, #FFE4EC 35%, #FFF8FB 65%, #FFD6E0 100%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 py-28 text-center">
          {/* pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 border border-[#FFE4EC] rounded-full px-4 py-1.5 text-sm font-semibold text-[#FF8FAB] mb-8 shadow-sm">
            208 laptops · 2025–2026 India prices
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-[#3A2A30]">Find Your Perfect</span>
            <br />
            <span className="text-gradient-pink">College Laptop</span>
          </h1>

          <p className="text-lg text-[#7D6570] max-w-md mx-auto mb-10">
            Scored for your major. Ranked by your budget.<br />
            Made for Indian students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/quiz"
              className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#FFB7C5]/50 hover:shadow-2xl hover:shadow-[#FF8FAB]/40 hover:-translate-y-1 transition-all duration-200 text-base overflow-hidden"
            >
              <Sparkles className="w-4 h-4" />
              Start the Quiz
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/browse"
              className="flex items-center gap-2 bg-white/80 border border-[#FFE4EC] text-[#FF5C8D] font-semibold px-7 py-4 rounded-2xl shadow-md shadow-[#FFD6E0]/40 hover:bg-white hover:-translate-y-1 transition-all duration-200 text-base"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse All
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
