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
  const { announcements } = useSystem()

  return (
    <div>
      <SectionTitle
        title="الإعلانات الداخلية بالفريق"
        subtitle="آخر التحديثات والتوجيهات من قائد الفريق والمساعدين."
      />
      <div className="space-y-3">
        {announcements.map((a) => (
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
        ))}
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
        subtitle="المواعيد ورش العمل والمقابلات القادمة بالفريق."
      />
      <div className="space-y-3">
        {teamEvents.map((e) => (
          <Panel key={e.id} className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-secondary/50">
              <span className="text-xs font-medium text-muted-foreground font-sans">
                {e.day}
              </span>
              <span className="font-display text-sm font-bold font-sans">
                {e.date.split(' ')[1]}
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
        ))}
      </div>
    </div>
  )
}

function Tasks() {
  const { myTasks, toggleTaskStatus } = useSystem()

  return (
    <div>
      <SectionTitle
        title="المهام المسندة لي"
        subtitle="متابعة وتنفيذ مهامك داخل الفريق."
      />
      <div className="space-y-3">
        {myTasks.map((t) => (
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
              >
                {t.status === 'Done' && <CheckCircle2 className="size-4" />}
              </button>
              <div>
                <p
                  className={`font-medium text-sm ${
                    t.status === 'Done'
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {t.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground font-sans">
                  تاريخ التسليم: {t.due}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={t.priority} />
              <StatusBadge status={t.status} />
            </div>
          </Panel>
        ))}
      </div>
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

