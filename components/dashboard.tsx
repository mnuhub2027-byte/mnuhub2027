'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'
import { useRole, roleMeta } from '@/components/role-context'
import { ApplicantWorkspace } from '@/components/workspaces/applicant-workspace'
import { MemberWorkspace } from '@/components/workspaces/member-workspace'
import { AssistantWorkspace } from '@/components/workspaces/assistant-workspace'
import { LeaderWorkspace } from '@/components/workspaces/leader-workspace'
import { OwnerWorkspace } from '@/components/workspaces/owner-workspace'

export function Dashboard() {
  const { role } = useRole()
  const currentMeta = roleMeta[role]

  return (
    <section
      id="dashboard"
      className="border-t border-border/60 bg-secondary/20 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
              <LayoutDashboard className="size-3.5 text-primary" />
              الواجهة التفاعلية المتكاملة (System Workspace)
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">
              واجهة {currentMeta.arabic}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {currentMeta.blurb} النظام متصل بالكامل: أي إجراء تتخذه يتم ربطه ديناميكياً مع باقي الواجهات الخمسه.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {role === 'applicant' && (
              <motion.div
                key="applicant"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <ApplicantWorkspace />
              </motion.div>
            )}
            {role === 'member' && (
              <motion.div
                key="member"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <MemberWorkspace />
              </motion.div>
            )}
            {role === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <AssistantWorkspace />
              </motion.div>
            )}
            {role === 'leader' && (
              <motion.div
                key="leader"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <LeaderWorkspace />
              </motion.div>
            )}
            {role === 'owner' && (
              <motion.div
                key="owner"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <OwnerWorkspace />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
