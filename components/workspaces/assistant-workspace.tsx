'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  KanbanSquare,
  CalendarClock,
  ClipboardCheck,
  Star,
  ChevronRight,
  Plus,
  Check,
  UserCheck,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { pipelineStages, type Applicant } from '@/lib/data'
import { useSystem } from '@/lib/system-context'
import { StatusBadge } from '@/components/status-badge'
import {
  DashboardShell,
  Panel,
  SectionTitle,
  type DashboardTab,
} from '@/components/dashboard-shell'
import { Announcement } from '@/lib/data'

const stageColor: Record<string, string> = {
  Reviewing: 'text-chart-4',
  Interview: 'text-accent',
  Accepted: 'text-chart-3',
}

function Pipeline() {
  const { applicants, advanceApplicantStage, acceptApplicantToTeam, rejectApplicant } = useSystem()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [openNote, setOpenNote] = useState<string | null>(null)

  return (
    <div>
      <SectionTitle
        title="عمليات القبول والتوظيف (المساعدين)"
        subtitle="مراجعة طلبات اليوزر العادي، المقابلات، وقبولهم رسمياً كـ أثر في الفريق."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {pipelineStages.map((stage) => {
          const col = applicants.filter((a) => a.stage === stage)
          return (
            <div
              key={stage}
              className="rounded-2xl border border-border bg-background/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${stageColor[stage]}`}>
                  {stage === 'Reviewing' ? 'قيد المراجعة' : stage === 'Interview' ? 'مقابلة شخصية' : 'مقبول بالفريق'}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {col.length}
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {col.map((a) => (
                    <motion.div
                      layout
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-xl border border-border glass p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        <span className="flex items-center gap-1 text-xs text-accent font-medium">
                          <Star className="size-3 fill-accent" />
                          {a.score}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.role} · كلية {a.faculty}
                      </p>

                      {openNote === a.id ? (
                        <textarea
                          autoFocus
                          value={notes[a.id] ?? ''}
                          onChange={(e) =>
                            setNotes((n) => ({ ...n, [a.id]: e.target.value }))
                          }
                          onBlur={() => setOpenNote(null)}
                          placeholder="ملاحظات المساعد التقييمية…"
                          className="mt-2 w-full resize-none rounded-lg border border-input bg-background/60 p-2 text-xs outline-none focus:border-primary"
                          rows={2}
                        />
                      ) : notes[a.id] ? (
                        <p className="rounded-lg bg-secondary/60 p-2 text-xs text-foreground/80">
                          {notes[a.id]}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-border/40">
                        <button
                          onClick={() => setOpenNote(a.id)}
                          className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          ملاحظة
                        </button>

                        <div className="flex items-center gap-1">
                          {a.stage !== 'Accepted' ? (
                            <>
                              <button
                                onClick={() => rejectApplicant(a.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/25"
                                title="رفض الطلب"
                              >
                                <X className="size-3" />
                                رفض
                              </button>
                              <button
                                onClick={() => advanceApplicantStage(a.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors"
                                title="ترقية مرحلة الطلب"
                              >
                                المتابعة
                                <ChevronRight className="size-3" />
                              </button>
                              <button
                                onClick={() => acceptApplicantToTeam(a.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-chart-3 px-2.5 py-1 text-[11px] font-bold text-chart-3-foreground hover:scale-105 transition-transform"
                                title="قبول الطالب رسمياً في التيم"
                              >
                                <UserCheck className="size-3" />
                                قبول في التيم
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-chart-3/20 px-2 py-1 text-[11px] font-bold text-chart-3">
                              <Check className="size-3" /> تم الانضمام للفريق
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {col.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    لا يوجد متقدمون في هذه المرحلة
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Interviews() {
  const { interviews, addInterview } = useSystem()
  const [showModal, setShowModal] = useState(false)
  const [applicant, setApplicant] = useState('')
  const [role, setRole] = useState('')
  const [date, setDate] = useState('Mar 18')
  const [time, setTime] = useState('4:00 PM')
  const [interviewer, setInterviewer] = useState('نور السيد (مساعد الليدر)')

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicant || !role) return
    addInterview({ applicant, role, date, time, interviewer })
    setApplicant('')
    setRole('')
    setShowModal(false)
  }

  return (
    <div>
      <SectionTitle
        title="مقابلات المتقدمين"
        subtitle="تحديد وجدولة المقابلات مع المتقدمين المختصرين."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <Plus className="size-4" />
            جدولة مقابلة
          </button>
        }
      />
      <div className="space-y-3">
        {interviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد مقابلات مجدولة حالياً. اضغط على "جدولة مقابلة" لإضافة موعد جديد.
          </p>
        ) : (
          interviews.map((iv) => (
            <Panel
              key={iv.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{iv.applicant}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  وظيفة: {iv.role} · القائم بالمقابلة: {iv.interviewer}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <StatusBadge status="Interview" />
                <span className="text-muted-foreground font-sans">
                  {iv.date} · {iv.time}
                </span>
              </div>
            </Panel>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold">جدولة مقابلة جديدة</h3>
            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">اسم المتقدم</label>
                <input
                  required
                  value={applicant}
                  onChange={(e) => setApplicant(e.target.value)}
                  placeholder="مثال: سارة أحمد"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">الوظيفة المتقدم لها</label>
                <input
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="مثال: UI/UX Designer"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">التاريخ</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">الوقت</label>
                  <input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  حفظ التوقيت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Attendance() {
  const { members } = useSystem()

  return (
    <div>
      <SectionTitle
        title="حضور ومشاركة أعضاء الفريق"
        subtitle="متابعة نسبة مشاركة وتفاعل الأعضاء المقبولين بالفريق."
      />
      <Panel className="p-0">
        <div className="divide-y divide-border/60">
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              لا يوجد أعضاء نشطون في الفريق حالياً.
            </p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold">
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        m.attendance >= 85
                          ? 'bg-chart-3'
                          : m.attendance >= 75
                            ? 'bg-chart-4'
                            : 'bg-destructive'
                      }`}
                      style={{ width: `${m.attendance}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-medium tabular-nums font-sans">
                  {m.attendance}%
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}

function AnnouncementsManager() {
  const { announcements, addAnnouncement } = useSystem()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return
    addAnnouncement({ title, body, author: 'أدمن الفريق', pinned: false })
    setTitle('')
    setBody('')
    setShowModal(false)
  }

  return (
    <div>
      <SectionTitle
        title="الإعلانات والأحداث"
        subtitle="نشر إعلانات وأحداث جديدة لأعضاء الفريق والمنصة."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-chart-4 px-3.5 py-2 text-sm font-semibold text-chart-4-foreground transition-transform hover:scale-[1.03]"
          >
            <Plus className="size-4" />
            نشر إعلان جديد
          </button>
        }
      />
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد إعلانات منشورة من الفريق بعد. اضغط على "نشر إعلان جديد".
          </p>
        ) : (
          announcements.map((a: Announcement) => (
            <Panel key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold">إعلان جديد</h3>
            <form onSubmit={handlePost} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">عنوان الإعلان</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اجتماع طارئ اليوم"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">التفاصيل</label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-chart-4 px-4 py-2 text-sm font-semibold text-chart-4-foreground"
                >
                  نشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function useMyClub() {
  const [club, setClub] = useState<{ name: string; faculty: string } | null>(null)

  useEffect(() => {
    async function loadMyClub() {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: member } = await supabase
        .from('club_members')
        .select('club_id, clubs(name, faculty)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (member?.clubs) {
        const c = member.clubs as any
        setClub({
          name: c.name || 'الفريق',
          faculty: c.faculty || 'الجامعة',
        })
      }
    }
    loadMyClub()
  }, [])

  return club
}

export function AssistantWorkspace() {
  const myClub = useMyClub()

  const tabs: DashboardTab[] = [
    { id: 'pipeline', label: 'Recruitment Pipeline', icon: KanbanSquare, render: () => <Pipeline /> },
    { id: 'interviews', label: 'Interviews', icon: CalendarClock, render: () => <Interviews /> },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, render: () => <Attendance /> },
    { id: 'announcements', label: 'Announcements', icon: Star, render: () => <AnnouncementsManager /> },
  ]

  return (
    <DashboardShell
      tabs={tabs}
      accent="text-chart-4"
      sidebarHeader={
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {myClub?.name || 'إدارة العمليات والتوظيف'}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-chart-4">
            <Check className="size-4" />
            حساب أدمن الفريق (Vice Leader)
          </p>
        </div>
      }
    />
  )
}
