'use client'

import { useEffect, useState } from 'react'
import { Calendar, Megaphone, Pin } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type FeedItem = {
  id: string
  title: string
  body: string
  author: string
  pinned: boolean
  date: string
}

export function PublicFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeed() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(
          data.map((a: any) => ({
            id: a.id,
            title: a.title,
            body: a.body,
            author: a.author || 'أدمن الفريق',
            pinned: a.pinned || false,
            date: new Date(a.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }))
        )
      }
      setLoading(false)
    }
    loadFeed()
  }, [])

  return (
    <section id="events" className="border-t border-border/60 bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              University Feed
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Stay up to date with the latest campus news, events, and announcements from all clubs.
            </p>
          </div>
          <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
            <Calendar className="size-4" />
            Full Calendar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            جاري تحميل الإعلانات...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Megaphone className="mx-auto size-8 opacity-40 mb-2" />
            <p className="text-base font-medium">لا توجد أخبار حالياً</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative flex flex-col gap-4 rounded-2xl border border-border glass p-5 transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Megaphone className="size-5" />
                  </div>
                  {item.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
                      <Pin className="size-3" />
                      Pinned
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
                  <span>{item.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

