'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveQuizSession } from '@/app/auth/actions'
import type { User } from '@supabase/supabase-js'

interface Props {
  major: string
  budget: string
  priorities: string[]
  topLaptopId: number | null
  topLaptopName: string | null
  topScore: number | null
}

export default function SaveResults({ major, budget, priorities, topLaptopId, topLaptopName, topScore }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        // Auto-save for logged-in users
        saveQuizSession({
          major, budget, priorities,
          top_laptop_id: topLaptopId,
          top_laptop_name: topLaptopName,
          top_score: topScore,
        }).then(() => setSaved(true)).catch(() => {})
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (user === undefined) return null

  if (saved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#FF5C8D] font-semibold bg-[#FFE4EC] border border-[#FFD6E0] px-3 py-1.5 rounded-full">
        <BookmarkCheck className="w-3.5 h-3.5" />
        Saved to profile
      </div>
    )
  }

  if (!user) {
    return (
      <button
        onClick={() => {
          const redirect = encodeURIComponent(window.location.href)
          window.location.href = `/login?redirect=${redirect}`
        }}
        className="flex items-center gap-1.5 text-xs text-[#FF5C8D] font-semibold bg-[#FFE4EC] hover:bg-[#FFD6E0] border border-[#FFD6E0] px-3 py-1.5 rounded-full transition-all"
      >
        <Bookmark className="w-3.5 h-3.5" />
        Save results
      </button>
    )
  }

  return null
}
