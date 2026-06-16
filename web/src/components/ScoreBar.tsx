import { cn, scoreBg, scoreColor } from '@/lib/utils'

interface Props {
  label: string
  score: number
  className?: string
  compact?: boolean
}

export default function ScoreBar({ label, score, className, compact }: Props) {
  const pct = (score / 10) * 100
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className={cn('font-medium text-[#7D6570]', compact ? 'text-xs' : 'text-sm')}>
          {label}
        </span>
        <span className={cn('font-bold tabular-nums', compact ? 'text-xs' : 'text-sm', scoreColor(score))}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#FFE4EC] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', scoreBg(score))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
