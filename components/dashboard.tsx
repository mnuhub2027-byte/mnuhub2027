'use client'

import { motion, useInView } from 'framer-motion'
import { LayoutDashboard, LogIn, Lock } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { useRole, roleMeta } from '@/components/role-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const WorkspaceSkeleton = () => (
  <div className="h-64 w-full animate-pulse rounded-2xl border border-border/50 bg-secondary/30" />
)

const ApplicantWorkspace = dynamic(
  () => import('@/components/workspaces/applicant-workspace').then((m) => m.ApplicantWorkspace),
  { loading: WorkspaceSkeleton, ssr: false }
)
const MemberWorkspace = dynamic(
  () => import('@/components/workspaces/member-workspace').then((m) => m.MemberWorkspace),
  { loading: WorkspaceSkeleton, ssr: false }
)
const AssistantWorkspace = dynamic(
  () => import('@/components/workspaces/assistant-workspace').then((m) => m.AssistantWorkspace),
  { loading: WorkspaceSkeleton, ssr: false }
)
const LeaderWorkspace = dynamic(
  () => import('@/components/workspaces/leader-workspace').then((m) => m.LeaderWorkspace),
  { loading: WorkspaceSkeleton, ssr: false }
)
const OwnerWorkspace = dynamic(
  () => import('@/components/workspaces/owner-workspace').then((m) => m.OwnerWorkspace),
  { loading: WorkspaceSkeleton, ssr: false }
)

export function Dashboard() {
  const { role } = useRole()
  const { language } = useLanguage()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const currentMeta = roleMeta[role]
  const isAr = language === 'ar'

  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <section
      id="dashboard"
      ref={ref}
      className="border-t border-border/60 bg-secondary/20 py-16 sm:py-20 text-start rtl:text-right"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!session && !loading ? (
          /* Unauthenticated / Guest View: Show only login prompt card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl border border-border bg-card/80 shadow-xl backdrop-blur-xl max-w-2xl mx-auto"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 border border-primary/20">
              <Lock className="size-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {isAr ? 'لوحة التحكم غير متاحة للزوار' : 'Dashboard Access Restricted'}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
              {isAr
                ? 'يرجى تسجيل الدخول باستخدام البريد الجامعي الرسمي للوصول إلى لوحة التحكم الخاصة بك والتفاعل مع الأنشطة والفرق الطلابية.'
                : 'Please sign in with your official university account to access your personal workspace and interact with campus activities.'}
            </p>
            <a
              href="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
            >
              <LogIn className="size-4" />
              {isAr ? 'تسجيل الدخول بالحساب الجامعي' : 'Sign In with University Account'}
            </a>
          </motion.div>
        ) : (
          /* Authenticated User View: Show user's workspace */
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
                  <LayoutDashboard className="size-3.5 text-primary" />
                  {isAr ? 'لوحة التحكم الطلابية' : 'Student Control Workspace'}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">
                  {isAr ? `واجهة ${currentMeta.arabic}` : `${currentMeta.label} Workspace`}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {currentMeta.blurb[isAr ? 'ar' : 'en']}
                </p>
              </div>
            </motion.div>

            {/* Workspace content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
              className="mt-8"
            >
              {role === 'applicant' && <ApplicantWorkspace />}
              {role === 'member' && <MemberWorkspace />}
              {role === 'assistant' && <AssistantWorkspace />}
              {role === 'leader' && <LeaderWorkspace />}
              {role === 'owner' && <OwnerWorkspace />}
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
