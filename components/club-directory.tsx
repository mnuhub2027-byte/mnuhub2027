'use client'

import { AnimatePresence } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { categories, type Category, type Club } from '@/lib/data'
import { ClubCard } from './club-card'

type DirectoryProps = {
  clubs: Club[]
  category: Category | 'All'
  onCategory: (c: Category | 'All') => void
  onView: (club: Club) => void
}

export function ClubDirectory({
  clubs,
  category,
  onCategory,
  onView,
}: DirectoryProps) {
  const filters: (Category | 'All')[] = ['All', ...categories]

  return (
    <section id="directory" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
            Explore the club directory
          </h2>
          <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground sm:text-base">
            {clubs.length} {clubs.length === 1 ? 'club matches' : 'clubs match'}{' '}
            your search. Filter by category to narrow it down.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((c) => {
          const active = category === c
          return (
            <button
              key={c}
              onClick={() => onCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>

      {clubs.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-medium">No clubs found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try adjusting your search or clearing the filters to see all clubs.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} onView={onView} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
