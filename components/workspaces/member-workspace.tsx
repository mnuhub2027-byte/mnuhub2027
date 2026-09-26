'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  ListTodo,
  Users,
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
} from 'lucide-react'
import { useSystem } from '@/lib/system-context'
import { useRole } from '@/components/role-context'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/status-badge'
import {
  DashboardShell,
  Panel,
  SectionTitle,
  type DashboardTab,
} from '@/components/dashboard-shell'

type MemberProfile = {
  name: string
  initials: string
  clubName: string
  joinedAt: string
  role: string
}

function useMemberProfile(): MemberProfile | null {
  const [profile, setProfile] = useState<MemberProfile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      // Get profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Get club membership
      const { data: mem } = await supabase
        .from('club_members')
        .select('role, created_at, clubs(name)')
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

      setProfile({ name: fullName, initials, clubName, joinedAt, role: mem?.role || 'member' })
    })
  }, [])

  return profile
}

function Announcements() {
  const { announcements, teamEvents } = useSystem()

  return (
    <div className="space-y-6">
      <SectionTitle
        title="الإعلانات والأنشطة بالفريق"
        subtitle="آخر التحديثات، الفعاليات، والتوجيهات الصادرة من قائد الفريق والمساعدين."
      />

      {/* Team Events Banner */}
      {teamEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarIcon className="size-4" />
            <span>الفعاليات والأحداث القادمة للتيم ({teamEvents.length})</span>
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
          <span>الإعلانات والتوجيهات</span>
        </div>
        {announcements.length === 0 && teamEvents.length === 0 ? (
          <Panel className="py-8 text-center text-sm text-muted-foreground">
            لا توجد إعلانات أو فعاليات منشورة بالفريق حالياً.
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

  return (
    <div>
      <SectionTitle
        title="جدول الأنشطة واللقاءات"
        subtitle="مواعيد ورش العمل، المسابقات، واللقاءات القادمة بالفريق."
      />
      <div className="space-y-3">
        {teamEvents.length === 0 ? (
          <Panel className="py-8 text-center text-sm text-muted-foreground">
            لا توجد فعاليات مسجلة للفريق حالياً.
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
  const { myTasks, toggleTaskStatus } = useSystem()
  const [showCompleted, setShowCompleted] = useState(false)

  const pendingTasks = myTasks.filter((t) => t.status !== 'Done')
  const completedTasks = myTasks.filter((t) => t.status === 'Done')

  return (
    <div className="space-y-6">
      <SectionTitle
        title="المهام المسندة لي"
        subtitle="متابعة وتنفيذ مهامك داخل الفريق وتسليمها مباشرة."
      />

      {/* Active / Pending Tasks */}
      <div className="space-y-3">
        {pendingTasks.length === 0 ? (
          <Panel className="py-12 text-center">
            <CheckCircle2 className="mx-auto size-12 text-chart-3/80 mb-3" />
            <p className="text-base font-bold text-foreground">رائع! لا توجد مهام معلقة لديك حالياً 🎉</p>
            <p className="mt-1 text-xs text-muted-foreground">
              لقد قمت بإنجاز كافة مهامك المسندة، أو لم يتم إسناد مهام جديدة بعد.
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
                            المكلف: {t.assigneeName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-muted-foreground px-2 py-0.5 text-[11px] font-medium">
                            <Users className="size-3" />
                            الجميع
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground font-sans">
                          تاريخ التسليم: {t.due}
                        </span>
                        {t.submissionType === 'whatsapp' && t.submissionValue && (
                          <a
                            href={`https://wa.me/${t.submissionValue.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            title="إرسال الحل عبر واتساب"
                          >
                            <MessageCircle className="size-3.5" />
                            <span>تسليم واتساب ({t.submissionValue})</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                        {t.submissionType === 'link' && t.submissionValue && (
                          <a
                            href={t.submissionValue.startsWith('http') ? t.submissionValue : `https://${t.submissionValue}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
                            title="فتح رابط التسليم"
                          >
                            <FileText className="size-3.5" />
                            <span>رابط التسليم (Drive / فورم)</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    <StatusBadge status={t.priority} />
                    <StatusBadge status={t.status} />

                    {/* Prominent Done Button */}
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-chart-3 px-3 py-1.5 text-xs font-bold text-chart-3-foreground shadow-sm transition-all duration-200 hover:scale-[1.04] hover:bg-chart-3/90"
                      title="تم التسليم - إنهاء المهمة"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Done (تم التسليم)
                    </button>
                  </div>
                </Panel>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-border/40">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            <span>المهام المكتملة المسلمة ({completedTasks.length})</span>
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
                      <span className="text-[11px] text-muted-foreground font-sans">تاريخ التسليم: {t.due}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-chart-3/15 px-2 py-0.5 text-[10px] font-bold text-chart-3">مكتملة ✓</span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      title="إعادة المهمة للمهام الحالية"
                    >
                      <RotateCcw className="size-3" />
                      إعادة فتح
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

  return (
    <div>
      <SectionTitle
        title="دليل أفراد الفريق"
        subtitle={`${members.length} عضواً مسجلاً بالفريق حتى الآن.`}
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
  const { requestPromotion, promotionRequests } = useSystem()
  const memberProfile = useMemberProfile()
  const [showModal, setShowModal] = useState(false)
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

  const roleLabel =
    memberProfile?.role === 'leader' ? 'قائد الفريق' :
    memberProfile?.role === 'assistant' ? 'مساعد الأدمن' :
    'عضو بالفريق'

  const rows = memberProfile ? [
    { label: 'الفريق الحالي', value: memberProfile.clubName },
    { label: 'الصفة بالفريق', value: roleLabel },
    { label: 'عضو منذ', value: memberProfile.joinedAt },
  ] : []

  return (
    <div className="space-y-6">
      <SectionTitle title="الملف الشخصي وصلاحيات العضو" subtitle="إدارة بياناتك وطلب الترقي لمساعد الأدمن." />
      
      {/* Promotion Request Banner */}
      <Panel className="border-chart-4/40 bg-gradient-to-r from-chart-4/10 via-background to-chart-4/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-chart-4 font-bold text-sm">
              <ShieldCheck className="size-5" />
              مسار الترقية إلى مساعد ليدر (Vice Leader)
            </div>
            <p className="text-xs text-muted-foreground max-w-lg">
              يمكن للعضو في التيم تقديم طلب ترقية لمساعد الأدمن لإدارة التوظيف والعمليات التشغيلية. يتلقى أدمن الفريق الطلب للموافقة عليه.
            </p>
          </div>

          {activeReq ? (
            <div className="rounded-xl border border-chart-4/30 bg-chart-4/15 px-4 py-2 text-xs font-bold text-chart-4">
              {activeReq.status === 'Pending' ? '⏳ طلب الترقية لمساعد قيد مراجعة الأدمن' : activeReq.status === 'Approved' ? '🎉 تمت ترقيتك لمساعد بنجاح!' : 'مرفوض'}
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-chart-4 px-4 py-2.5 text-xs font-bold text-chart-4-foreground hover:scale-105 transition-transform shrink-0 shadow-lg"
            >
              <Sparkles className="size-4" />
              تقديم طلب ترقية لمساعد
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
      </Panel>

      {/* Modal request promotion */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2 text-chart-4">
                  <ShieldCheck className="size-5" />
                  طلب ترقية إلى مساعد الليدر
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleApplyPromotion} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">القسم التخصصي المُراد إدارته</label>
                  <input
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="مثال: Machine Learning / Recruitment"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-chart-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">رقم التليفون (واتساب)</label>
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
                  <label className="text-xs font-medium text-muted-foreground">رابط الـ CV / Portfolio</label>
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
                  <label className="text-xs font-medium text-muted-foreground">سبب وسابقة أعمالك المؤهلة للترقية</label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="اكتب بالتفصيل إنجازاتك بالفريق ولماذا ترغب في أن تصبح مساعداً لإدارة عمليات التوظيف..."
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
                    className="rounded-xl bg-chart-4 px-4 py-2 text-sm font-bold text-chart-4-foreground hover:scale-105 transition-transform"
                  >
                    إرسال الطلب للليدر
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

  const tabs: DashboardTab[] = [
    { id: 'announcements', label: 'Announcements', icon: Bell, render: () => <Announcements /> },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, render: () => <Calendar /> },
    { id: 'tasks', label: 'My Tasks', icon: ListTodo, render: () => <Tasks /> },
    { id: 'profile', label: 'Profile & Promotion', icon: UserCircle, render: () => <Profile /> },
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
              حساب عضو في الفريق
            </p>
          </div>
        </div>
      }
    />
  )
}

