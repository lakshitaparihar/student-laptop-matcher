import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, BookOpen, ChevronRight, Laptop } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { MAJOR_ICONS } from '@/lib/utils'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/profile')
  }

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const fullName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Profile card */}
      <div className="glass border border-[#FFE4EC] rounded-3xl p-6 mb-8 shadow-xl shadow-[#FFD6E0]/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF5C8D] to-[#FFB7C5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFB7C5]/40 text-white font-black text-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-black text-[#3A2A30]">{fullName}</h1>
              <p className="text-sm text-[#7D6570]">{user.email}</p>
              <p className="text-xs text-[#FFB7C5] mt-0.5">
                {sessions?.length ?? 0} quiz{(sessions?.length ?? 0) !== 1 ? 'zes' : ''} taken
              </p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-[#7D6570] hover:text-[#FF5C8D] border border-[#FFE4EC] px-3 py-1.5 rounded-xl hover:bg-[#FFE4EC] transition-all"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Quiz history */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black text-[#3A2A30] text-lg flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#FF5C8D]" />
          Quiz History
        </h2>
        <Link
          href="/quiz"
          className="text-sm text-[#FF5C8D] font-semibold hover:text-[#FF8FAB] flex items-center gap-1"
        >
          Take quiz again <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!sessions?.length ? (
        <div className="glass border border-[#FFE4EC] rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-[#FFE4EC] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Laptop className="w-6 h-6 text-[#FF8FAB]" />
          </div>
          <p className="text-[#7D6570] mb-4 font-medium">No saved quizzes yet</p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all text-sm"
          >
            Take the quiz
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <div
              key={s.id}
              className="glass border border-[#FFE4EC] rounded-2xl p-4 hover:border-[#FFD6E0] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#FFE4EC] rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {MAJOR_ICONS[s.major as keyof typeof MAJOR_ICONS] ?? '💻'}
                  </div>
                  <div>
                    <div className="font-semibold text-[#3A2A30] text-sm">{s.major}</div>
                    <div className="text-xs text-[#7D6570]">{s.budget} budget</div>
                  </div>
                </div>
                <div className="text-xs text-[#FFB7C5] text-right flex-shrink-0">
                  {timeAgo(s.created_at)}
                </div>
              </div>

              {s.top_laptop_name && (
                <div className="mt-3 pt-3 border-t border-[#FFE4EC] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#7D6570]">Top pick</div>
                    <div className="text-sm font-semibold text-[#3A2A30] leading-tight">{s.top_laptop_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.top_score && (
                      <span className="text-xs font-bold text-white bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] px-2.5 py-1 rounded-full shadow-sm shadow-[#FFB7C5]/40">
                        {Math.round(s.top_score * 10)}%
                      </span>
                    )}
                    <Link
                      href={`/results?major=${encodeURIComponent(s.major)}&budget=${encodeURIComponent(s.budget)}&priorities=${(s.priorities ?? []).join(',')}`}
                      className="text-xs text-[#FF5C8D] font-semibold hover:text-[#FF8FAB] flex items-center gap-0.5"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
