'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  ListTodo,
  UserCircle,
  Pin,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  Calendar as CalendarIcon,
  Megaphone,
  User,
  MessageCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
  LayoutGrid,
  List,
  LogOut,
} from 'lucide-react'
import { useSystem } from '@/lib/system-context'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/status-badge'
import {
  Panel,
  SectionTitle,
  type DashboardTab,
  DashboardShell,
} from '@/components/dashboard-shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { sanitizeUrl } from '@/lib/security'

type MemberProfile = {
  name: string
  initials: string
  clubName: string
  joinedAt: string
  role: string
  userId?: string
  email?: string
}

function useMemberProfile(): MemberProfile | null {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const { currentClubId, loadClubData } = useSystem()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const { data: mem } = await supabase
        .from('club_members')
        .select('club_id, role, created_at, clubs(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      const fullName = prof?.full_name || user.email || 'عضو'
      const parts = fullName.trim().split(' ')
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : fullName.slice(0, 2).toUpperCase()

      const clubName = (mem?.clubs as any)?.name || '—'
      const joinedAt = mem?.created_at
        ? new Date(mem.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
        : '—'

      setProfile({
        name: fullName,
        initials,
        clubName,
        joinedAt,
        role: mem?.role || 'member',
        userId: user.id,
        email: user.email,
      })

      if (mem?.club_id && mem.club_id !== currentClubId) {
        await loadClubData(mem.club_id)
      }
    })
  }, [])

  return profile
}

