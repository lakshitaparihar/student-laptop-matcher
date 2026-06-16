'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import type { Major, Budget, Priority } from '@/lib/types'
import { SEGMENT_RANGE } from '@/lib/types'
import { cn, MAJOR_ICONS, PRIORITY_LABELS } from '@/lib/utils'

const MAJORS: Major[] = [
  'AI/ML', 'Computer Science', 'Data Science', 'Electronics',
  'Mechanical', 'Civil', 'Chemical', 'Biotechnology',
  'MBA', 'Marketing', 'Design', 'Architecture', 'Other',
]
const BUDGETS: Budget[] = ['Budget', 'Mid Range', 'Upper Mid', 'Premium']
const PRIORITIES: Priority[] = ['battery', 'display', 'performance', 'portability', 'future_proof', 'value']
type Step = 1 | 2 | 3

const slide = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -40 }),
}

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [dir, setDir] = useState(1)
  const [major, setMajor] = useState<Major | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [priorities, setPriorities] = useState<Priority[]>([])

  function go(next: Step) {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  function togglePriority(p: Priority) {
    setPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 3 ? [...prev, p] : prev
    )
  }

  function handleSubmit() {
    if (!major || !budget) return
    const params = new URLSearchParams({
      major, budget,
      ...(priorities.length ? { priorities: priorities.join(',') } : {}),
    })
    router.push(`/results?${params.toString()}`)
  }

  const pct = (step / 3) * 100

  return (
    <main className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* progress */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFE4EC] text-[#FF8FAB] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Step {step} of 3
          </div>
          <div className="h-2 bg-[#FFE4EC] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB]"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* card */}
        <div className="glass border border-[#FFE4EC] rounded-3xl shadow-2xl shadow-[#FFD6E0]/30 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div key="s1" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }} className="p-8"
              >
                <h1 className="text-2xl font-black text-[#3A2A30] mb-1">What&apos;s your major? 🎓</h1>
                <p className="text-[#7D6570] text-sm mb-6">We&apos;ll score laptops specifically for your stream.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MAJORS.map(m => (
                    <motion.button key={m} onClick={() => setMajor(m)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-semibold',
                        major === m
                          ? 'border-[#FF5C8D] bg-gradient-to-b from-[#FFE4EC] to-white text-[#FF5C8D] shadow-md shadow-[#FFB7C5]/30'
                          : 'border-[#FFE4EC] bg-white/60 text-[#7D6570] hover:border-[#FFB7C5] hover:text-[#FF8FAB]'
                      )}
                    >
                      <span className="text-2xl">{MAJOR_ICONS[m]}</span>
                      <span className="text-center leading-tight text-xs">{m}</span>
                      {major === m && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5C8D] rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }} className="p-8"
              >
                <h1 className="text-2xl font-black text-[#3A2A30] mb-1">What&apos;s your budget? 💸</h1>
                <p className="text-[#7D6570] text-sm mb-6">We&apos;ll only show laptops in your range.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUDGETS.map(b => (
                    <motion.button key={b} onClick={() => setBudget(b)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={cn(
                        'relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left',
                        budget === b
                          ? 'border-[#FF5C8D] bg-gradient-to-r from-[#FFE4EC] to-white shadow-md shadow-[#FFB7C5]/30'
                          : 'border-[#FFE4EC] bg-white/60 hover:border-[#FFB7C5]'
                      )}
                    >
                      <div>
                        <div className={cn('font-bold', budget === b ? 'text-[#FF5C8D]' : 'text-[#3A2A30]')}>{b}</div>
                        <div className="text-sm text-[#7D6570]">{SEGMENT_RANGE[b]}</div>
                      </div>
                      {budget === b && (
                        <span className="w-6 h-6 bg-[#FF5C8D] rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }} className="p-8"
              >
                <h1 className="text-2xl font-black text-[#3A2A30] mb-1">What matters most? ✨</h1>
                <p className="text-[#7D6570] text-sm mb-6">Pick up to 3 priorities — they boost your score.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRIORITIES.map(p => {
                    const { label, icon, desc } = PRIORITY_LABELS[p]
                    const active = priorities.includes(p)
                    const disabled = !active && priorities.length >= 3
                    return (
                      <motion.button key={p} onClick={() => togglePriority(p)} disabled={disabled}
                        whileHover={disabled ? {} : { scale: 1.02 }}
                        whileTap={disabled ? {} : { scale: 0.98 }}
                        className={cn(
                          'flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left',
                          active
                            ? 'border-[#FF5C8D] bg-gradient-to-b from-[#FFE4EC] to-white shadow-md shadow-[#FFB7C5]/30'
                            : disabled
                            ? 'border-[#FFE4EC] opacity-35 cursor-not-allowed'
                            : 'border-[#FFE4EC] bg-white/60 hover:border-[#FFB7C5]'
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="text-xl">{icon}</span>
                          {active && (
                            <span className="w-4 h-4 bg-[#FF5C8D] rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </div>
                        <div className={cn('font-bold text-sm', active ? 'text-[#FF5C8D]' : 'text-[#3A2A30]')}>{label}</div>
                        <div className="text-xs text-[#7D6570] mt-0.5">{desc}</div>
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-[#7D6570] mt-3 text-center">
                  {priorities.length}/3 selected · Skip to use major score only
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* nav */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={() => go((step - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-1.5 text-sm font-medium text-[#7D6570] hover:text-[#FF5C8D] disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-xl hover:bg-[#FFE4EC] transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 1 && !major) return
                  if (step === 2 && !budget) return
                  go((step + 1) as Step)
                }}
                disabled={(step === 1 && !major) || (step === 2 && !budget)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-sm font-bold px-7 py-3 rounded-xl shadow-lg shadow-[#FFB7C5]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!major || !budget}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-sm font-bold px-7 py-3 rounded-xl shadow-lg shadow-[#FFB7C5]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                <Sparkles className="w-4 h-4" /> See My Matches
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
