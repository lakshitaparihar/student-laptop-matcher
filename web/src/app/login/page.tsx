'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Laptop, AlertCircle, LogIn } from 'lucide-react'
import { signInAction } from '@/app/auth/actions'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/profile'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signInAction(email, password)
      if (result.error) {
        setError(result.error)
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8FB] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5C8D] to-[#FFB7C5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFB7C5]/40">
            <Laptop className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-gradient-pink tracking-tight">LaptopMatcher</span>
        </div>

        <div className="glass border border-[#FFE4EC] rounded-3xl p-8 shadow-xl shadow-[#FFD6E0]/30">
          <h1 className="text-2xl font-black text-[#3A2A30] mb-1">Welcome back</h1>
          <p className="text-sm text-[#7D6570] mb-6">Sign in to see your saved results</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7D6570] mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full border border-[#FFE4EC] rounded-xl px-4 py-3 text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0] placeholder:text-[#FFB7C5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7D6570] mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#FFE4EC] rounded-xl px-4 py-3 text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0] placeholder:text-[#FFB7C5]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-[#FF5C8D] bg-[#FFE4EC] rounded-xl px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold py-3 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7D6570] mt-5">
            No account?{' '}
            <Link href="/signup" className="text-[#FF5C8D] font-semibold hover:text-[#FF8FAB]">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#7D6570] mt-6">
          <Link href="/" className="hover:text-[#FF5C8D]">Continue without signing in</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
