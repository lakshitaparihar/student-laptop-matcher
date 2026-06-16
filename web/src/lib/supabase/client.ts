import { createBrowserClient } from '@supabase/ssr'
import type { Laptop } from '@/lib/types'

export function createClient() {
  return createBrowserClient<{ public: { Tables: { laptops: { Row: Laptop } } } }>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
