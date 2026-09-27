'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { categories, faculties, type Category, type Club } from '@/lib/data'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type HeroProps = {
  query: string
  onQuery: (v: string) => void
  faculty?: string
  onFaculty?: (v: string) => void
  category?: Category | 'All'
  onCategory?: (v: Category | 'All') => void
  clubs?: Club[]
  onSelectClub?: (club: Club) => void
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
  clubs = [],
  onSelectClub,
  onExplore,
}: HeroProps) {
  const stats = useHeroStats()

  // Fallback to fetch clubs directly if not provided
  const [dbClubs, setDbClubs] = useState<Club[]>([])
  useEffect(() => {
    if (!clubs || clubs.length === 0) {
      const supabase = createClient()
      supabase.from('clubs').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          setDbClubs(data.map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category || 'Tech',
            faculty: c.faculty || 'General',
            tagline: c.tagline || '',
            description: c.description || '',
            image: '/clubs/robotics.png',
            members: 1,
            achievements: [],
            events: [],
            openRoles: ['Member'],
          })))
        }
      })
    }
  }, [clubs])

  const allClubs = clubs && clubs.length > 0 ? clubs : dbClubs
  const q = query.trim().toLowerCase()
  const matchingClubs = allClubs.filter(
    (c) => q && (c.name || '').toLowerCase().includes(q)
  )

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
          className="relative mx-auto mt-8 max-w-2xl"
        >
          <div className="rounded-2xl border border-border glass p-2 glow-ring">
            <div className="flex items-center gap-3 rounded-xl bg-background/60 px-4">
              <Search className="size-5 shrink-0 text-primary" />
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onExplore()
                  }
                }}
                placeholder="ابحث باسم الفريق... / Search by team name..."
                className="h-12 w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQuery('')}
                  className="rounded-lg bg-secondary/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Live Search Results Dropdown */}
          {q.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card/95 backdrop-blur-md p-2 shadow-2xl space-y-1">
              {matchingClubs.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground flex items-center justify-between border-b border-border/40 pb-2">
                    <span>نتائج البحث عن "{query}" ({matchingClubs.length})</span>
                    <button
                      type="button"
                      onClick={onExplore}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      عرض في الدليل بالأسفل ↓
                    </button>
                  </div>
                  {matchingClubs.map((club) => (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => {
                        if (onSelectClub) {
                          onSelectClub(club)
                        } else {
                          onExplore()
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-right transition-colors hover:bg-secondary/70 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary text-sm group-hover:scale-105 transition-transform">
                          {(club.name || 'CL').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-right min-w-0">
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {club.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {club.tagline || club.description || club.faculty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mr-2">
                        <span className="rounded-lg bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {club.faculty || club.category}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-foreground">لا توجد أفرقة مطابقة لـ "{query}"</p>
                  <p className="mt-1 text-xs text-muted-foreground">تأكد من كتابة اسم الفريق بشكل صحيح.</p>
                </div>
              )}
            </div>
          )}
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

