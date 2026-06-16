import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CompareProvider } from '@/context/compare'
import Navbar from '@/components/Navbar'
import CompareBar from '@/components/CompareBar'
import FloatingBlobBackground from '@/components/FloatingBlobBackground'
import GlobalRipple from '@/components/GlobalRipple'
import PageTracker from '@/components/PageTracker'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'LaptopMatcher — Find Your Perfect College Laptop in India',
  description: '208 laptops scored and ranked by major, budget, and priorities. India prices 2025–2026.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFF8FB] text-[#3A2A30] font-[family-name:var(--font-geist)]">
        <FloatingBlobBackground />
        <GlobalRipple />
        <PageTracker />
        <CompareProvider>
          <Navbar />
          <div className="flex-1 pb-24">
            {children}
          </div>
          <CompareBar />
        </CompareProvider>
      </body>
    </html>
  )
}
