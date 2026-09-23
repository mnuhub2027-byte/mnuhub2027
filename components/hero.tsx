'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { categories, faculties, type Category } from '@/lib/data'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type HeroProps = {
  query: string
  onQuery: (v: string) => void
  faculty: string
  onFaculty: (v: string) => void
  category: Category | 'All'
  onCategory: (v: Category | 'All') => void
  onExplore: () => void
}

function useHeroStats() {
  const [clubs, setClubs] = useState<number | null>(null)
  const [members, setMembers] = useState<number | null>(null)
  const [events, setEvents] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function fetchStats() {
      const [clubsRes, membersRes, eventsRes] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('club_members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('team_events').select('id', { count: 'exact', head: true }),
      ])
      if (clubsRes.count !== null) setClubs(clubsRes.count)
      if (membersRes.count !== null) setMembers(membersRes.count)
      if (eventsRes.count !== null) setEvents(eventsRes.count)
    }
    fetchStats()
  }, [])

  const fmt = (n: number | null) => n === null ? '...' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return [
    { label: 'Active clubs', value: fmt(clubs) },
    { label: 'Students joined', value: fmt(members) },
    { label: 'Events posted', value: fmt(events) },
  ]
}

export function Hero({
  query,
  onQuery,
  faculty,
  onFaculty,
  category,
  onCategory,
  onExplore,
}: HeroProps) {
  const stats = useHeroStats()

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/hero-campus.png"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
            The official Mansoura National University club platform
          </span>

          <h1 className="mt-5 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Discover &amp; Join{' '}
            <span className="text-gradient">University Student Clubs</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base sm:mt-5 lg:text-lg">
            MNUHub is the central hub for campus organizations, events, and
            recruitment. Find your people, apply in minutes, and track every
            application in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border glass p-3 glow-ring"
        >
          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background/60 px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search clubs…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
              <select
                value={faculty}
                onChange={(e) => onFaculty(e.target.value)}
                className="h-11 w-full rounded-xl bg-background/60 px-3 text-sm text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select
                value={category}
                onChange={(e) => onCategory(e.target.value as Category | 'All')}
                className="h-11 w-full rounded-xl bg-background/60 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 flex items-center justify-center"
        >
          <button
            onClick={onExplore}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] w-full sm:w-auto"
          >
            Explore Clubs
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-12 grid max-w-xs grid-cols-3 gap-2 sm:max-w-lg sm:gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="font-display text-xl font-bold text-foreground sm:text-3xl">
                {s.value}
              </dt>
              <dd className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}

