'use client'

import { motion, useInView } from 'framer-motion'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { type Category, type Club } from '@/lib/data'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ── Count-up hook ──────────────────────────────────────────────
function useCountUp(target: number | null, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === null) return
    setCount(0)
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return count
}

// ── Hero stat item with count-up ───────────────────────────────
function StatItem({ value, label, delay }: { value: number | null; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useCountUp(inView && value !== null ? value : null, 1600)

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <dt className="font-display text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tabular-nums">
        {value === null ? <span className="animate-pulse text-muted-foreground">—</span> : fmt(count)}
      </dt>
      <dd className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{label}</dd>
    </motion.div>
  )
}

// ── Main hero stats hook ───────────────────────────────────────
function useHeroStats() {
  const { t } = useLanguage()
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

  return [
    { label: t('hero.stats.clubs'), value: clubs },
    { label: t('hero.stats.members'), value: members },
    { label: t('hero.stats.events'), value: events },
  ]
}

// ── Container animation variants ──────────────────────────────
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

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

export function Hero({
  query,
  onQuery,
  clubs = [],
  onSelectClub,
  onExplore,
}: HeroProps) {
  const { t } = useLanguage()
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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/hero-campus.png"
          alt=""
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        {/* Decorative glow orbs */}
        <div className="absolute -top-20 left-1/4 size-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -top-10 right-1/4 size-72 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
        {/* Main content with stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="size-3.5 text-accent animate-pulse" />
            {t('hero.badge')}
          </motion.span>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="mt-5 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t('hero.title1')}
            <span className="text-gradient">{t('hero.title2')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base sm:mt-5 lg:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-8 max-w-2xl"
        >
          <div className="rounded-2xl border border-border glass p-2 glow-ring transition-all duration-300 focus-within:border-primary/50">
            <div className="flex items-center gap-3 rounded-xl bg-background/60 px-4">
              <Search className="size-5 shrink-0 text-primary" />
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onExplore()
                }}
                placeholder={t('hero.searchPlaceholder')}
                className="h-12 w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground rtl:text-right text-left"
              />
              {query && (
                <motion.button
                  type="button"
                  onClick={() => onQuery('')}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="rounded-lg bg-secondary/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {t('hero.search.clear')}
                </motion.button>
              )}
            </div>
          </div>

          {/* Live Search Dropdown */}
          {q.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto scrollbar-thin rounded-2xl border border-border bg-card/95 backdrop-blur-md p-2 shadow-2xl space-y-1"
            >
              {matchingClubs.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground flex items-center justify-between border-b border-border/40 pb-2">
                    <span>{t('hero.search.results')} "{query}" ({matchingClubs.length})</span>
                    <button
                      type="button"
                      onClick={onExplore}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {t('hero.search.viewInDirectory')}
                    </button>
                  </div>
                  {matchingClubs.map((club, i) => (
                    <motion.button
                      key={club.id}
                      type="button"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        if (onSelectClub) onSelectClub(club)
                        else onExplore()
                      }}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-start rtl:text-right transition-colors hover:bg-secondary/70 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary text-sm group-hover:scale-105 transition-transform">
                          {(club.name || 'CL').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-start rtl:text-right min-w-0">
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {club.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {club.tagline || club.description || club.faculty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mr-2 rtl:ml-2 rtl:mr-0">
                        <span className="rounded-lg bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {club.faculty || club.category}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-foreground">{t('hero.search.noResults')} "{query}"</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('hero.search.checkSpelling')}</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.58 }}
          className="mt-6 flex items-center justify-center"
        >
          <motion.button
            onClick={onExplore}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground w-full sm:w-auto shadow-lg"
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 30px oklch(0.62 0.24 300 / 40%)',
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {t('hero.exploreButton')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
          </motion.button>
        </motion.div>

        {/* Stats with count-up */}
        <dl className="mx-auto mt-14 grid max-w-xs grid-cols-3 gap-2 sm:max-w-lg sm:gap-6 lg:max-w-2xl lg:gap-12">
          {stats.map((s, i) => (
            <StatItem key={s.label} value={s.value} label={s.label} delay={i * 0.1} />
          ))}
        </dl>
      </div>
    </section>
  )
}
