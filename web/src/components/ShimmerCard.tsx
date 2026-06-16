import { cn } from '@/lib/utils'

export default function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-[#FFE4EC] overflow-hidden p-4', className)}>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 flex-1">
          <div className="shimmer-pink h-3 w-16 rounded-full" />
          <div className="shimmer-pink h-4 w-40 rounded-full" />
        </div>
        <div className="shimmer-pink h-6 w-14 rounded-full" />
      </div>
      <div className="shimmer-pink h-8 w-24 rounded-full mb-3" />
      <div className="shimmer-pink h-2 w-full rounded-full mb-5" />
      <div className="flex gap-2">
        <div className="shimmer-pink h-8 w-20 rounded-lg" />
        <div className="shimmer-pink h-8 flex-1 rounded-lg" />
      </div>
    </div>
  )
}
