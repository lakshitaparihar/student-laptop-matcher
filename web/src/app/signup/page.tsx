'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Laptop, AlertCircle, UserPlus, Mail } from 'lucide-react'
import { signUpAction } from '@/app/auth/actions'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const result = await signUpAction(email, password, fullName)
      if (result.error) {
        setError(result.error)
      } else if (result.needsConfirmation) {
        setNeedsConfirmation(true)
      } else {
        router.push('/profile')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8FB] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF5C8D] to-[#FFB7C5] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FFB7C5]/40 mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#3A2A30] mb-2">Check your email</h1>
          <p className="text-sm text-[#7D6570] mb-6">
            We sent a confirmation link to <strong className="text-[#3A2A30]">{email}</strong>.<br />
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-black text-[#3A2A30] mb-1">Create account</h1>
          <p className="text-sm text-[#7D6570] mb-6">Save your quiz results and come back anytime</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7D6570] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-[#FFE4EC] rounded-xl px-4 py-3 text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0] placeholder:text-[#FFB7C5]"
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full border border-[#FFE4EC] rounded-xl px-4 py-3 text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0] placeholder:text-[#FFB7C5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7D6570] mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
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
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7D6570] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF5C8D] font-semibold hover:text-[#FF8FAB]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
