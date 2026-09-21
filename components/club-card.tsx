'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Users, Settings2 } from 'lucide-react'
import type { Club } from '@/lib/data'
import { categoryStyles } from '@/lib/category-styles'
import { useRole } from '@/components/role-context'

export function ClubCard({
  club,
  onView,
}: {
  club: Club
  onView: (club: Club) => void
}) {
  const { role } = useRole()
  const isTeamMember = role === 'leader' || role === 'assistant' || role === 'member'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border glass transition-all hover:-translate-y-1 hover:border-primary/40 hover:glow-ring"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={club.image || '/placeholder.svg'}
          alt={`${club.name} banner`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-medium ${categoryStyles[club.category]}`}
        >
          {club.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {club.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            {club.members.toLocaleString()}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {club.description}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {isTeamMember ? (
            <a
              href="#dashboard"
              className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02] hover:bg-primary/20"
            >
              <Settings2 className="size-4" />
              إدارة التيم
            </a>
          ) : (
            <button
              onClick={() => onView(club)}
              className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Apply Now
            </button>
          )}
          <button
            onClick={() => onView(club)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Details
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
