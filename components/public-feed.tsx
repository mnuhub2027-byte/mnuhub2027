'use client'

import { useEffect, useRef, useState } from 'react'
import { Calendar, Megaphone, Pin, Clock, MapPin, Trophy, BookOpen, Sparkles, CalendarPlus, LayoutGrid, ListFilter } from 'lucide-react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type FeedItem = {
  id: string
  kind: 'event' | 'announcement'
  title: string
  body?: string
  author?: string
  clubName?: string
  clubCategory?: string
  pinned?: boolean
  dateFormatted: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  eventType?: string
  eventLabel?: string
  rawDate: number
}

const EVENT_TYPE_LABELS: Record<string, { ar: string; en: string; icon: any; color: string }> = {
  workshop: { ar: 'ورشة عمل', en: 'Workshop', icon: Sparkles, color: 'bg-primary/10 text-primary border-primary/20' },
  competition: { ar: 'مسابقة', en: 'Competition', icon: Trophy, color: 'bg-gold/15 text-gold border-gold/30' },
  course: { ar: 'كورس مجاني', en: 'Free Course', icon: BookOpen, color: 'bg-chart-3/15 text-chart-3 border-chart-3/30' },
  event: { ar: 'حدث عام', en: 'General Event', icon: Calendar, color: 'bg-accent/15 text-accent border-accent/30' },
}

function createGoogleCalendarUrl(title: string, body?: string, location?: string, dateStr?: string) {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const text = encodeURIComponent(`[MNUHub] ${title}`)
  const details = encodeURIComponent(body || 'حدث طلابي عبر منصة MNUHub - جامعة المنصورة الأهلية')
  const loc = encodeURIComponent(location || 'جامعة المنصورة الأهلية')
  return `${baseUrl}&text=${text}&details=${details}&location=${loc}`
}

// ── Shimmer skeleton card ──────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 p-5 space-y-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded-full shimmer" />
          <div className="h-2.5 w-16 rounded-full shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-full shimmer" />
        <div className="h-3 w-full rounded-full shimmer" />
        <div className="h-3 w-5/6 rounded-full shimmer" />
      </div>
      <div className="rounded-xl border border-border/40 p-3 space-y-2">
        <div className="h-3 w-2/3 rounded-full shimmer" />
        <div className="h-3 w-1/2 rounded-full shimmer" />
      </div>
    </div>
  )
}

// ── Filter button ──────────────────────────────────────────────
function FilterBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon?: any; label: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </motion.button>
  )
}

