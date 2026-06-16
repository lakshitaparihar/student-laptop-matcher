'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, LogIn } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      await saveQuizSession({ major, budget, priorities, top_laptop_id: topLaptopId, top_laptop_name: topLaptopName, top_score: topScore })
      setSaved(true)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  // Still loading auth state
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
      <Link
        href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/results')}`}
        className="flex items-center gap-1.5 text-xs text-[#7D6570] hover:text-[#FF5C8D] border border-[#FFE4EC] hover:border-[#FFD6E0] hover:bg-[#FFF8FB] px-3 py-1.5 rounded-full transition-all"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign in to save
      </Link>
    )
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-[#FF5C8D] font-semibold bg-[#FFE4EC] hover:bg-[#FFD6E0] border border-[#FFD6E0] px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
    >
      <Bookmark className="w-3.5 h-3.5" />
      {loading ? 'Saving...' : 'Save results'}
    </button>
  )
}
