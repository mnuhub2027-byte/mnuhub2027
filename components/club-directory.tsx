'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { SearchX, Filter, Building } from 'lucide-react'
import { useRef, useState } from 'react'
import { categories, faculties, type Category, type Club } from '@/lib/data'
import { ClubCard } from './club-card'
import { useLanguage } from '@/lib/i18n/LanguageContext'

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
  const { t, language } = useLanguage()
  const isAr = language === 'ar'

  const [selectedFaculty, setSelectedFaculty] = useState<string>('All')
  const currentFaculties = faculties[language] || faculties.ar

  const categoryFilters: (Category | 'All')[] = ['All', ...categories]
  const facultyFilters = [
    { value: 'All', label: isAr ? 'كل الكليات' : 'All Faculties' },
    ...currentFaculties.map((f) => ({ value: f, label: f })),
  ]

  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  // Dual-axis filtering: Category + Faculty (exclude suspended teams)
  const displayClubs = clubs.filter((c) => {
    if (c.status === 'suspended') return false
    const matchesCategory = category === 'All' || c.category === category
    const matchesFaculty =
      selectedFaculty === 'All' ||
      (c.faculty || '').toLowerCase().includes(selectedFaculty.toLowerCase()) ||
      selectedFaculty.toLowerCase().includes((c.faculty || '').toLowerCase())
    return matchesCategory && matchesFaculty
  })

  return (
    <section id="directory" ref={sectionRef} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 text-start rtl:text-right">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
            {t('directory.title')}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground sm:text-base">
            {displayClubs.length} {displayClubs.length === 1 ? t('directory.match') : t('directory.matches')}{' '}
            {t('directory.filterText')}
          </p>
        </div>

        {/* Faculty Select Dropdown */}
        <div className="flex items-center gap-2">
          <Building className="size-4 text-primary shrink-0" />
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary transition-colors max-w-[200px] sm:max-w-xs truncate"
          >
            {facultyFilters.map((fac) => (
              <option key={fac.value} value={fac.value} className="bg-card text-foreground">
                {fac.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
        className="mt-6 flex flex-wrap gap-2"
      >
        {categoryFilters.map((c, i) => {
          const active = category === c
          return (
            <motion.button
              key={c}
              onClick={() => onCategory(c)}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.18 + i * 0.04, duration: 0.3, type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {t(`category.${c}` as any)}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Club grid */}
      {displayClubs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-16 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center"
        >
          <SearchX className="size-8 text-muted-foreground opacity-40" />
          <p className="font-medium text-foreground">{t('directory.noClubs')}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t('directory.tryAdjusting')}
          </p>
          {(category !== 'All' || selectedFaculty !== 'All') && (
            <button
              onClick={() => {
                onCategory('All')
                setSelectedFaculty('All')
              }}
              className="mt-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary/80 transition-colors"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </motion.div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {displayClubs.map((club, i) => (
              <ClubCard key={club.id} club={club} onView={onView} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
