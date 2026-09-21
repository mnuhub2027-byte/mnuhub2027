'use client'

import { useRole, roleMeta, roleOrder } from './role-context'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <div className="sticky top-0 z-[60] flex w-full flex-col items-center justify-center border-b border-border/50 bg-background/80 px-4 py-2 backdrop-blur-md sm:flex-row sm:gap-4">
      <span className="mb-2 text-xs font-medium text-muted-foreground sm:mb-0">
        Demo Persona:
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {roleOrder.map((r) => {
          const meta = roleMeta[r]
          const isActive = role === r
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="role-switcher-pill"
                  className="absolute inset-0 rounded-md bg-secondary"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              <meta.icon className={cn("relative z-10 size-3.5", isActive ? meta.accent : '')} />
              <span className="relative z-10">{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
