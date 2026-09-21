'use client'

import { useMemo, useState } from 'react'
import { clubs, type Category, type Club } from '@/lib/data'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { ClubDirectory } from '@/components/club-directory'
import { ClubDetailsModal } from '@/components/club-details-modal'
import { Dashboard } from '@/components/dashboard'
import { SiteFooter } from '@/components/site-footer'

import { PublicFeed } from '@/components/public-feed'

import { useSystem } from '@/lib/system-context'

export default function Page() {
  const { clubs } = useSystem()
  const [query, setQuery] = useState('')
  const [faculty, setFaculty] = useState('All')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [selected, setSelected] = useState<Club | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clubs.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      const matchesFaculty = faculty === 'All' || c.faculty === faculty
      const matchesCategory = category === 'All' || c.category === category
      return matchesQuery && matchesFaculty && matchesCategory
    })
  }, [clubs, query, faculty, category])

  const scrollToDirectory = () => {
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <Hero
        query={query}
        onQuery={setQuery}
        faculty={faculty}
        onFaculty={setFaculty}
        category={category}
        onCategory={setCategory}
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

      <ClubDetailsModal club={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
