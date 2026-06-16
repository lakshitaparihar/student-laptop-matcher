'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetch(`${SUPABASE_URL}/rest/v1/page_visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ page: pathname, user_id: user?.id ?? null }),
      }).then(r => { if (!r.ok) r.text().then(t => console.error('[PageTracker]', r.status, t)) })
    })
  }, [pathname])

  return null
}
