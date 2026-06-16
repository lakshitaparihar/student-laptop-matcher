'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from('page_visits').insert({ page: pathname, user_id: user?.id ?? null })
    })
  }, [pathname])

  return null
}
