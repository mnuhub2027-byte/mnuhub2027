'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type DashboardTab = {
  id: string
  label: string
  icon: LucideIcon
  render: () => ReactNode
}

export function DashboardShell({
  tabs,
  accent = 'text-primary',
  sidebarHeader,
}: {
  tabs: DashboardTab[]
  accent?: string
  sidebarHeader?: ReactNode
}) {
  const [active, setActive] = useState(tabs[0]?.id)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div className="flex flex-col gap-4 lg:grid lg:gap-6 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        {sidebarHeader ? (
          <div className="mb-3 hidden rounded-2xl border border-border glass p-4 lg:block">
            {sidebarHeader}
          </div>
        ) : null}
        <nav
          className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border glass p-2 lg:flex-col lg:overflow-visible"
          aria-label="Dashboard sections"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:px-3.5',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="dash-tab-pill"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                  />
                )}
                <tab.icon
                  className={cn(
                    'relative z-10 size-4 shrink-0',
                    isActive ? accent : '',
                  )}
                />
                <span className="relative z-10 whitespace-nowrap text-xs sm:text-sm">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {current?.render()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---- Small shared building blocks used by every workspace ---- */

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="font-display text-xl font-bold tracking-tight">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'text-primary',
  hint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border glass p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <Icon className={cn('size-5', accent)} />
        {hint ? (
          <span className="text-xs font-medium text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  )
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-border glass p-5', className)}>
      {children}
    </div>
  )
}
