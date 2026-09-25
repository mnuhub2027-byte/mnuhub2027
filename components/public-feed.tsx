'use client'

import { useEffect, useState } from 'react'
import { Calendar, Megaphone, Pin, Clock, MapPin, Trophy, BookOpen, Sparkles, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

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

const EVENT_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  workshop: { label: 'ورشة عمل', icon: Sparkles, color: 'bg-primary/10 text-primary border-primary/20' },
  competition: { label: 'مسابقة', icon: Trophy, color: 'bg-gold/15 text-gold border-gold/30' },
  course: { label: 'كورس مجاني', icon: BookOpen, color: 'bg-chart-3/15 text-chart-3 border-chart-3/30' },
  event: { label: 'حدث عام', icon: Calendar, color: 'bg-accent/15 text-accent border-accent/30' },
}

export function PublicFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'events' | 'announcements'>('all')

  useEffect(() => {
    async function loadFeed() {
      const supabase = createClient()

      try {
        const [eventsRes, annsRes, clubsRes] = await Promise.all([
          supabase
            .from('team_events')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('clubs')
            .select('id, name, category, image')
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
            author: club?.name ? `فريق ${club.name}` : 'فريق جامعي',
            clubName: club?.name,
            clubCategory: club?.category,
            pinned: false,
            dateFormatted: ev.date || (ev.created_at ? new Date(ev.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : ''),
            eventDate: ev.date,
            eventTime: ev.time,
            eventLocation: ev.location || 'يحدد لاحقاً',
            eventType: typeKey,
            eventLabel: typeInfo.label,
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
            author: a.author || (club?.name ? `أدمن ${club.name}` : 'أدمن الفريق'),
            clubName: club?.name,
            clubCategory: club?.category,
            pinned: a.pinned || false,
            dateFormatted: a.created_at
              ? new Date(a.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
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
  }, [])

  const filteredItems = items.filter((item) => {
    if (filter === 'events') return item.kind === 'event'
    if (filter === 'announcements') return item.kind === 'announcement'
    return true
  })

  return (
    <section id="events" className="border-t border-border/60 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              آخر الأحداث والتحديثات الجامعية
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              University Feed
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground text-sm sm:text-base">
              تابع كافة الأحداث، المسابقات، الفعاليات، والإعلانات الرسمية الصادرة من جميع فرق وأندية الجامعة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              الكل ({items.length})
            </button>
            <button
              onClick={() => setFilter('events')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === 'events'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Calendar className="size-3.5" />
              الأحداث والفعاليات ({items.filter(i => i.kind === 'event').length})
            </button>
            <button
              onClick={() => setFilter('announcements')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === 'announcements'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Megaphone className="size-3.5" />
              الإعلانات ({items.filter(i => i.kind === 'announcement').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-sm">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
            جاري تحميل الأحداث والإعلانات...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Megaphone className="mx-auto size-8 opacity-40 mb-2" />
            <p className="text-base font-medium">لا توجد تحديثات حالياً</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === 'events' ? 'لم يتم نشر أي أحداث قادمة بعد.' : 'لم يتم نشر أي إعلانات بعد.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                if (item.kind === 'event') {
                  const typeKey = item.eventType || 'event'
                  const typeInfo = EVENT_TYPE_LABELS[typeKey] || EVENT_TYPE_LABELS.event
                  const EventIcon = typeInfo.icon

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.35 }}
                      className="relative flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] to-background p-5 glass transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="inline-flex rounded-xl bg-primary/15 p-2.5 text-primary">
                            <EventIcon className="size-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-primary block">
                              حدث جديد 🎯
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.clubName || 'فريق بالجامعة'}
                            </span>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${typeInfo.color}`}>
                          {item.eventLabel}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {item.title}
                        </h3>
                        {item.body && (
                          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                            {item.body}
                          </p>
                        )}
                      </div>

                      {/* Event Details Card */}
                      <div className="mt-auto space-y-2 rounded-xl border border-border/60 bg-secondary/40 p-3 text-xs">
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="size-3.5 text-primary" />
                            التاريخ:
                          </span>
                          <span className="font-semibold font-sans">{item.eventDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="size-3.5 text-accent" />
                            الوقت:
                          </span>
                          <span className="font-semibold font-sans">{item.eventTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-foreground">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-3.5 text-chart-4" />
                            المكان:
                          </span>
                          <span className="font-semibold truncate max-w-[180px]">{item.eventLocation}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{item.author}</span>
                        <span className="font-sans text-[11px]">{item.dateFormatted}</span>
                      </div>
                    </motion.div>
                  )
                }

                // Announcement Card
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, duration: 0.35 }}
                    className="relative flex flex-col gap-4 rounded-2xl border border-border glass p-5 transition-all hover:bg-secondary/20 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex rounded-xl bg-secondary p-2.5 text-foreground">
                        <Megaphone className="size-5" />
                      </div>
                      {item.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold border border-gold/30">
                          <Pin className="size-3" />
                          مثبّت
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          إعلان
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold">{item.title}</h3>
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


