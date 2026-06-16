import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Laptop } from '@/lib/types'
import FilterSidebar from '@/components/FilterSidebar'
import LaptopCard from '@/components/LaptopCard'

interface Props {
  searchParams: Promise<Record<string, string>>
}

function buildQuery(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, sp: Record<string, string>) {
  let q = supabase.from('laptops').select('*')

  const brands = sp.brand?.split(',').filter(Boolean)
  if (brands?.length) q = q.in('brand', brands)

  const segments = sp.segment?.split(',').filter(Boolean)
  if (segments?.length) q = q.in('price_segment', segments)

  const rams = sp.ram?.split(',').filter(Boolean).map(Number)
  if (rams?.length) q = q.in('ram_gb', rams)

  const gpus = sp.gpu?.split(',').filter(Boolean)
  if (gpus?.length) q = q.in('gpu_type', gpus)

  const displays = sp.display?.split(',').filter(Boolean)
  if (displays?.length) q = q.in('display_type', displays)

  const sort = sp.sort ?? 'score_desc'
  if (sort === 'price_asc')    q = q.order('price_inr', { ascending: true })
  else if (sort === 'price_desc') q = q.order('price_inr', { ascending: false })
  else if (sort === 'battery_desc') q = q.order('estimated_battery_score', { ascending: false })
  else if (sort === 'weight_asc') q = q.order('weight_kg', { ascending: true })
  else q = q.order('coding_score', { ascending: false })

  return q.limit(200)
}

async function LaptopGrid({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: laptops, error } = await buildQuery(supabase, sp)

  if (error) {
    return <p className="text-[#FF5C8D] col-span-full">Failed to load laptops: {error.message}</p>
  }

  if (!laptops?.length) {
    return (
      <div className="col-span-full text-center py-16">
        <p className="text-[#7D6570] text-lg">No laptops match those filters.</p>
        <a href="/browse" className="text-[#FF5C8D] text-sm mt-2 inline-block hover:text-[#FF8FAB]">
          Clear filters
        </a>
      </div>
    )
  }

  return (
    <>
      <p className="col-span-full text-sm text-[#7D6570] mb-1">
        {laptops.length} laptop{laptops.length !== 1 ? 's' : ''} found
      </p>
      {(laptops as Laptop[]).map((laptop) => (
        <LaptopCard key={laptop.id} laptop={laptop} />
      ))}
    </>
  )
}

export default async function BrowsePage(props: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/browse')
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#3A2A30]">Browse Laptops</h1>
      </div>

      <div className="flex gap-8 items-start">
        <Suspense fallback={<div className="w-56 shrink-0 shimmer-pink rounded-2xl h-96" />}>
          <FilterSidebar />
        </Suspense>

        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Suspense
            fallback={Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-72 shimmer-pink rounded-2xl" />
            ))}
          >
            <LaptopGrid searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
