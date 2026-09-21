'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap,
  ShieldCheck,
  Users,
  Crown,
  Building2,
  type LucideIcon,
} from 'lucide-react'

export type Role = 'applicant' | 'member' | 'assistant' | 'leader' | 'owner'

export type RoleMeta = {
  id: Role
  label: string
  arabic: string
  blurb: string
  icon: LucideIcon
  /** tailwind text color token used for accents */
  accent: string
  dot: string
}

export const roleMeta: Record<Role, RoleMeta> = {
  applicant: {
    id: 'applicant',
    label: 'Applicant',
    arabic: 'طالب جديد',
    blurb: 'Browse clubs, apply, and track your applications.',
    icon: GraduationCap,
    accent: 'text-accent',
    dot: 'bg-accent',
  },
  member: {
    id: 'member',
    label: 'Member',
    arabic: 'عضو في التيم',
    blurb: 'Announcements, tasks, events, and your team directory.',
    icon: Users,
    accent: 'text-chart-3',
    dot: 'bg-chart-3',
  },
  assistant: {
    id: 'assistant',
    label: 'Admin',
    arabic: 'أدمن الفريق',
    blurb: 'Team admins have elevated privileges to assist leaders in managing operations and members.',
    icon: ShieldCheck,
    accent: 'text-primary',
    dot: 'bg-chart-4',
  },
  leader: {
    id: 'leader',
    label: 'Team Leader',
    arabic: 'قائد التيم',
    blurb: 'Executive dashboard: analytics, approvals, and members.',
    icon: Crown,
    accent: 'text-primary',
    dot: 'bg-primary',
  },
  owner: {
    id: 'owner',
    label: 'Platform Owner',
    arabic: 'إدارة الجامعة',
    blurb: 'Master control dashboard for platform-wide analytics and club creation.',
    icon: Building2,
    accent: 'text-gold',
    dot: 'bg-gold',
  },
}

export const roleOrder: Role[] = ['applicant', 'member', 'assistant', 'leader', 'owner']

type RoleContextType = {
  role: Role
  setRole: (role: Role) => void
  debugError?: string
}

const RoleContext = createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('applicant')
  const [loadingRole, setLoadingRole] = useState(true)
  const [debugError, setDebugError] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserRole(userId: string) {
      // 1. Check if user is owner in profiles
      const { data: profile } = await supabase.from('profiles').select('system_role').eq('id', userId).single()

      if (profile?.system_role?.trim().toLowerCase() === 'owner') {
        setRole('owner')
        setLoadingRole(false)
        return
      }

      // 2. Check club_members for highest role
      const { data: memberships } = await supabase.from('club_members').select('role, status').eq('user_id', userId)
      
      let highestRole: Role = 'applicant'
      if (memberships && memberships.length > 0) {
        const hasLeader = memberships.some(m => m.role === 'leader' && m.status === 'active')
        const hasAssistant = memberships.some(m => m.role === 'assistant' && m.status === 'active')
        const hasMember = memberships.some(m => m.role === 'member' && m.status === 'active')
        
        if (hasLeader) highestRole = 'leader'
        else if (hasAssistant) highestRole = 'assistant'
        else if (hasMember) highestRole = 'member'
      }

      setRole(highestRole)
      setLoadingRole(false)
    }

    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setLoadingRole(false)
      }
    })

    // Listen for logins/logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setRole('applicant')
        setLoadingRole(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <RoleContext.Provider value={{ role, setRole, debugError }}>
      {!loadingRole && children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}
