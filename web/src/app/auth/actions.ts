'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signInAction(email: string, password: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return {}
}

export async function signUpAction(
  email: string,
  password: string,
  fullName: string,
): Promise<{ error?: string; needsConfirmation?: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { error: error.message }
  // If email confirmation is required, the session will be null
  if (!data.session) return { needsConfirmation: true }
  revalidatePath('/', 'layout')
  return {}
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function saveQuizSession(data: {
  major: string
  budget: string
  priorities: string[]
  top_laptop_id: number | null
  top_laptop_name: string | null
  top_score: number | null
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }
  const { error } = await supabase.from('quiz_sessions').insert({ user_id: user.id, ...data })
  if (error) return { error: error.message }
  return {}
}

export async function trackPageVisit(page: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('page_visits').insert({ page, user_id: user?.id ?? null })
  } catch {
    // Never crash a page load due to analytics
  }
}
