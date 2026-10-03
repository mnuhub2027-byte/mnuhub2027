'use client'

import { useMemo, useState } from 'react'
import { clubs, type Category, type Club } from '@/lib/data'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { ClubDirectory } from '@/components/club-directory'
import { Dashboard } from '@/components/dashboard'
import { SiteFooter } from '@/components/site-footer'
import { PublicFeed } from '@/components/public-feed'
import { useSystem } from '@/lib/system-context'
import dynamic from 'next/dynamic'

const ClubDetailsModal = dynamic(
  () => import('@/components/club-details-modal').then((m) => m.ClubDetailsModal),
  { ssr: false }
)

export default function Page() {
  const { clubs } = useSystem()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [selected, setSelected] = useState<Club | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clubs.filter((c) => {
      // البحث باسم التيم فقط
      const matchesQuery = !q || (c.name || '').toLowerCase().includes(q)
      // إذا كان المستخدم يبحث بالاسم، لا تقيد النتيجة بالفئة
      const matchesCategory = q ? true : (category === 'All' || c.category === category)
      return matchesQuery && matchesCategory
    })
  }, [clubs, query, category])

  const scrollToDirectory = () => {
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <Hero
        query={query}
        onQuery={setQuery}
        clubs={clubs}
        onSelectClub={setSelected}
        onExplore={scrollToDirectory}
      />

      <PublicFeed />

      <ClubDirectory
        clubs={filtered}
        category={category}
        onCategory={setCategory}
        onView={setSelected}
      />

      <Dashboard />

      <SiteFooter />

      {selected && <ClubDetailsModal club={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}
