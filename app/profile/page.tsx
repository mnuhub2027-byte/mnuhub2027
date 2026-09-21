'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Mail, Building, User, LayoutDashboard, Settings, UserRoundCog, Building2, Crown, ShieldCheck, Edit2, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { type Role, roleMeta } from '@/components/role-context'

type UserData = {
  id: string
  email: string
  full_name: string
  faculty: string
  student_id: string
  role: Role
}

const facultyMap: Record<string, string> = {
  engineering: 'Engineering',
  science: 'Sciences',
  business: 'Business School',
  arts: 'Arts & Humanities',
  medicine: 'Medicine'
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editFaculty, setEditFaculty] = useState('')
  const [editStudentId, setEditStudentId] = useState('')

  const supabase = createClient()

  const handleEditToggle = () => {
    if (!isEditing && user) {
      setEditFaculty(user.faculty || '')
      setEditStudentId(user.student_id || '')
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error, data } = await supabase.auth.updateUser({
        data: {
          faculty: editFaculty,
          student_id: editStudentId
        }
      })
      
      if (error) throw error

      setUser(prev => prev ? {
        ...prev,
        faculty: editFaculty,
        student_id: editStudentId
      } : null)
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata.full_name || 'MNU Student',
          faculty: session.user.user_metadata.faculty || '',
          student_id: session.user.user_metadata.student_id || '',
          role: (session.user.user_metadata.role as Role) || 'applicant',
        })
      }
      setLoading(false)
    }
    
    loadUser()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <User className="mb-4 size-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Not signed in</h2>
          <p className="mt-2 text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </main>
    )
  }

  const meta = roleMeta[user.role]
  const Icon = meta.icon

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 glass p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_50%)] opacity-10"></div>
          
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary glow-ring sm:size-32">
              <span className="text-3xl font-bold">{user.full_name.charAt(0).toUpperCase()}</span>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{user.full_name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${meta.dot.replace('bg-', 'bg-')}/10 ${meta.accent}`}>
                  <Icon className="size-4" />
                  {meta.label}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              {isEditing ? (
                <>
                  <button onClick={handleEditToggle} className="flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-secondary">
                    <X className="size-4 mr-2" />
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100">
                    {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEditToggle} className="flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-secondary">
                    <Edit2 className="size-4 mr-2" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      window.location.href = '/auth'
                    }}
                    className="flex h-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Details Sidebar */}
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-display text-lg font-bold">Academic Info</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Building className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Faculty</p>
                    {isEditing ? (
                      <select value={editFaculty} onChange={(e) => setEditFaculty(e.target.value)} className="mt-1 w-full appearance-none rounded-lg border border-border bg-background py-1.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground">
                        <option value="" disabled>Select faculty</option>
                        <option value="engineering">Engineering</option>
                        <option value="science">Sciences</option>
                        <option value="business">Business School</option>
                        <option value="arts">Arts & Humanities</option>
                        <option value="medicine">Medicine</option>
                      </select>
                    ) : (
                      <p className="font-medium">{facultyMap[user.faculty] || user.faculty || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Student ID</p>
                    {isEditing ? (
                      <input value={editStudentId} onChange={(e) => setEditStudentId(e.target.value)} type="text" placeholder="e.g. 20240101" className="mt-1 w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    ) : (
                      <p className="font-medium">{user.student_id || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Teams */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">My Clubs & Teams</h3>
                <a href="/#directory" className="text-sm font-medium text-primary hover:underline">Explore more</a>
              </div>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Mock Club 1 */}
                <div className="flex items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-chart-1/10 text-chart-1">
                    <LayoutDashboard className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">GDSC MNU</h4>
                    <p className="text-sm text-muted-foreground">Core Team Member</p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">Active</span>
                  </div>
                </div>

                {/* Mock Club 2 */}
                <div className="flex items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                    <UserRoundCog className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Robotics Club</h4>
                    <p className="text-sm text-muted-foreground">Hardware Engineer</p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
