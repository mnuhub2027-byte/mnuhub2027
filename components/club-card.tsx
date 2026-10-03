'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Users, Settings2 } from 'lucide-react'
import type { Club } from '@/lib/data'
import { categoryStyles } from '@/lib/category-styles'
import { useRole } from '@/components/role-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export function ClubCard({
  club,
  onView,
  index = 0,
}: {
  club: Club
  onView: (club: Club) => void
  index?: number
}) {
  const { role } = useRole()
  const { t } = useLanguage()
  const isTeamMember = role === 'leader' || role === 'assistant' || role === 'member'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.07, 0.42),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border glass transition-colors hover:border-primary/40 hover:glow-ring"
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <motion.img
          src={club.image || '/placeholder.svg'}
          alt={`${club.name} banner`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <span
          className={`absolute rtl:right-3 ltr:left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-medium ${categoryStyles[club.category]}`}
        >
          {t(`category.${club.category}` as any)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
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

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {isTeamMember ? (
            <motion.a
              href="#dashboard"
              className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <Settings2 className="size-4" />
              {t('club.manageTeam')}
            </motion.a>
          ) : (
            <motion.button
              onClick={() => onView(club)}
              className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px oklch(0.62 0.24 300 / 35%)' }}
              whileTap={{ scale: 0.96 }}
            >
              {t('club.applyNow')}
            </motion.button>
          )}
          <motion.button
            onClick={() => onView(club)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
          >
            {t('club.details')}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
