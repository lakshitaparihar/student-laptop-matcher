import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Laptop, Major, Priority, QuizState } from './types'
import { MAJOR_SCORE_FIELD, PRIORITY_SCORE_FIELD } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`
  return `₹${(price / 1000).toFixed(0)}K`
}

export function formatPriceExact(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

export function scoreColor(score: number): string {
  if (score >= 8)   return 'text-[#FF5C8D]'
  if (score >= 6.5) return 'text-[#FF8FAB]'
  if (score >= 5)   return 'text-[#FFB7C5]'
  return 'text-[#7D6570]'
}

export function scoreBg(score: number): string {
  if (score >= 8)   return 'bg-[#FF5C8D]'
  if (score >= 6.5) return 'bg-[#FF8FAB]'
  if (score >= 5)   return 'bg-[#FFB7C5]'
  return 'bg-[#7D6570]'
}

export function scoreLabel(score: number): string {
  if (score >= 8)   return 'Excellent'
  if (score >= 6.5) return 'Good'
  if (score >= 5)   return 'Average'
  return 'Limited'
}

export function sentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'Excellent': return 'bg-[#FFD6E0] text-[#FF5C8D]'
    case 'Good':      return 'bg-[#FFE4EC] text-[#FF8FAB]'
    case 'Average':   return 'bg-[#FFF8FB] text-[#7D6570] border border-[#FFE4EC]'
    default:          return 'bg-[#FFE4EC] text-[#7D6570]'
  }
}

export function computeMatchScore(laptop: Laptop, quiz: QuizState): number {
  if (!quiz.major) return 0

  let majorScore: number
  if (quiz.major === 'Other') {
    const all = [
      laptop.ai_ml_score, laptop.coding_score, laptop.mechanical_score,
      laptop.civil_score, laptop.electronics_score, laptop.mba_score,
      laptop.marketing_score, laptop.design_score,
    ]
    majorScore = all.reduce((a, b) => a + b, 0) / all.length
  } else {
    majorScore = laptop[MAJOR_SCORE_FIELD[quiz.major]] as number
  }

  let priorityScore = majorScore
  if (quiz.priorities.length > 0) {
    const priorityTotal = quiz.priorities.reduce((sum, p) => {
      const field = PRIORITY_SCORE_FIELD[p]
      return sum + (laptop[field] as number)
    }, 0)
    priorityScore = priorityTotal / quiz.priorities.length
  }

  let valueBonus = 0
  if (quiz.priorities.includes('value')) {
    const priceMap: Record<string, number> = {
      Budget: 2, 'Mid Range': 1, 'Upper Mid': 0, Premium: -0.5,
    }
    valueBonus = priceMap[laptop.price_segment] ?? 0
  }

  const raw = majorScore * 0.6 + priorityScore * 0.4 + valueBonus
  return Math.min(10, Math.round(raw * 10) / 10)
}

export function getPurchaseLinks(laptop: Laptop): { label: string; url: string }[] {
  if (!laptop.purchase_links) return []
  return laptop.purchase_links.split('|').map((part) => {
    const [label, url] = part.trim().split(': ')
    return { label: label?.trim() ?? 'Buy', url: url?.trim() ?? '#' }
  })
}

export const MAJOR_ICONS: Record<Major, string> = {
  'AI/ML':            '🤖',
  'Computer Science': '💻',
  'Data Science':     '📈',
  Electronics:        '🔌',
  Mechanical:         '⚙️',
  Civil:              '🏗️',
  Chemical:           '🧪',
  Biotechnology:      '🧬',
  MBA:                '💼',
  Marketing:          '📱',
  Design:             '🎨',
  Architecture:       '🏛️',
  Other:              '📚',
}

export const PRIORITY_LABELS: Record<Priority, { label: string; icon: string; desc: string }> = {
  battery:      { label: 'Battery Life',  icon: '🔋', desc: 'All-day use without charger' },
  display:      { label: 'Display',       icon: '🖥️',  desc: 'Crisp, colorful screen' },
  performance:  { label: 'Performance',   icon: '⚡',  desc: 'Fast CPU & GPU' },
  portability:  { label: 'Portability',   icon: '🎒', desc: 'Lightweight & thin' },
  future_proof: { label: 'Future-proof',  icon: '🚀', desc: 'Upgradeable & modern specs' },
  value:        { label: 'Best Value',    icon: '💰', desc: 'Most for your money' },
}

export const BRAND_COLORS: Record<string, string> = {
  ASUS:     'bg-[#FFE4EC] text-[#FF5C8D]',
  Lenovo:   'bg-[#FFD6E0] text-[#FF5C8D]',
  HP:       'bg-[#FFE4EC] text-[#FF8FAB]',
  Dell:     'bg-[#FFD6E0] text-[#FF8FAB]',
  Acer:     'bg-[#FFF8FB] text-[#FFB7C5] border border-[#FFE4EC]',
  Apple:    'bg-[#3A2A30] text-[#FFD6E0]',
  MSI:      'bg-[#FF5C8D] text-white',
  Samsung:  'bg-[#FFD6E0] text-[#FF5C8D]',
  Motorola: 'bg-[#FFE4EC] text-[#FF8FAB]',
  Honor:    'bg-[#FFD6E0] text-[#FF8FAB]',
}