export function PublicFeed() {
  const { t, language } = useLanguage()
  const isAr = language === 'ar'

  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'events' | 'announcements'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  useEffect(() => {
    async function loadFeed() {
      const supabase = createClient()
      try {
        const [eventsRes, annsRes, clubsRes] = await Promise.all([
          supabase.from('team_events').select('*').order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('clubs').select('*'),
        ])

        const clubsMap = new Map((clubsRes.data || []).map((c: any) => [c.id, c]))

        const mappedEvents: FeedItem[] = (eventsRes.data || []).map((ev: any) => {
          const club = clubsMap.get(ev.club_id)
          const typeKey = (ev.type || 'event').toLowerCase()
          const typeInfo = EVENT_TYPE_LABELS[typeKey] || EVENT_TYPE_LABELS.event
          const createdAt = ev.created_at ? new Date(ev.created_at).getTime() : (ev.date ? new Date(ev.date).getTime() : 0)
          return {
            id: 'ev-' + ev.id,
            kind: 'event',
            title: ev.title,
            body: ev.description || '',
            author: club?.name ? (language === 'ar' ? `فريق ${club.name}` : `${club.name} Team`) : t('feed.universityTeam'),
            clubName: club?.name,
            clubCategory: club?.category,
            pinned: false,
            dateFormatted: ev.date || (ev.created_at ? new Date(ev.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }) : ''),
            eventDate: ev.date,
            eventTime: ev.time,
            eventLocation: ev.location || t('feed.defaultLocation'),
            eventType: typeKey,
            eventLabel: language === 'ar' ? typeInfo.ar : typeInfo.en,
            rawDate: createdAt,
          }
        })

        const mappedAnns: FeedItem[] = (annsRes.data || []).map((a: any) => {
          const club = clubsMap.get(a.club_id)
          const createdAt = a.created_at ? new Date(a.created_at).getTime() : 0
          return {
            id: 'an-' + a.id,
            kind: 'announcement',
            title: a.title,
            body: a.body,
            author: a.author || (club?.name ? (language === 'ar' ? `أدمن ${club.name}` : `${club.name} Admin`) : t('feed.teamAdmin')),
            clubName: club?.name,
            clubCategory: club?.category,
            pinned: a.pinned || false,
            dateFormatted: a.created_at
              ? new Date(a.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '',
            rawDate: createdAt,
          }
        })

        const combined = [...mappedEvents, ...mappedAnns].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return b.rawDate - a.rawDate
        })

        setItems(combined)
      } catch (err) {
        console.error('Failed to load university feed:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeed()
  }, [language])

  const filteredItems = items.filter((item) => {
    if (filter === 'events') return item.kind === 'event'
    if (filter === 'announcements') return item.kind === 'announcement'
    return true
  })

  return (
    <section
      id="events"
      ref={sectionRef}
      className="border-t border-border/60 bg-background py-16 sm:py-20 text-start rtl:text-right"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              {t('feed.badge')}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t('feed.title')}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground text-sm sm:text-base">
              {t('feed.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="size-3.5" />
                {isAr ? 'شبكي' : 'Grid'}
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  viewMode === 'timeline' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListFilter className="size-3.5" />
                {isAr ? 'جدول الزمني' : 'Timeline'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5">
              <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={`${t('feed.all')} (${items.length})`} />
              <FilterBtn active={filter === 'events'} onClick={() => setFilter('events')} icon={Calendar} label={`${t('feed.events')} (${items.filter(i => i.kind === 'event').length})`} />
              <FilterBtn active={filter === 'announcements'} onClick={() => setFilter('announcements')} icon={Megaphone} label={`${t('feed.announcements')} (${items.filter(i => i.kind === 'announcement').length})`} />
            </div>
          </div>
        </motion.div>

        {/* Shimmer skeleton loading */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground"
          >
            <Megaphone className="mx-auto size-8 opacity-40 mb-2" />
            <p className="text-base font-medium">{t('feed.noUpdates')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === 'events' ? t('feed.noEventsDesc') : t('feed.noAnnsDesc')}
            </p>
          </motion.div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View */
          <div className="relative border-l rtl:border-r rtl:border-l-0 border-border/80 pl-6 rtl:pr-6 rtl:pl-0 space-y-8">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex flex-col gap-2 rounded-2xl border border-border glass p-5 transition-colors hover:border-primary/40"
              >
                {/* Bullet */}
                <div className="absolute top-6 -left-[31px] rtl:-right-[31px] rtl:left-auto flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary">{item.author}</span>
                  <span className="text-xs font-sans text-muted-foreground">{item.dateFormatted}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                {item.body && <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>}

                {item.kind === 'event' && (
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">{item.eventLocation} · {item.eventTime}</span>
                    <a
                      href={createGoogleCalendarUrl(item.title, item.body, item.eventLocation, item.eventDate)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      <CalendarPlus className="size-3.5" />
                      {isAr ? 'حفظ في تقويم جوجل' : 'Add to Google Calendar'}
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                if (item.kind === 'event') {
                  const typeKey = item.eventType || 'event'
                  const typeInfo = EVENT_TYPE_LABELS[typeKey] || EVENT_TYPE_LABELS.event
                  const EventIcon = typeInfo.icon
                  const label = language === 'ar' ? typeInfo.ar : typeInfo.en

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ delay: Math.min(idx * 0.06, 0.36), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
                      className="relative flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] to-background p-5 glass transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="inline-flex rounded-xl bg-primary/15 p-2.5 text-primary">
                            <EventIcon className="size-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-primary block">
                              {t('feed.newEvent')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.clubName || t('feed.universityTeam')}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${typeInfo.color}`}>
                          {label}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground leading-tight">
                          {item.title}
                        </h3>
                        {item.body && (
                          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                            {item.body}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto space-y-2 rounded-xl border border-border/60 bg-secondary/40 p-3 text-xs">
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="size-3.5 text-primary" />
                            {t('feed.date')}
                          </span>
                          <span className="font-semibold font-sans">{item.eventDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="size-3.5 text-accent" />
                            {t('feed.time')}
                          </span>
                          <span className="font-semibold font-sans">{item.eventTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-3.5 text-chart-4" />
                            {t('feed.location')}
                          </span>
                          <span className="font-semibold truncate max-w-[180px]">{item.eventLocation}</span>
                        </div>
                      </div>

                      {/* Add to Google Calendar Action */}
                      <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs">
                        <span className="font-medium text-foreground/80 text-[11px] truncate max-w-[140px]">{item.author}</span>
                        <a
                          href={createGoogleCalendarUrl(item.title, item.body, item.eventLocation, item.eventDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <CalendarPlus className="size-3" />
                          {isAr ? 'تقويم جوجل' : 'Google Calendar'}
                        </a>
                      </div>
                    </motion.div>
                  )
                }

                // Announcement Card
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ delay: Math.min(idx * 0.06, 0.36), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
                    className="relative flex flex-col gap-4 rounded-2xl border border-border glass p-5 transition-colors hover:bg-secondary/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex rounded-xl bg-secondary p-2.5 text-foreground">
                        <Megaphone className="size-5" />
                      </div>
                      {item.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold border border-gold/30">
                          <Pin className="size-3" />
                          {t('feed.pinned')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {t('feed.announcementTag')}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{item.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{item.author}</span>
                      <span className="font-sans">{item.dateFormatted}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}
