'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Mail, Building, User, Edit2, Loader2, Save, X, Users, LogOut, ShieldCheck, Crown, LayoutDashboard, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { type Role, roleMeta, useRole } from '@/components/role-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { faculties } from '@/lib/data'

type UserData = {
  id: string
  email: string
  full_name: string
  faculty: string
  student_id: string
  role: Role
}

type ClubMembership = {
  id: string
  clubName: string
  role: string
  status: string
}

const roleLabelMap: Record<string, { ar: string; en: string }> = {
  leader: { ar: 'قائد الفريق', en: 'Team Leader' },
  assistant: { ar: 'مساعد القائد', en: 'Vice Leader / Admin' },
  member: { ar: 'عضو في الفريق', en: 'Active Member' },
  applicant: { ar: 'طالب متقدم', en: 'Applicant' },
  owner: { ar: 'إدارة الجامعة ورئيس المنصة', en: 'Platform Owner' },
}

export default function ProfilePage() {
  const { role: activeRole } = useRole()
  const { language, t } = useLanguage()
  const isAr = language === 'ar'
  const currentFaculties = faculties[language] || faculties.ar

  const [user, setUser] = useState<UserData | null>(null)
  const [clubs, setClubs] = useState<ClubMembership[]>([])
  const [loading, setLoading] = useState(true)

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
      const { error } = await supabase.auth.updateUser({
        data: { faculty: editFaculty, student_id: editStudentId },
      })
      if (error) throw error
      setUser((prev) =>
        prev ? { ...prev, faculty: editFaculty, student_id: editStudentId } : null
      )
      toast.success(isAr ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || (isAr ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile'))
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }

      const u = session.user
      setUser({
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata.full_name || (isAr ? 'عمرو مسلم' : 'Amr Mosalam'),
        faculty: u.user_metadata.faculty || (isAr ? 'كلية الهندسة' : 'Engineering'),
        student_id: u.user_metadata.student_id || '24040385',
        role: (u.user_metadata.role as Role) || 'owner',
      })

      const { data: memberships } = await supabase
        .from('club_members')
        .select('id, role, status, clubs(name)')
        .eq('user_id', u.id)

      if (memberships) {
        setClubs(memberships.map((m: any) => ({
          id: m.id,
          clubName: m.clubs?.name || (isAr ? 'فريق طلابي' : 'Student Team'),
          role: m.role,
          status: m.status,
        })))
      }

      setLoading(false)
    }
    loadUser()
  }, [isAr])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-start rtl:text-right">
        <SiteHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <User className="mb-4 size-12 text-muted-foreground opacity-40" />
          <h2 className="text-2xl font-bold font-display">
            {isAr ? 'لم تم تسجيل الدخول بعد' : 'Not signed in'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr ? 'يرجى تسجيل الدخول لعرض حسابك والتحكم به.' : 'Please sign in to view and manage your profile.'}
          </p>
          <a
            href="/auth"
            className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform"
          >
            {t('nav.signIn')}
          </a>
        </div>
      </main>
    )
  }

  const effectiveRole = activeRole || user.role || 'owner'
  const meta = roleMeta[effectiveRole]
  const Icon = meta.icon
  const roleDisplay = isAr ? meta.arabic : meta.label
  const isOwner = effectiveRole === 'owner'

  return (
    <main className="min-h-screen bg-background text-start rtl:text-right">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 glass p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_50%)] opacity-10" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className={`flex size-24 shrink-0 items-center justify-center rounded-full sm:size-28 ${isOwner ? 'bg-gold/20 text-gold glow-ring' : 'bg-primary/20 text-primary glow-ring'}`}>
              {isOwner ? <Crown className="size-12 text-gold animate-pulse" /> : <span className="text-3xl font-bold font-display">{user.full_name.charAt(0).toUpperCase()}</span>}
            </div>

            <div className="flex-1 text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{user.full_name}</h1>
                {isOwner && (
                  <span className="rounded-md bg-gold/15 border border-gold/30 px-2 py-0.5 text-xs font-bold text-gold flex items-center gap-1">
                    <Crown className="size-3" />
                    {isAr ? 'مالك المنصة الرسمي' : 'Official Owner'}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${meta.accent} border border-border/40 bg-secondary/60`}>
                  <Icon className="size-3.5" />
                  {roleDisplay}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3.5 text-primary" />
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-3 w-full sm:w-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="flex flex-1 sm:flex-initial h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <X className="mr-1.5 rtl:ml-1.5 rtl:mr-0 size-4" />
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex flex-1 sm:flex-initial h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs sm:text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:scale-[1.02] transition-transform"
                  >
                    {isSaving ? <Loader2 className="mr-1.5 rtl:ml-1.5 rtl:mr-0 size-4 animate-spin" /> : <Save className="mr-1.5 rtl:ml-1.5 rtl:mr-0 size-4" />}
                    {t('common.save')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <Edit2 className="size-4 text-primary" />
                    {isAr ? 'تعديل البيانات' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/auth' }}
                    className="flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-xs sm:text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="size-4" />
                    {t('nav.signOut')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Academic / Control Info */}
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                {isOwner ? (
                  <>
                    <ShieldCheck className="size-5 text-gold" />
                    <span>{isAr ? 'صلاحيات الإدارة العامة' : 'Governance Info'}</span>
                  </>
                ) : (
                  <span>{isAr ? 'البيانات الأكاديمية' : 'Academic Info'}</span>
                )}
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                    <Building className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{isOwner ? (isAr ? 'نطاق الإدارة' : 'Managed Scope') : t('modal.faculty')}</p>
                    {isEditing && !isOwner ? (
                      <select
                        value={editFaculty}
                        onChange={(e) => setEditFaculty(e.target.value)}
                        className="mt-1.5 w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="" disabled>{t('modal.selectFaculty')}</option>
                        {currentFaculties.map((fac) => (
                          <option key={fac} value={fac}>{fac}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="font-semibold text-sm mt-0.5 truncate">
                        {isOwner
                          ? (isAr ? 'جميع كليات جامعة المنصورة الأهلية الـ 10' : 'All 10 Faculties of Mansoura National University')
                          : (user.faculty || (isAr ? 'غير محدد' : 'Not specified'))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent mt-0.5">
                    {isOwner ? <Crown className="size-4 text-gold" /> : <GraduationCap className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{isOwner ? (isAr ? 'مستوى التحكم' : 'Access Level') : t('modal.studentId')}</p>
                    {isEditing && !isOwner ? (
                      <input
                        value={editStudentId}
                        onChange={(e) => setEditStudentId(e.target.value)}
                        type="text"
                        placeholder="20240101"
                        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="font-semibold text-sm font-sans mt-0.5">
                        {isOwner
                          ? (isAr ? 'مالك المنصة والرئيس التنفيذي (Super Admin)' : 'Super Admin / Platform Owner')
                          : (user.student_id || (isAr ? 'غير محدد' : 'Not specified'))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teams / Owner Control Panel */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  {isOwner
                    ? (isAr ? 'مركز قيادة ومتابعة أندية الجامعة' : 'Platform Management Hub')
                    : (isAr ? 'الفرق والأندية المشترك بها' : 'My Clubs & Teams')}
                </h3>
                <a href="/#dashboard" className="text-xs font-semibold text-primary hover:underline">
                  {isAr ? 'لوحة التفاعل ←' : 'Go to Dashboard →'}
                </a>
              </div>

              <div className="mt-6">
                {isOwner ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gold">{isAr ? 'تحكم رئيس المنصة' : 'Platform Owner Control'}</span>
                          <Sparkles className="size-4 text-gold" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isAr
                            ? 'لديك صلاحيات كاملة لإضافة وتعيين أدمنز الكليات، اعتماد الأندية الجديدة، ومتابعة إحصائيات التقديمات عبر كافة الكليات.'
                            : 'Full privileges to add faculty admins, approve new clubs, and track applications across all university faculties.'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{isAr ? 'صلاحيات الحساب' : 'Account Privileges'}</span>
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isAr
                            ? 'حسابك مفعل ويمتلك صلاحيات الإدارة الشاملة لأنشطة الجامعة.'
                            : 'Your account is active with full administrative privileges.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href="/#dashboard"
                        className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-gold/90 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        {isAr ? 'انتقل إلى واجهة رئيس المنصة' : 'Open Owner Workspace'}
                      </a>
                      <a
                        href="/#directory"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                      >
                        <Users className="size-4" />
                        {isAr ? 'استعرض دليل الفرق والأندية' : 'Browse Club Directory'}
                      </a>
                    </div>
                  </div>
                ) : clubs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
                    <Users className="mb-2 size-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {isAr ? 'لم تنضم لأي فريق بعد' : 'You haven’t joined any teams yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      {isAr ? 'تصفح دليل الأندية في الصفحة الرئيسية وقدم طلب الانضمام لتبدأ رحلتك.' : 'Browse the club directory on the main page and submit your application to get started.'}
                    </p>
                    <a href="/#directory" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      {t('hero.exploreButton')}
                    </a>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {clubs.map((club) => {
                      const roleText = roleLabelMap[club.role]?.[language] || club.role
                      return (
                        <div key={club.id} className="flex items-start gap-4 rounded-xl border border-border/80 bg-secondary/20 p-4 transition-colors hover:bg-secondary/40">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Users className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm truncate">{club.clubName}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{roleText}</p>
                            <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${club.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                              {club.status === 'active' ? (isAr ? 'عضو نشط' : 'Active') : club.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
