'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  GaugeCircle,
  UsersRound,
  Settings2,
  Users2,
  TrendingUp,
  Percent,
  Download,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Crown,
  ShieldCheck,
  Award,
  CalendarPlus,
  Megaphone,
  BookOpen,
  Trophy,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  analytics,
  type TeamRole,
} from '@/lib/data'
import { useSystem } from '@/lib/system-context'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/status-badge'
import {
  DashboardShell,
  Panel,
  SectionTitle,
  StatCard,
  type DashboardTab,
} from '@/components/dashboard-shell'

function Analytics() {
  const { members, applicants, teamEvents } = useSystem()
  
  const totalApplied = applicants.length + members.length
  const activeMembersCount = members.length
  const acceptanceRate = totalApplied > 0 ? Math.round((activeMembersCount / totalApplied) * 100) : 0
  const avgAttendance = members.length > 0 
    ? Math.round(members.reduce((acc, m) => acc + (m.attendance || 100), 0) / members.length)
    : 0

  const stats = [
    { label: 'إجمالي المتقدمين', value: totalApplied, icon: Users2, accent: 'text-primary' },
    { label: 'نسبة القبول بالفريق', value: `${acceptanceRate}%`, icon: Percent, accent: 'text-chart-3' },
    { label: 'الأعضاء النشطون بالفريق', value: activeMembersCount, icon: TrendingUp, accent: 'text-accent' },
    { label: 'الأحداث والأنشطة', value: teamEvents.length, icon: GaugeCircle, accent: 'text-chart-4' },
  ]

  return (
    <div className="space-y-6">
      <SectionTitle
        title="تحليلات وأداء الفريق"
        subtitle="متابعة الأداء والإحصائيات الخاصة بتيمك بناءً على البيانات الحقيقية."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary">
            <Download className="size-4" />
            تصدير التقرير
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Panel>
        <p className="font-medium">نظرة عامة على نشاط الفريق</p>
        <p className="text-sm text-muted-foreground">ملخص الإحصائيات المسجلة حالياً للتيم في الداتا بيز</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-2xl font-bold text-primary">{applicants.length}</p>
            <p className="text-xs text-muted-foreground mt-1">طلبات المتقدمين المعلقة</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-2xl font-bold text-accent">{members.length}</p>
            <p className="text-xs text-muted-foreground mt-1">الأعضاء الحاليين بالفريق</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-2xl font-bold text-chart-4">{teamEvents.length}</p>
            <p className="text-xs text-muted-foreground mt-1">الفعاليات المنشورة</p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Approvals() {
  const { promotionRequests, approvePromotion, rejectPromotion, promoteAssistantByEmail } = useSystem()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePromoteByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await promoteAssistantByEmail(email)
      setEmail('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="ترقية الأعضاء والموافقات"
        subtitle="تعيين أدمن/مساعد للفريق بالبريد، أو المراجعة والموافقة على طلبات ترقية الأعضاء."
      />

      {/* Direct Email Promotion Panel */}
      <Panel className="border-primary/30 bg-primary/5">
        <h4 className="font-display text-base font-semibold flex items-center gap-2">
          <Crown className="size-5 text-primary" />
          إضافة أدمن / مساعد للفريق بالبريد الإلكتروني
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          أدخل البريد الإلكتروني الخاص بالطالب المسجل في المنصة لترقيته فوراً إلى أدمن/مساعد بالفريق (Vice Leader).
        </p>

        <form onSubmit={handlePromoteByEmail} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="مثال: student@uni.edu"
            className="flex-1 rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <ShieldCheck className="size-4" />
            {loading ? 'جاري الترقية...' : 'ترقية إلى أدمن'}
          </button>
        </form>
      </Panel>

      <div className="space-y-4">
        <h4 className="font-display text-base font-semibold flex items-center gap-2">
          <ShieldCheck className="size-5 text-chart-4" />
          طلبات الترقية إلى مساعد (Vice Leader)
        </h4>

        <div className="space-y-3">
          <AnimatePresence>
            {promotionRequests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-chart-4/30 bg-chart-4/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-chart-4/20 font-bold text-chart-4 text-xs">
                        {req.memberInitials}
                      </span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{req.memberName}</p>
                        <p className="text-xs text-muted-foreground">قسم: {req.department} · قدم بتاريخ {req.submittedAt}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved'
                          ? 'bg-chart-3/20 text-chart-3'
                          : req.status === 'Rejected'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-chart-4/20 text-chart-4'
                      }`}>
                        {req.status === 'Pending' ? 'طلب ترقية معلق' : req.status === 'Approved' ? 'تمت الترقي لمساعد' : 'مرفوض'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-foreground/80 rounded-lg bg-background/60 p-2.5 border border-border/50">
                      💬 <span className="font-semibold">سبب طلب الترقية:</span> {req.reason}
                    </p>
                  </div>

                  {req.status === 'Pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approvePromotion(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-chart-3 px-3.5 py-2 text-xs font-bold text-chart-3-foreground transition-transform hover:scale-105 shadow-md"
                      >
                        <Check className="size-4" />
                        الموافقة والترقية لمساعد
                      </button>
                      <button
                        onClick={() => rejectPromotion(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                      >
                        <X className="size-4" />
                        رفض
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-chart-3 flex items-center gap-1">
                      <Award className="size-4" /> {req.status === 'Approved' ? 'تمت الترقية لمساعد' : 'تم الرفض'}
                    </div>
                  )}
                </Panel>
              </motion.div>
            ))}
          </AnimatePresence>

          {promotionRequests.length === 0 && (
            <Panel className="text-center py-8">
              <p className="text-sm text-muted-foreground">لا توجد طلبات ترقية معلقة حالياً.</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

const roleRank: Record<TeamRole, number> = {
  Member: 0,
  'Vice Leader': 1,
  Leader: 2,
}

function MemberManagement() {
  const { members, updateMemberRole } = useSystem()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (memberId: string, newRole: 'Vice Leader' | 'Member') => {
    setLoadingId(memberId)
    try {
      await updateMemberRole(memberId, newRole)
    } finally {
      setLoadingId(null)
    }
  }

  const roleIcon = (role: string) => {
    if (role === 'Leader') return <Crown className="size-4 text-yellow-500" />
    if (role === 'Vice Leader') return <ShieldCheck className="size-4 text-chart-3" />
    return <Award className="size-4 text-muted-foreground" />
  }

  const roleColor = (role: string) => {
    if (role === 'Leader') return 'border-yellow-500/30 bg-yellow-500/5'
    if (role === 'Vice Leader') return 'border-chart-3/30 bg-chart-3/5'
    return 'border-border bg-secondary/20'
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="إدارة هيكل الفريق والأعضاء"
        subtitle={`عدد الأعضاء الحالي: ${members.length} عضو — يمكنك ترقية أو تخفيض رتب الأعضاء مباشرة.`}
      />

      {members.length === 0 ? (
        <Panel>
          <p className="py-10 text-center text-sm text-muted-foreground">لا يوجد أعضاء مسجلون في الفريق حتى الآن.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => (
            <Panel key={m.id} className={`flex flex-col gap-4 border ${roleColor(m.role)}`}>
              {/* Header: Avatar + Name + Role badge */}
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-display text-base font-bold text-primary">
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {roleIcon(m.role)}
                    <p className="font-semibold text-foreground leading-tight">{m.name}</p>
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={m.role} />
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* Faculty / Department */}
                <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
                  <span className="text-muted-foreground w-20 shrink-0">الكلية</span>
                  <span className="font-medium text-foreground truncate">{m.department || 'غير محدد'}</span>
                </div>

                {/* Email */}
                {m.email && (
                  <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
                    <span className="text-muted-foreground w-20 shrink-0">الإيميل</span>
                    <span className="font-medium text-foreground truncate font-sans">{m.email}</span>
                  </div>
                )}

                {/* WhatsApp / Student ID */}
                {m.phone && (
                  <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
                    <span className="text-muted-foreground w-20 shrink-0">واتساب / ID</span>
                    <span className="font-medium text-foreground font-sans">{m.phone}</span>
                  </div>
                )}

                {/* Joined date */}
                <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
                  <span className="text-muted-foreground w-20 shrink-0">تاريخ الانضمام</span>
                  <span className="font-medium text-foreground">{m.joined}</span>
                </div>
              </div>

              {/* Actions */}
              {m.role !== 'Leader' && (
                <div className="flex gap-2 border-t border-border/40 pt-3">
                  {roleRank[m.role] < 1 && (
                    <button
                      onClick={() => handleRoleChange(m.id, 'Vice Leader')}
                      disabled={loadingId === m.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-chart-3 transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {loadingId === m.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ArrowUp className="size-3.5" />
                      )}
                      ترقية لأدمن
                    </button>
                  )}
                  {roleRank[m.role] >= 1 && (
                    <button
                      onClick={() => handleRoleChange(m.id, 'Member')}
                      disabled={loadingId === m.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-destructive/70 transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {loadingId === m.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )}
                      تخفيض لعضو
                    </button>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}

function useMyClub() {
  const [club, setClub] = useState<{ name: string; faculty: string; tagline: string } | null>(null)

  useEffect(() => {
    async function loadMyClub() {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: member } = await supabase
        .from('club_members')
        .select('club_id, clubs(name, faculty, tagline)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (member?.clubs) {
        const c = member.clubs as any
        setClub({
          name: c.name || 'الفريق',
          faculty: c.faculty || 'الجامعة',
          tagline: c.tagline || '',
        })
      }
    }
    loadMyClub()
  }, [])

  return club
}

function TeamSettings() {
  const toggles = [
    { label: 'فتح باب التقديم والقبول', desc: 'استقبال طلبات الطلاب الجدد عبر المساعدين', on: true },
    { label: 'إلزام رابط السيرة الذاتية', desc: 'اشتراط وجود CV عند التقديم', on: true },
    { label: 'تمكين المساعدين من القبول الفوري', desc: 'طلب ترقية لـ "أدمن"', on: true },
  ]
  return (
    <div className="space-y-6">
      <SectionTitle title="إعدادات الفريق وقواعد التوظيف" subtitle="التحكم في إعدادات وقواعد عمل الفريق." />
      <Panel className="p-0">
        <div className="divide-y divide-border/60">
          {toggles.map((t) => (
            <SettingToggle key={t.label} {...t} />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function SettingToggle({
  label,
  desc,
  on,
}: {
  label: string
  desc: string
  on: boolean
}) {
  const [enabled, setEnabled] = useState(on)
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 size-5 rounded-full bg-background ${
            enabled ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

const EVENT_TYPES = [
  { value: 'workshop', label: 'ورشة عمل', icon: Megaphone },
  { value: 'competition', label: 'مسابقة', icon: Trophy },
  { value: 'course', label: 'كورس مجاني', icon: BookOpen },
  { value: 'event', label: 'حدث عام', icon: CalendarPlus },
]

function EventsManager() {
  const { teamEvents, deleteTeamEvent } = useSystem()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('workshop')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, eventTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف حدث "${eventTitle}"؟\nسيتم حذفه من الموقع بالكامل فوراً.`)) return
    setDeletingId(id)
    try {
      await deleteTeamEvent(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time) return
    setSaving(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      let clubId: string | null = null

      if (user) {
        const { data: membership } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()

        if (membership?.club_id) {
          clubId = membership.club_id
        } else {
          const { data: adminRecord } = await supabase
            .from('platform_admins')
            .select('assigned_team_id')
            .eq('email', user.email)
            .limit(1)
            .maybeSingle()

          if (adminRecord?.assigned_team_id) {
            clubId = adminRecord.assigned_team_id
          }
        }
      }

      if (!clubId) {
        toast.error('لم يتم العثور على التيم الخاص بك.')
        return
      }

      const { error: insertErr } = await supabase.from('team_events').insert({
        club_id: clubId,
        title,
        type,
        date,
        time,
        location: location || 'يحدد لاحقاً',
      })

      if (insertErr) {
        toast.error('حدث خطأ أثناء حفظ الحدث: ' + insertErr.message)
        return
      }

      toast.success('تم نشر الحدث بنجاح ويظهر الآن في المنصة والأخبار! 🎯')
      setTitle(''); setType('workshop'); setDate(''); setTime(''); setLocation('')
      setShowModal(false)
      window.location.reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionTitle
        title="الأحداث والبرامج"
        subtitle="أنشر أحداث التيم، المسابقات، والكورسات المجانية للطلاب."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <CalendarPlus className="size-4" />
            إضافة حدث جديد
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {teamEvents.length === 0 && (
          <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
            لا توجد أحداث منشورة حالياً. أضف أول حدث للتيم!
          </p>
        )}
        {teamEvents.map((ev: any) => {
          const typeInfo = EVENT_TYPES.find(t => t.value === ev.type) ?? EVENT_TYPES[0]
          const Icon = typeInfo.icon
          return (
            <Panel key={ev.id} className="relative group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{typeInfo.label}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(ev.id, ev.title)}
                  disabled={deletingId === ev.id}
                  title="حذف هذا الحدث من الموقع بالكامل"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive transition-all hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deletingId === ev.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>📅 {ev.date}</span>
                <span>🕐 {ev.time}</span>
                <span className="col-span-2">📍 {ev.location}</span>
              </div>
            </Panel>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold">إضافة حدث جديد</h3>
            <form onSubmit={handlePost} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">نوع الحدث</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        type === t.value
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <t.icon className="size-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">عنوان الحدث</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: ورشة Python للمبتدئين"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">التاريخ</label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">الوقت</label>
                  <input
                    required
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">المكان (اختياري)</label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="مثال: قاعة D101 / أونلاين"
                  className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
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
                  disabled={saving}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saving ? '...' : 'نشر الحدث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function LeaderWorkspace() {
  const myClub = useMyClub()

  const tabs: DashboardTab[] = [
    { id: 'approvals', label: 'Promotion Approvals', icon: GaugeCircle, render: () => <Approvals /> },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, render: () => <Analytics /> },
    { id: 'members', label: 'Member Management', icon: UsersRound, render: () => <MemberManagement /> },
    { id: 'events', label: 'Events & Programs', icon: CalendarPlus, render: () => <EventsManager /> },
    { id: 'settings', label: 'Team Settings', icon: Settings2, render: () => <TeamSettings /> },
  ]

  return (
    <DashboardShell
      tabs={tabs}
      accent="text-primary"
      sidebarHeader={
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {myClub?.name || 'الفريق'}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Crown className="size-4" />
            حساب أدمن الفريق (Leader)
          </p>
        </div>
      }
    />
  )
}
