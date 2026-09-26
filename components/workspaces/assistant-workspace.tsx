'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  KanbanSquare,
  ClipboardCheck,
  ChevronRight,
  Plus,
  Check,
  UserCheck,
  X,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Loader2,
  Megaphone,
  FileText,
  ExternalLink,
  ListTodo,
  User,
  Users,
  Search,
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
                      {/* Header: Name */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                            {a.name.substring(0, 2)}
                          </span>
                          <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 rounded-lg bg-secondary/30 p-2 text-[11px]">
                        {/* Faculty */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-muted-foreground">الكلية</span>
                          <span className="font-medium text-foreground">{a.faculty || 'غير محدد'}</span>
                        </div>
                        {/* Role applied for */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-muted-foreground">التخصص</span>
                          <span className="font-medium text-foreground">{a.role || 'عضو'}</span>
                        </div>
                        {/* Email */}
                        {a.email && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-muted-foreground">الإيميل</span>
                            <span className="font-medium text-foreground font-sans truncate">{a.email}</span>
                          </div>
                        )}
                        {/* WhatsApp */}
                        {a.whatsapp && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-muted-foreground">واتساب</span>
                            <span className="font-medium text-foreground font-sans">{a.whatsapp}</span>
                          </div>
                        )}
                        {/* Student ID */}
                        {a.studentId && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-muted-foreground">رقم الطالب</span>
                            <span className="font-medium text-foreground font-sans">{a.studentId}</span>
                          </div>
                        )}
                        {/* Submitted at */}
                        {a.submittedAt && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-muted-foreground">تاريخ التقديم</span>
                            <span className="font-medium text-foreground">{a.submittedAt}</span>
                          </div>
                        )}
                        {/* CV / Portfolio Link */}
                        <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                          <span className="w-16 shrink-0 text-muted-foreground">الـ CV</span>
                          {a.cvLink || a.portfolio ? (
                            <a
                              href={a.cvLink || a.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                            >
                              <FileText className="size-3.5" />
                              عرض ملف الـ CV
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60 italic">لم يتم إرفاق رابط CV</span>
                          )}
                        </div>
                        {/* Motivation / Reason */}
                        {a.motivation && (
                          <div className="flex items-start gap-2 pt-1">
                            <span className="w-16 shrink-0 text-muted-foreground">الدافع</span>
                            <span className="font-medium text-foreground/90 leading-tight">{a.motivation}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {openNote === a.id ? (
                        <textarea
                          autoFocus
                          value={notes[a.id] ?? ''}
                          onChange={(e) =>
                            setNotes((n) => ({ ...n, [a.id]: e.target.value }))
                          }
                          onBlur={() => setOpenNote(null)}
                          placeholder="ملاحظات المساعد التقييمية…"
                          className="w-full resize-none rounded-lg border border-input bg-background/60 p-2 text-xs outline-none focus:border-primary"
                          rows={2}
                        />
                      ) : notes[a.id] ? (
                        <p className="rounded-lg bg-secondary/60 p-2 text-xs text-foreground/80">
                          {notes[a.id]}
                        </p>
                      ) : null}

                      {/* Actions */}
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
  const { announcements, addAnnouncement, deleteAnnouncement, teamEvents } = useSystem()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    setDeletingId(id)
    await deleteAnnouncement(id)
    setDeletingId(null)
  }

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return
    addAnnouncement({ title, body, author: 'أدمن الفريق', pinned: false })
    setTitle('')
    setBody('')
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="الإعلانات والأحداث"
        subtitle="متابعة ونشر أحداث وفعاليات وإعلانات الفريق."
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

      {/* Events Section */}
      {teamEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-chart-4">
            <Calendar className="size-4" />
            <span>الفعاليات والأحداث المسجلة للفريق ({teamEvents.length})</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teamEvents.map((ev) => (
              <Panel key={ev.id} className="border-chart-4/30 bg-chart-4/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{ev.title}</p>
                  <StatusBadge status={ev.type} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-sans">
                    <Calendar className="size-3 text-chart-4" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <Clock className="size-3 text-accent" />
                    {ev.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-primary" />
                    {ev.location}
                  </span>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Announcements Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span>الإعلانات والتوجيهات الداخلية</span>
        </div>
        {announcements.length === 0 && teamEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد إعلانات أو فعاليات منشورة من الفريق بعد.
          </p>
        ) : (
          announcements.map((a: Announcement) => (
            <Panel key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{a.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground font-sans">
                    {a.date}
                  </span>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="rounded-lg p-1.5 text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="حذف الإعلان"
                  >
                    {deletingId === a.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </button>
                </div>
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

function TasksManager() {
  const { myTasks, addTask, deleteTask, toggleTaskStatus, members } = useSystem()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Member selection state
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<{ id?: string; name: string } | null>(null)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(assigneeSearch.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await addTask({
        title: title.trim(),
        due: due.trim() || new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        priority,
        status: 'To Do',
        assigneeName: selectedAssignee ? selectedAssignee.name : 'جميع أعضاء الفريق',
        assigneeId: selectedAssignee?.id,
      })
      setTitle('')
      setDue('')
      setPriority('Medium')
      setSelectedAssignee(null)
      setAssigneeSearch('')
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟ ستُحذف أيضاً من لوحة تحكم أعضاء الفريق.')) return
    setDeletingId(id)
    try {
      await deleteTask(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="إسناد وإدارة مهام الفريق"
        subtitle="إنشاء وإرسال المهام لأعضاء محددين أو لجميع أعضاء الفريق ومتابعة حالة تنفيذها."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-chart-4 px-3.5 py-2 text-sm font-semibold text-chart-4-foreground transition-transform hover:scale-[1.03]"
          >
            <Plus className="size-4" />
            إسناد مهمة جديدة
          </button>
        }
      />

      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <Panel className="py-12 text-center">
            <ListTodo className="mx-auto size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">لا توجد مهام مسندة حالياً</p>
            <p className="mt-1 text-xs text-muted-foreground">
              اضغط على "إسناد مهمة جديدة" لإنشاء وإرسال أول مهمة لأعضاء التيم.
            </p>
          </Panel>
        ) : (
          myTasks.map((t) => (
            <Panel
              key={t.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    t.status === 'Done'
                      ? 'border-chart-3 bg-chart-3 text-chart-3-foreground'
                      : 'border-input hover:border-primary'
                  }`}
                  title="تغيير حالة المهمة"
                >
                  {t.status === 'Done' && <Check className="size-3.5" />}
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`font-medium text-sm ${
                        t.status === 'Done'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.assigneeName && t.assigneeName !== 'جميع أعضاء الفريق' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-chart-4/15 text-chart-4 px-2 py-0.5 text-[11px] font-semibold">
                        <User className="size-3" />
                        المكلف: {t.assigneeName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-muted-foreground px-2 py-0.5 text-[11px] font-medium">
                        <Users className="size-3" />
                        الجميع
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1 font-sans">
                    <Calendar className="size-3 text-muted-foreground" />
                    تاريخ التسليم: {t.due}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="rounded-lg p-1.5 text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  title="حذف المهمة"
                >
                  {deletingId === t.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </Panel>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold">إسناد مهمة جديدة للتيم</h3>
            <p className="text-xs text-muted-foreground">
              المهمة ستظهر مباشرة في لوحة تحكم أعضاء الفريق لمتابعة تنفيذها.
            </p>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">عنوان المهمة</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تصميم بوست إعلان الورشة القادمة"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                />
              </div>

              {/* Member Search / Selector */}
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>المكلف بالمهمة</span>
                  {selectedAssignee && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssignee(null)
                        setAssigneeSearch('')
                      }}
                      className="text-[11px] text-chart-4 hover:underline"
                    >
                      تغيير للجميع
                    </button>
                  )}
                </label>

                {selectedAssignee ? (
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-chart-4/40 bg-chart-4/10 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-chart-4">
                      <User className="size-4" />
                      {selectedAssignee.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAssignee(null)}
                      className="rounded-full p-1 hover:bg-chart-4/20 text-chart-4"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 space-y-1">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        value={assigneeSearch}
                        onChange={(e) => {
                          setAssigneeSearch(e.target.value)
                          setShowAssigneeDropdown(true)
                        }}
                        onFocus={() => setShowAssigneeDropdown(true)}
                        placeholder="ابحث عن عضو بالاسم أو الكلية (أو اتركها للجميع)..."
                        className="w-full rounded-xl border border-input bg-secondary/30 pr-9 pl-3 py-2 text-sm outline-none focus:border-chart-4"
                      />
                    </div>

                    {showAssigneeDropdown && (
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAssignee(null)
                            setAssigneeSearch('')
                            setShowAssigneeDropdown(false)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground/90 hover:bg-secondary text-right"
                        >
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="font-semibold">📌 جميع أعضاء الفريق (الافتراضي)</span>
                        </button>
                        {filteredMembers.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedAssignee({ id: m.id, name: m.name })
                              setShowAssigneeDropdown(false)
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary text-right"
                          >
                            <span className="flex items-center gap-2">
                              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                {m.initials}
                              </span>
                              <span className="font-medium">{m.name}</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">{m.department} · {m.role}</span>
                          </button>
                        ))}
                        {filteredMembers.length === 0 && (
                          <p className="p-2 text-center text-xs text-muted-foreground">لا يوجد عضو بهذا الاسم</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  >
                    <option value="High">عالية (High)</option>
                    <option value="Medium">متوسطة (Medium)</option>
                    <option value="Low">منخفضة (Low)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">تاريخ التسليم</label>
                  <input
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    placeholder="مثال: 15 أكتوبر"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-chart-4 px-4 py-2 text-sm font-semibold text-chart-4-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  إرسال المهمة
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
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, render: () => <Attendance /> },
    { id: 'tasks', label: 'Team Tasks', icon: ListTodo, render: () => <TasksManager /> },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, render: () => <AnnouncementsManager /> },
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
