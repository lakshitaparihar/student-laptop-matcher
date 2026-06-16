'use server'

import { createClient } from '@/lib/supabase/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

function checkPassword(password: string) {
  if (password !== ADMIN_PASSWORD) throw new Error('Wrong password')
}

export async function getAllLaptops(password: string) {
  checkPassword(password)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('laptops')
    .select('id, name, brand, price_inr, price_segment, india_availability, last_verified_date, purchase_links')
    .order('brand')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateLaptopPrice(
  password: string,
  id: number,
  price_inr: number,
  price_segment: string,
  purchase_links: string,
) {
  checkPassword(password)
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('laptops')
    .update({ price_inr, price_segment, purchase_links, last_verified_date: today })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteLaptop(password: string, id: number) {
  checkPassword(password)
  const supabase = await createClient()
  const { error } = await supabase.from('laptops').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markVerified(password: string, id: number) {
  checkPassword(password)
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('laptops')
    .update({ last_verified_date: today })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getVisitStats(password: string) {
  checkPassword(password)
  const supabase = await createClient()

  const now = new Date()
  const ago7  = new Date(now.getTime() -  7 * 86400000).toISOString()
  const ago30 = new Date(now.getTime() - 30 * 86400000).toISOString()

  const [totalRes, week7Res, month30Res, recent500Res, quizzesRes, guestQuizRes] = await Promise.all([
    supabase.from('page_visits').select('*', { count: 'exact', head: true }),
    supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('created_at', ago7),
    supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('created_at', ago30),
    supabase.from('page_visits').select('page, user_id').order('created_at', { ascending: false }).limit(500),
    supabase.from('quiz_sessions').select('major, budget, top_laptop_name, top_score, user_id, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('page_visits').select('*', { count: 'exact', head: true }).eq('page', '/results').is('user_id', null),
  ])

  const pageCounts: Record<string, number> = {}
  const uniqueIds = new Set<string>()
  for (const row of recent500Res.data ?? []) {
    pageCounts[row.page] = (pageCounts[row.page] ?? 0) + 1
    if (row.user_id) uniqueIds.add(row.user_id)
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([page, count]) => ({ page, count }))

  return {
    totalVisits:      totalRes.count ?? 0,
    visits7d:         week7Res.count ?? 0,
    visits30d:        month30Res.count ?? 0,
    uniqueUsers:      uniqueIds.size,
    guestQuizAttempts: guestQuizRes.count ?? 0,
    topPages,
    recentQuizzes:    quizzesRes.data ?? [],
  }
}
