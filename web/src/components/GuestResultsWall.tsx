'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const KEY = 'lm_guest_quiz_done'

export default function GuestResultsWall() {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) return // logged-in users always pass
      const used = localStorage.getItem(KEY)
      if (used) {
        setBlocked(true)
      } else {
        localStorage.setItem(KEY, '1')
      }
    })
  }, [])

  if (!blocked) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF8FB]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass border border-[#FFE4EC] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-[#FFD6E0]/40">
        <div className="w-14 h-14 bg-gradient-to-br from-[#FF5C8D] to-[#FFB7C5] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FFB7C5]/40">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-black text-[#3A2A30] mb-2">You've used your free quiz</h2>
        <p className="text-sm text-[#7D6570] mb-6 leading-relaxed">
          Create a free account to retake the quiz anytime and save all your results.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="block w-full bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold py-3 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="block w-full border border-[#FFE4EC] text-[#7D6570] font-semibold py-3 rounded-xl hover:bg-[#FFE4EC] transition-all text-sm"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
