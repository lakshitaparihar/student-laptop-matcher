'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageVisit } from '@/app/auth/actions'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    trackPageVisit(pathname).catch(() => {})
  }, [pathname])

  return null
}
