'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Laptop, GitCompare, UserCircle, LogIn } from 'lucide-react'
import { useCompare } from '@/context/compare'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { selected } = useCompare()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Profile'

  return (
    <nav className="sticky top-0 z-40 glass border-b border-[#FFE4EC]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-[#3A2A30]">
          <div className="w-7 h-7 bg-gradient-to-br from-[#FF5C8D] to-[#FFB7C5] rounded-xl flex items-center justify-center shadow-sm shadow-[#FFB7C5]/50">
            <Laptop className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="hidden sm:block text-gradient-pink font-extrabold tracking-tight">
            LaptopMatcher
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/compare"
            className={cn(
              'relative flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all duration-200',
              pathname === '/compare'
                ? 'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white shadow-md shadow-[#FFB7C5]/40'
                : 'text-[#7D6570] hover:text-[#FF5C8D] hover:bg-[#FFE4EC]'
            )}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare
            {selected.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF5C8D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {selected.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className={cn(
                  'flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all duration-200',
                  pathname === '/profile'
                    ? 'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white shadow-md shadow-[#FFB7C5]/40'
                    : 'text-[#7D6570] hover:text-[#FF5C8D] hover:bg-[#FFE4EC]'
                )}
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{firstName}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs text-[#7D6570] hover:text-[#FF5C8D] px-2 py-1.5 rounded-xl hover:bg-[#FFE4EC] transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] px-3 py-1.5 rounded-xl shadow-sm shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
