'use client'

import { useState, useTransition } from 'react'
import { getAllLaptops, updateLaptopPrice, deleteLaptop, markVerified, getVisitStats } from './actions'
import { Laptop, Lock, RefreshCw, Trash2, Check, X, AlertCircle, Search, Edit2, BarChart3, Users, Globe, TrendingUp } from 'lucide-react'

type LaptopRow = {
  id: number
  name: string
  brand: string
  price_inr: number
  price_segment: string
  india_availability: string
  last_verified_date: string
  purchase_links: string
}

const SEGMENTS = ['Budget', 'Mid Range', 'Upper Mid', 'Premium']

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function StaleChip({ date }: { date: string }) {
  const days = daysSince(date)
  if (days > 60) return <span className="text-xs bg-red-50 text-red-500 border border-red-200 rounded-full px-2 py-0.5">{days}d ago</span>
  if (days > 30) return <span className="text-xs bg-orange-50 text-orange-500 border border-orange-200 rounded-full px-2 py-0.5">{days}d ago</span>
  return <span className="text-xs bg-[#FFE4EC] text-[#FF8FAB] rounded-full px-2 py-0.5">{days}d ago</span>
}

export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [laptops, setLaptops] = useState<LaptopRow[]>([])
  const [authError, setAuthError] = useState('')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState({ price_inr: 0, price_segment: '', purchase_links: '' })
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<{
    totalVisits: number; visits7d: number; visits30d: number; uniqueUsers: number;
    topPages: { page: string; count: number }[];
    recentQuizzes: { major: string; budget: string; top_laptop_name: string | null; top_score: number | null; created_at: string }[];
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'prices' | 'analytics'>('prices')

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  function handleLogin() {
    startTransition(async () => {
      try {
        const [data, visitStats] = await Promise.all([
          getAllLaptops(password),
          getVisitStats(password),
        ])
        setLaptops(data)
        setStats(visitStats)
        setAuthed(true)
        setAuthError('')
      } catch {
        setAuthError('Wrong password')
      }
    })
  }

  function refresh() {
    startTransition(async () => {
      const [data, visitStats] = await Promise.all([
        getAllLaptops(password),
        getVisitStats(password),
      ])
      setLaptops(data)
      setStats(visitStats)
    })
  }

  function startEdit(l: LaptopRow) {
    setEditId(l.id)
    setEditData({ price_inr: l.price_inr, price_segment: l.price_segment, purchase_links: l.purchase_links ?? '' })
  }

  function handleSave(id: number) {
    startTransition(async () => {
      try {
        await updateLaptopPrice(password, id, editData.price_inr, editData.price_segment, editData.purchase_links)
        setLaptops(p => p.map(l => l.id === id
          ? { ...l, ...editData, last_verified_date: new Date().toISOString().split('T')[0] }
          : l
        ))
        setEditId(null)
        flash('✓ Price updated')
      } catch (e: any) {
        flash('✗ ' + e.message)
      }
    })
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteLaptop(password, id)
        setLaptops(p => p.filter(l => l.id !== id))
        flash('✓ Deleted')
      } catch (e: any) {
        flash('✗ ' + e.message)
      }
    })
  }

  function handleMarkVerified(id: number) {
    startTransition(async () => {
      try {
        await markVerified(password, id)
        const today = new Date().toISOString().split('T')[0]
        setLaptops(p => p.map(l => l.id === id ? { ...l, last_verified_date: today } : l))
        flash('✓ Marked as verified today')
      } catch (e: any) {
        flash('✗ ' + e.message)
      }
    })
  }

  const filtered = laptops.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.brand.toLowerCase().includes(search.toLowerCase())
  )

  const staleCount = laptops.filter(l => daysSince(l.last_verified_date) > 30).length

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8FB]">
        <div className="glass border border-[#FFE4EC] rounded-3xl p-10 w-full max-w-sm shadow-xl shadow-[#FFD6E0]/30">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF5C8D] to-[#FF8FAB] rounded-2xl flex items-center justify-center shadow-md shadow-[#FFB7C5]/40">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-[#3A2A30] text-lg">Admin Panel</div>
              <div className="text-xs text-[#7D6570]">LaptopMatcher</div>
            </div>
          </div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-[#FFE4EC] rounded-xl px-4 py-3 text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0] mb-3"
          />
          {authError && (
            <p className="text-xs text-[#FF5C8D] mb-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {authError}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white font-bold py-3 rounded-xl shadow-md shadow-[#FFB7C5]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    )
  }

  // ── Admin dashboard ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF8FB] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FF5C8D] to-[#FF8FAB] rounded-2xl flex items-center justify-center shadow-md shadow-[#FFB7C5]/40">
            <Laptop className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-[#3A2A30] text-xl">Admin Panel</h1>
            <p className="text-xs text-[#7D6570]">{laptops.length} laptops total</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {staleCount > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold px-3 py-1.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5" />
              {staleCount} prices stale (30+ days)
            </div>
          )}
          <button
            onClick={refresh}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-[#7D6570] hover:text-[#FF5C8D] bg-white border border-[#FFE4EC] px-3 py-1.5 rounded-xl hover:bg-[#FFF8FB] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-[#FFE4EC] shadow-xl rounded-2xl px-5 py-3 text-sm font-semibold text-[#3A2A30]">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('prices')}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${activeTab === 'prices' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white shadow-md shadow-[#FFB7C5]/40' : 'text-[#7D6570] hover:bg-[#FFE4EC]'}`}
        >
          <Laptop className="w-3.5 h-3.5" /> Prices
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white shadow-md shadow-[#FFB7C5]/40' : 'text-[#7D6570] hover:bg-[#FFE4EC]'}`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Analytics
        </button>
      </div>

      {/* Analytics tab */}
      {activeTab === 'analytics' && stats && (
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Globe, label: 'Total Visits', value: stats.totalVisits.toLocaleString() },
              { icon: TrendingUp, label: 'Last 7 Days', value: stats.visits7d.toLocaleString() },
              { icon: BarChart3, label: 'Last 30 Days', value: stats.visits30d.toLocaleString() },
              { icon: Users, label: 'Unique Users', value: stats.uniqueUsers.toLocaleString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass border border-[#FFE4EC] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-[#FF8FAB]" />
                  <span className="text-xs text-[#7D6570]">{label}</span>
                </div>
                <div className="text-2xl font-black text-[#3A2A30]">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top pages */}
            <div className="glass border border-[#FFE4EC] rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-[#3A2A30] text-sm mb-3 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#FF5C8D]" /> Top Pages
              </h3>
              {stats.topPages.length === 0 ? (
                <p className="text-xs text-[#7D6570]">No data yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.topPages.map(({ page, count }) => {
                    const max = stats.topPages[0]?.count ?? 1
                    return (
                      <div key={page} className="flex items-center gap-2">
                        <div className="text-xs text-[#7D6570] w-28 truncate flex-shrink-0">{page === '/' ? 'Home' : page}</div>
                        <div className="flex-1 bg-[#FFE4EC] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] rounded-full"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs font-bold text-[#3A2A30] w-6 text-right">{count}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent quizzes */}
            <div className="glass border border-[#FFE4EC] rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-[#3A2A30] text-sm mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#FF5C8D]" /> Recent Quiz Sessions
              </h3>
              {stats.recentQuizzes.length === 0 ? (
                <p className="text-xs text-[#7D6570]">No quizzes saved yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.recentQuizzes.map((q, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-[#FFE4EC] last:border-0">
                      <div>
                        <div className="text-xs font-semibold text-[#3A2A30]">{q.major} · {q.budget}</div>
                        {q.top_laptop_name && (
                          <div className="text-xs text-[#7D6570] truncate max-w-[180px]">{q.top_laptop_name}</div>
                        )}
                      </div>
                      <div className="text-xs text-[#FFB7C5] flex-shrink-0">
                        {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-4" style={{display: activeTab === 'prices' ? undefined : 'none'}}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFB7C5]" />
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#FFE4EC] rounded-xl text-sm text-[#3A2A30] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E0]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto glass border border-[#FFE4EC] rounded-2xl overflow-hidden shadow-sm" style={{display: activeTab === 'prices' ? undefined : 'none'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[#FFE4EC] bg-[#FFF8FB]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide w-10">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide w-24">Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide w-28">Segment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide w-28">Last Verified</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide">Buy Links</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[#7D6570] uppercase tracking-wide w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-[#FFE4EC] last:border-0 hover:bg-[#FFF8FB] transition-colors">
                  <td className="py-3 px-4 text-[#7D6570] text-xs">{l.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#3A2A30] text-sm leading-tight">{l.name}</div>
                    <div className="text-xs text-[#7D6570]">{l.brand}</div>
                  </td>

                  {/* Editable price / segment / links */}
                  {editId === l.id ? (
                    <>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          value={editData.price_inr}
                          onChange={e => setEditData(p => ({ ...p, price_inr: Number(e.target.value) }))}
                          className="w-24 border border-[#FFD6E0] rounded-lg px-2 py-1 text-xs text-[#3A2A30] focus:outline-none focus:ring-2 focus:ring-[#FFD6E0]"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <select
                          value={editData.price_segment}
                          onChange={e => setEditData(p => ({ ...p, price_segment: e.target.value }))}
                          className="border border-[#FFD6E0] rounded-lg px-2 py-1 text-xs text-[#3A2A30] focus:outline-none focus:ring-2 focus:ring-[#FFD6E0]"
                        >
                          {SEGMENTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <StaleChip date={l.last_verified_date} />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={editData.purchase_links}
                          onChange={e => setEditData(p => ({ ...p, purchase_links: e.target.value }))}
                          placeholder="Amazon: url|Flipkart: url"
                          className="w-full border border-[#FFD6E0] rounded-lg px-2 py-1 text-xs text-[#3A2A30] focus:outline-none focus:ring-2 focus:ring-[#FFD6E0]"
                        />
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSave(l.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-lg bg-[#FF5C8D] text-white hover:bg-[#FF8FAB] transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-lg bg-[#FFE4EC] text-[#7D6570] hover:bg-[#FFD6E0] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-bold text-[#3A2A30]">₹{l.price_inr.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-xs text-[#7D6570]">{l.price_segment}</td>
                      <td className="py-3 px-4"><StaleChip date={l.last_verified_date} /></td>
                      <td className="py-3 px-4 text-xs text-[#7D6570] max-w-[200px] truncate">{l.purchase_links}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(l)}
                            title="Edit price"
                            className="p-1.5 rounded-lg text-[#7D6570] hover:bg-[#FFE4EC] hover:text-[#FF5C8D] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMarkVerified(l.id)}
                            title="Mark as verified today"
                            className="p-1.5 rounded-lg text-[#7D6570] hover:bg-[#FFE4EC] hover:text-[#FF5C8D] transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(l.id, l.name)}
                            title="Delete laptop"
                            className="p-1.5 rounded-lg text-[#7D6570] hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