function Announcements() {
  const { announcements, teamEvents } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'الإعلانات والأنشطة بالفريق' : 'Team Announcements & Activities'}
        subtitle={
          isAr
            ? 'آخر التحديثات، الفعاليات، والتوجيهات الصادرة من قائد الفريق والمساعدين.'
            : 'Latest updates, events, and guidelines from team leaders and admins.'
        }
      />

      {/* Team Events Banner */}
      {teamEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarIcon className="size-4" />
            <span>{isAr ? `الفعاليات والأحداث القادمة للتيم (${teamEvents.length})` : `Upcoming Team Events (${teamEvents.length})`}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teamEvents.map((ev) => (
              <Panel key={ev.id} className="border-primary/20 bg-primary/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{ev.title}</p>
                  <StatusBadge status={ev.type} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-sans">
                    <CalendarIcon className="size-3 text-primary" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <Clock className="size-3 text-accent" />
                    {ev.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-chart-4" />
                    {ev.location}
                  </span>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Megaphone className="size-4" />
          <span>{isAr ? 'الإعلانات والتوجيهات' : 'Announcements & Directives'}</span>
        </div>
        {announcements.length === 0 && teamEvents.length === 0 ? (
          <Panel className="py-8 text-center text-sm text-muted-foreground">
            {isAr ? 'لا توجد إعلانات أو فعاليات منشورة بالفريق حالياً.' : 'No announcements or events published yet.'}
          </Panel>
        ) : (
          announcements.map((a) => (
            <Panel key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {a.pinned && <Pin className="size-4 text-primary" />}
                  <p className="font-medium text-foreground">{a.title}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground font-sans">
                  {a.date}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{a.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">— {a.author}</p>
            </Panel>
          ))
        )}
      </div>
    </div>
  )
}

function Calendar() {
  const { teamEvents } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  return (
    <div className="text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'جدول الأنشطة واللقاءات' : 'Activities & Meetings Calendar'}
        subtitle={isAr ? 'مواعيد ورش العمل، المسابقات، واللقاءات القادمة بالفريق.' : 'Upcoming workshops, competitions, and team meetings.'}
      />
      <div className="space-y-3">
        {teamEvents.length === 0 ? (
          <Panel className="py-8 text-center text-sm text-muted-foreground">
            {isAr ? 'لا توجد فعاليات مسجلة للفريق حالياً.' : 'No events scheduled for the team currently.'}
          </Panel>
        ) : (
          teamEvents.map((e) => {
            const dateObj = new Date(e.date)
            const isValid = !isNaN(dateObj.getTime())
            const monthStr = isValid ? dateObj.toLocaleDateString('en-US', { month: 'short' }) : (e.day || '')
            const dayNum = isValid ? dateObj.getDate() : e.date

            return (
              <Panel key={e.id} className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-secondary/50">
                  <span className="text-xs font-medium text-muted-foreground font-sans">
                    {monthStr}
                  </span>
                  <span className="font-display text-sm font-bold font-sans">
                    {dayNum}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{e.title}</p>
                    <StatusBadge status={e.type} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="size-3" />
                      {e.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {e.location}
                    </span>
                  </div>
                </div>
              </Panel>
            )
          })
        )}
      </div>
    </div>
  )
}

function Tasks() {
  const { myTasks, toggleTaskStatus, members } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const profile = useMemberProfile()
  const [showCompleted, setShowCompleted] = useState(false)
  const [taskView, setTaskView] = useState<'list' | 'kanban'>('list')

  const teamMember = members.find(
    (m) =>
      (profile?.userId && m.userId === profile.userId) ||
      (profile?.email && m.email && m.email.toLowerCase() === profile.email.toLowerCase()) ||
      (profile?.name && m.name.trim().toLowerCase() === profile.name.trim().toLowerCase())
  )

  const visibleTasks = myTasks.filter((t) => {
    if (!t.assigneeName || t.assigneeName === 'جميع أعضاء الفريق') {
      return true
    }

    const target = t.assigneeName.trim().toLowerCase()

    if (profile?.name && target === profile.name.trim().toLowerCase()) return true
    if (teamMember && target === teamMember.name.trim().toLowerCase()) return true
    if (profile?.email && target === profile.email.trim().toLowerCase()) return true

    return false
  })

  const todoTasks = visibleTasks.filter((t) => t.status !== 'In Progress' && t.status !== 'Done')
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'In Progress')
  const completedTasks = visibleTasks.filter((t) => t.status === 'Done')
  const pendingTasks = visibleTasks.filter((t) => t.status !== 'Done')

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle
          title={isAr ? 'المهام المسندة لي' : 'My Assigned Tasks'}
          subtitle={isAr ? 'متابعة وتنفيذ مهامك داخل الفريق وتسليمها مباشرة.' : 'Track, execute, and submit your team tasks directly.'}
        />
        <div className="flex items-center gap-1 self-start rounded-xl border border-border/80 bg-secondary/50 p-1">
          <button
            onClick={() => setTaskView('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              taskView === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="size-3.5" />
            <span>{isAr ? 'قائمة' : 'List'}</span>
          </button>
          <button
            onClick={() => setTaskView('kanban')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              taskView === 'kanban'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>{isAr ? 'كانبان' : 'Kanban Board'}</span>
          </button>
        </div>
      </div>

      {taskView === 'kanban' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Column 1: To Do */}
          <div className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-bold text-xs flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-amber-500"></span>
                {isAr ? 'قيد الانتظار (To Do)' : 'To Do'}
              </span>
              <span className="rounded-full bg-amber-500/10 text-amber-500 font-sans px-2 py-0.5 text-[11px] font-bold">
                {todoTasks.length}
              </span>
            </div>
            {todoTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? 'لا توجد مهام معلقة' : 'No tasks'}
              </p>
            ) : (
              todoTasks.map((t) => (
                <Panel key={t.id} className="p-3.5 space-y-2.5 bg-background shadow-xs hover:border-border transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground line-clamp-2">{t.title}</p>
                    <StatusBadge status={t.priority} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-sans">
                    {isAr ? `تاريخ التسليم: ${t.due}` : `Due: ${t.due}`}
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {t.assigneeName || (isAr ? 'الجميع' : 'Everyone')}
                    </span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold hover:bg-primary/20 transition-colors"
                    >
                      {isAr ? 'إنجاز ✓' : 'Complete ✓'}
                    </button>
                  </div>
                </Panel>
              ))
            )}
          </div>

          {/* Column 2: In Progress */}
          <div className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-bold text-xs flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-blue-500"></span>
                {isAr ? 'جاري العمل (In Progress)' : 'In Progress'}
              </span>
              <span className="rounded-full bg-blue-500/10 text-blue-500 font-sans px-2 py-0.5 text-[11px] font-bold">
                {inProgressTasks.length}
              </span>
            </div>
            {inProgressTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? 'لا توجد مهام قيد التنفيذ' : 'No tasks'}
              </p>
            ) : (
              inProgressTasks.map((t) => (
                <Panel key={t.id} className="p-3.5 space-y-2.5 bg-background shadow-xs hover:border-border transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground line-clamp-2">{t.title}</p>
                    <StatusBadge status={t.priority} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-sans">
                    {isAr ? `تاريخ التسليم: ${t.due}` : `Due: ${t.due}`}
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {t.assigneeName || (isAr ? 'الجميع' : 'Everyone')}
                    </span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="rounded-lg bg-chart-3 text-chart-3-foreground px-2.5 py-1 text-[11px] font-semibold hover:bg-chart-3/90 transition-colors"
                    >
                      {isAr ? 'تسليم ✓' : 'Submit ✓'}
                    </button>
                  </div>
                </Panel>
              ))
            )}
          </div>

          {/* Column 3: Done */}
          <div className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="font-bold text-xs flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                {isAr ? 'مكتملة ومسلمة (Done)' : 'Done'}
              </span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-500 font-sans px-2 py-0.5 text-[11px] font-bold">
                {completedTasks.length}
              </span>
            </div>
            {completedTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? 'لا توجد مهام مكتملة بعد' : 'No tasks'}
              </p>
            ) : (
              completedTasks.map((t) => (
                <Panel key={t.id} className="p-3.5 space-y-2.5 bg-background/60 shadow-xs border-emerald-500/20">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-muted-foreground line-through line-clamp-2">{t.title}</p>
                    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">✓</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground">
                      {isAr ? 'تم التسليم' : 'Submitted'}
                    </span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="rounded-lg border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      {isAr ? 'إعادة فتح' : 'Reopen'}
                    </button>
                  </div>
                </Panel>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <Panel className="py-12 text-center">
              <CheckCircle2 className="mx-auto size-12 text-chart-3/80 mb-3" />
              <p className="text-base font-bold text-foreground">
                {isAr ? 'رائع! لا توجد مهام معلقة لديك حالياً 🎉' : 'Awesome! No pending tasks currently 🎉'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAr
                  ? 'لقد قمت بإنجاز كافة مهامك المسندة، أو لم يتم إسناد مهام جديدة بعد.'
                  : 'You have completed all assigned tasks or no new tasks have been assigned.'}
              </p>
            </Panel>
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingTasks.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
                        <ListTodo className="size-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">
                            {t.title}
                          </p>
                          {t.assigneeName && t.assigneeName !== 'جميع أعضاء الفريق' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-chart-3/15 text-chart-3 px-2 py-0.5 text-[11px] font-semibold">
                              <User className="size-3" />
                              {isAr ? `المكلف: ${t.assigneeName}` : `Assigned to: ${t.assigneeName}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-muted-foreground px-2 py-0.5 text-[11px] font-medium">
                              <Users className="size-3" />
                              {isAr ? 'الجميع' : 'Everyone'}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground font-sans">
                            {isAr ? `تاريخ التسليم: ${t.due}` : `Due Date: ${t.due}`}
                          </span>
                          {t.submissionType === 'whatsapp' && t.submissionValue && (
                            <a
                              href={sanitizeUrl(`https://wa.me/${t.submissionValue.replace(/[^0-9]/g, '')}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>{isAr ? `تسليم واتساب (${t.submissionValue})` : `WhatsApp Submission (${t.submissionValue})`}</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                          {t.submissionType === 'link' && t.submissionValue && (
                            <a
                              href={sanitizeUrl(t.submissionValue.startsWith('http') ? t.submissionValue : `https://${t.submissionValue}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
                            >
                              <FileText className="size-3.5" />
                              <span>{isAr ? 'رابط التسليم (Drive / فورم)' : 'Submission Link (Drive / Form)'}</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />

                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-chart-3 px-3 py-1.5 text-xs font-bold text-chart-3-foreground shadow-sm transition-all duration-200 hover:scale-[1.04] hover:bg-chart-3/90"
                      >
                        <CheckCircle2 className="size-3.5" />
                        {isAr ? 'تم التسليم (Done)' : 'Done (Submitted)'}
                      </button>
                    </div>
                  </Panel>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {completedTasks.length > 0 && taskView === 'list' && (
        <div className="pt-2 border-t border-border/40">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            <span>{isAr ? `المهام المكتملة المسلمة (${completedTasks.length})` : `Completed Tasks (${completedTasks.length})`}</span>
          </button>

          {showCompleted && (
            <div className="mt-3 space-y-2 opacity-80">
              {completedTasks.map((t) => (
                <Panel
                  key={t.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2.5 bg-secondary/20"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-chart-3 shrink-0" />
                    <div>
                      <p className="text-sm font-medium line-through text-muted-foreground">{t.title}</p>
                      <span className="text-[11px] text-muted-foreground font-sans">
                        {isAr ? `تاريخ التسليم: ${t.due}` : `Due: ${t.due}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-chart-3/15 px-2 py-0.5 text-[10px] font-bold text-chart-3">
                      {isAr ? 'مكتملة ✓' : 'Completed ✓'}
                    </span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="size-3" />
                      {isAr ? 'إعادة فتح' : 'Reopen'}
                    </button>
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Directory() {
  const { members } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  return (
    <div className="text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'دليل أفراد الفريق' : 'Team Members Directory'}
        subtitle={isAr ? `${members.length} عضواً مسجلاً بالفريق حتى الآن.` : `${members.length} registered team members so far.`}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <Panel key={m.id} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chart-3/15 font-display text-sm font-bold text-chart-3">
              {m.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{m.name}</p>
            </div>
            <StatusBadge status={m.role} />
          </Panel>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const { requestPromotion, promotionRequests, leaveTeam } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const memberProfile = useMemberProfile()
  const [showModal, setShowModal] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [department, setDepartment] = useState('')
  const [phone, setPhone] = useState('')
  const [cvLink, setCvLink] = useState('')
  const [reason, setReason] = useState('')

  const activeReq = promotionRequests.find((r) =>
    memberProfile && (r.memberName.includes(memberProfile.name))
  )

  const handleApplyPromotion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !memberProfile) return
    requestPromotion(memberProfile.name, department, phone, cvLink, reason)
    setShowModal(false)
  }

  const handleLeaveTeam = async () => {
    setIsLeaving(true)
    await leaveTeam()
    setIsLeaving(false)
    setShowLeaveConfirm(false)
  }

  const roleLabel =
    memberProfile?.role === 'leader' ? (isAr ? 'قائد الفريق' : 'Team Leader') :
    memberProfile?.role === 'assistant' ? (isAr ? 'مساعد الأدمن' : 'Vice Leader') :
    (isAr ? 'عضو بالفريق' : 'Team Member')

  const rows = memberProfile ? [
    { label: isAr ? 'الفريق الحالي' : 'Current Team', value: memberProfile.clubName },
    { label: isAr ? 'الصفة بالفريق' : 'Role in Team', value: roleLabel },
    { label: isAr ? 'عضو منذ' : 'Member Since', value: memberProfile.joinedAt },
  ] : []

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'الملف الشخصي وصلاحيات العضو' : 'Profile & Member Permissions'}
        subtitle={isAr ? 'إدارة بياناتك وطلب الترقي لمساعد الأدمن.' : 'Manage your details and request promotion to Vice Leader.'}
      />
      
      {/* Promotion Request Banner */}
      <Panel className="border-chart-4/40 bg-gradient-to-r from-chart-4/10 via-background to-chart-4/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-chart-4 font-bold text-sm">
              <ShieldCheck className="size-5" />
              {isAr ? 'مسار الترقية إلى مساعد ليدر (Vice Leader)' : 'Promotion Path to Vice Leader'}
            </div>
            <p className="text-xs text-muted-foreground max-w-lg">
              {isAr
                ? 'يمكن للعضو في التيم تقديم طلب ترقية لمساعد الأدمن لإدارة التوظيف والعمليات التشغيلية. يتلقى أدمن الفريق الطلب للموافقة عليه.'
                : 'Team members can apply for promotion to Vice Leader to manage recruitment and operations. Leaders review and approve requests.'}
            </p>
          </div>

          {activeReq ? (
            <div className="rounded-xl border border-chart-4/30 bg-chart-4/15 px-4 py-2 text-xs font-bold text-chart-4">
              {activeReq.status === 'Pending'
                ? (isAr ? '⏳ طلب الترقية لمساعد قيد مراجعة الأدمن' : '⏳ Promotion request is under Admin review')
                : activeReq.status === 'Approved'
                  ? (isAr ? '🎉 تمت ترقيتك لمساعد بنجاح!' : '🎉 Promoted to Vice Leader successfully!')
                  : (isAr ? 'مرفوض' : 'Rejected')}
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-chart-4 px-4 py-2.5 text-xs font-bold text-chart-4-foreground hover:scale-105 transition-transform shrink-0 shadow-lg"
            >
              <Sparkles className="size-4" />
              {isAr ? 'تقديم طلب ترقية لمساعد' : 'Apply for Vice Leader Promotion'}
            </button>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-chart-3/15 font-display text-xl font-bold text-chart-3">
            {memberProfile?.initials ?? '..'}
          </span>
          <div>
            <p className="font-display text-lg font-bold">
              {memberProfile?.name ?? '...'}
            </p>
            <div className="mt-1">
              <StatusBadge status="Member" />
            </div>
          </div>
        </div>
        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {r.label}
              </dt>
              <dd className="mt-0.5 font-medium text-sm">{r.value}</dd>
            </div>
          ))}
        </dl>

        {/* Leave Team Button */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-red-400">
                {isAr ? '⚠️ مغادرة الفريق' : '⚠️ Leave Team'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? 'ستتم إزالتك من الفريق نهائياً ويمكنك التقديم لفريق آخر لاحقاً.'
                  : 'You will be permanently removed from the team. You can apply to another team later.'}
              </p>
            </div>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
            >
              <LogOut className="size-4" />
              {isAr ? 'مغادرة الفريق' : 'Leave Team'}
            </button>
          </div>
        </div>
      </Panel>

      {/* Confirmation Modal: Leave Team */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-background p-6 shadow-2xl space-y-4 text-start rtl:text-right"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2 text-red-400">
                  <LogOut className="size-5" />
                  {isAr ? 'تأكيد مغادرة الفريق' : 'Confirm Leave Team'}
                </h3>
                <button onClick={() => setShowLeaveConfirm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-foreground font-medium">
                  {isAr
                    ? `هل أنت متأكد أنك تريد مغادرة فريق "${memberProfile?.clubName}"؟`
                    : `Are you sure you want to leave "${memberProfile?.clubName}"?`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isAr
                    ? 'لن تتمكن من الوصول لبيانات الفريق بعد المغادرة. يمكنك التقديم لفريق آخر من الصفحة الرئيسية.'
                    : 'You will lose access to all team data. You can apply to another team from the home page.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleLeaveTeam}
                  disabled={isLeaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {isLeaving ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isLeaving
                    ? (isAr ? 'جاري المغادرة...' : 'Leaving...')
                    : (isAr ? 'نعم، مغادرة الفريق' : 'Yes, Leave Team')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal request promotion */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4 text-start rtl:text-right"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2 text-chart-4">
                  <ShieldCheck className="size-5" />
                  {isAr ? 'طلب ترقية إلى مساعد الليدر' : 'Request Vice Leader Promotion'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleApplyPromotion} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {isAr ? 'القسم التخصصي المُراد إدارته' : 'Department to Manage'}
                  </label>
                  <input
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Machine Learning / Recruitment"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {isAr ? 'رقم التليفون (واتساب)' : 'WhatsApp Phone Number'}
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1XX XXX XXXX"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {isAr ? 'رابط الـ CV / Portfolio' : 'CV / Portfolio Link'}
                  </label>
                  <input
                    required
                    type="url"
                    value={cvLink}
                    onChange={(e) => setCvLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {isAr ? 'سبب وسابقة أعمالك المؤهلة للترقية' : 'Qualifications & Reason for Promotion'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={isAr ? 'اكتب بالتفصيل إنجازاتك بالفريق ولماذا ترغب في أن تصبح مساعداً...' : 'Detail your achievements and why you want to become a Vice Leader...'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-chart-4 px-4 py-2 text-sm font-bold text-chart-4-foreground hover:scale-105 transition-transform"
                  >
                    {isAr ? 'إرسال الطلب للليدر' : 'Submit to Leader'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MemberWorkspace() {
  const memberProfile = useMemberProfile()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const tabs: DashboardTab[] = [
    { id: 'announcements', label: isAr ? 'الإعلانات' : 'Announcements', icon: Bell, render: () => <Announcements /> },
    { id: 'calendar', label: isAr ? 'التقويم' : 'Calendar', icon: CalendarDays, render: () => <Calendar /> },
    { id: 'tasks', label: isAr ? 'مهامي' : 'My Tasks', icon: ListTodo, render: () => <Tasks /> },
    { id: 'profile', label: isAr ? 'الملف الشخصي والترقية' : 'Profile & Promotion', icon: UserCircle, render: () => <Profile /> },
  ]

  return (
    <DashboardShell
      tabs={tabs}
      accent="text-chart-3"
      sidebarHeader={
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-chart-3/15 font-display text-sm font-bold text-chart-3">
            {memberProfile?.initials ?? '..'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {memberProfile?.name ?? '...'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isAr ? 'حساب عضو في الفريق' : 'Team Member Account'}
            </p>
          </div>
        </div>
      }
    />
  )
}

