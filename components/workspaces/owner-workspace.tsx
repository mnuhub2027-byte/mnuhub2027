'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  Plus,
  ShieldCheck,
  Users,
  LayoutGrid,
  Trash2,
  Mail,
  UserPlus,
  Sparkles,
  CheckCircle2,
  X,
  Megaphone,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSystem } from '@/lib/system-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { faculties, categories, type Category } from '@/lib/data'
import {
  DashboardShell,
  Panel,
  SectionTitle,
  StatCard,
  type DashboardTab,
} from '@/components/dashboard-shell'

function Overview() {
  const { clubs, admins, studentApplications, members, sendNotification } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const [activeMembersCount, setActiveMembersCount] = useState<number | null>(null)
  const [totalApplicationsCount, setTotalApplicationsCount] = useState<number | null>(null)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setActiveMembersCount(count) })

    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => { if (count !== null) setTotalApplicationsCount(count) })
  }, [])

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle || !broadcastBody) return
    sendNotification(broadcastTitle, broadcastBody, 'system')
    toast.success(isAr ? 'تم بث التنبيه العام لكافة طلاب كليات جامعة المنصورة الأهلية بنجاح!' : 'Global campus announcement broadcast successfully!')
    setBroadcastTitle('')
    setBroadcastBody('')
    setShowBroadcast(false)
  }

  const stats = [
    { label: isAr ? 'إجمالي الفرق والأنشطة' : 'Total Teams & Clubs', value: clubs.length, icon: Building2, accent: 'text-gold' },
    { label: isAr ? 'حسابات الأدمن المعتمدة' : 'Approved Leaders', value: admins.length, icon: ShieldCheck, accent: 'text-primary' },
    { label: isAr ? 'أعضاء الكلية النشطون' : 'Active Students', value: activeMembersCount ?? members.length, icon: Users, accent: 'text-chart-3' },
    { label: isAr ? 'طلبات الانضمام الكلية' : 'Total Applications', value: totalApplicationsCount ?? studentApplications.length, icon: LayoutGrid, accent: 'text-chart-4' },
  ]

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'لوحة تحكم الكلية والمنصة' : 'University & Platform Master Dashboard'}
        subtitle={isAr ? 'إدارة المنظومة بالكامل، إضافة الفرق، وتعيين الليدرز لكل نشاط.' : 'Manage the entire ecosystem, add teams, and assign team leaders.'}
        action={
          <button
            onClick={() => setShowBroadcast(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-gold/90 transition-colors"
          >
            <Megaphone className="size-4" />
            {isAr ? 'بث إعلان عام لطلاب الجامعة' : 'Campus Broadcast'}
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-start rtl:text-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Megaphone className="size-5 text-gold animate-pulse" />
                  {isAr ? 'بث تنبيه عاجل لطلاب الجامعة' : 'Send Global Campus Push'}
                </h3>
                <button onClick={() => setShowBroadcast(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'عنوان التنبيه العام' : 'Notification Title'}</label>
                  <input
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: فتح باب التقديم للأنشطة الطلابية لعام 2026 🎉' : 'Campus Announcement Title'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'مضمون الرسالة والتوجيه' : 'Message Body'}</label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder={isAr ? 'تفاصيل التنبيه الموجه لكافة طلاب جامعة المنصورة الأهلية...' : 'Announcement details...'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcast(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-gold/90 transition-colors"
                  >
                    {isAr ? 'إرسال التنبيه الآن 🎉' : 'Broadcast Now'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-semibold">{isAr ? 'حالة الفرق والأنشطة بالكلية' : 'Faculty Teams Status'}</h4>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
              {isAr ? 'نشطة 100%' : '100% Active'}
            </span>
          </div>
          <div className="space-y-3">
            {clubs.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.faculty}</p>
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-primary">
                  {c.category}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-semibold">{isAr ? 'حسابات ليدرز الفرق الرسمية' : 'Official Team Leaders'}</h4>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {isAr ? 'مفعلة' : 'Active'}
            </span>
          </div>
          <div className="space-y-3">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {a.name.slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.assignedTeamName}</p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{a.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function AdminsManagement() {
  const { admins, addAdmin, removeAdmin, clubs } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const currentFaculties = faculties[language] || faculties.ar

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [faculty, setFaculty] = useState(currentFaculties[0])
  const [selectedClub, setSelectedClub] = useState(clubs[0]?.name || 'Robotics & AI Society')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    const club = clubs.find((c) => c.name === selectedClub)
    addAdmin({
      name,
      email,
      faculty,
      assignedTeamId: club?.id || 'team',
      assignedTeamName: selectedClub,
    })
    setName('')
    setEmail('')
    setShowModal(false)
  }

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'إدارة حسابات قادة الفرق (Leaders)' : 'Team Leaders Management'}
        subtitle={isAr ? 'إنشاء حسابات الليدرز وتوزيع الإشراف على الفرق والأنشطة.' : 'Create leader accounts and assign supervision to teams.'}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
          >
            <UserPlus className="size-4" />
            {isAr ? 'إنشاء حساب ليدر جديد' : 'Create New Leader Account'}
          </button>
        }
      />

      <Panel className="p-0">
        <div className="divide-y divide-border/60">
          {admins.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold">
                  {a.name.slice(0, 2)}
                </span>
                <div>
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Mail className="size-3" />
                    {a.email} · {isAr ? `كلية ${a.faculty}` : a.faculty}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end rtl:text-left">
                  <p className="text-xs font-semibold text-primary">{a.assignedTeamName}</p>
                  <p className="text-[11px] text-muted-foreground">{isAr ? `تاريخ الإنشاء: ${a.createdAt}` : `Created: ${a.createdAt}`}</p>
                </div>
                <button
                  onClick={() => removeAdmin(a.id)}
                  className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/15 transition-colors"
                  title={isAr ? 'حذف حساب الليدر' : 'Remove Leader'}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Modal create admin */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-start rtl:text-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <UserPlus className="size-5 text-gold" />
                  {isAr ? 'إنشاء حساب ليدر جديد' : 'Create Leader Account'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'اسم الليدر (أو المشرف)' : 'Leader Name'}</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: د. أحمد المحمدي' : 'e.g. Dr. Ahmed'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'البريد الإلكتروني الجامعي' : 'University Email'}</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mnuh.edu.eg"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'الكلية' : 'Faculty'}</label>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
                  >
                    {currentFaculties.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'الفريق المخصص للإشراف عليه' : 'Assigned Team'}</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:scale-105 transition-transform"
                  >
                    {isAr ? 'إنشاء وتعيين' : 'Create & Assign'}
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

function ClubsManagement() {
  const { clubs, addClub, deleteClub, suspendClub } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const currentFaculties = faculties[language] || faculties.ar

  const [showModal, setShowModal] = useState(false)
  const [clubName, setClubName] = useState('')
  const [category, setCategory] = useState<Category>('Tech')
  const [faculty, setFaculty] = useState(currentFaculties[0])
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [openRoles, setOpenRoles] = useState('Front-end Developer, UI/UX Designer')
  const [suspendingId, setSuspendingId] = useState<string | null>(null)

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clubName || !description) return

    addClub({
      name: clubName,
      category,
      faculty,
      tagline: tagline || (isAr ? 'فريق جديد معتمد من الجامعة.' : 'Official new university team.'),
      description,
      image: '/clubs/robotics.png',
      achievements: [isAr ? 'فريق حديث تم إطلاقه بالكلية' : 'Newly launched university team'],
      events: [{ title: isAr ? 'اللقاء التعريفي الأول' : 'Orientation Session', date: 'Soon', location: 'Main Building' }],
      openRoles: openRoles.split(',').map((r) => r.trim()).filter(Boolean),
    })

    setClubName('')
    setTagline('')
    setDescription('')
    setShowModal(false)
  }

  const handleSuspend = async (clubId: string) => {
    setSuspendingId(clubId)
    await suspendClub(clubId)
    setSuspendingId(null)
  }

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <SectionTitle
        title={isAr ? 'إضافة وإدارة الفرق والأنشطة' : 'Clubs & Teams Management'}
        subtitle={isAr ? 'إنشاء فرق جديدة وتفعيل الأنشطة بالجامعة فوراً.' : 'Create new teams and activate campus student activities.'}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
          >
            <Plus className="size-4" />
            {isAr ? 'إضافة تيم جديد' : 'Add New Team'}
          </button>
        }
      />

      {/* Suspended Teams Warning */}
      {clubs.some((c) => c.status === 'suspended') && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="size-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 font-medium">
            {isAr
              ? `${clubs.filter((c) => c.status === 'suspended').length} فريق/فرق موقوفة مؤقتاً — لن تظهر للطلاب في دليل الأندية.`
              : `${clubs.filter((c) => c.status === 'suspended').length} team(s) are suspended — hidden from student club directory.`}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c) => {
          const isSuspended = c.status === 'suspended'
          const isProcessing = suspendingId === c.id
          return (
            <Panel key={c.id} className={`relative flex flex-col justify-between space-y-3 transition-all ${isSuspended ? 'opacity-60 border-amber-500/30 bg-amber-500/5' : ''}`}>
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
                      {c.category}
                    </span>
                    {isSuspended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        <PauseCircle className="size-3" />
                        {isAr ? 'موقوف' : 'Suspended'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Suspend / Resume Button */}
                    <button
                      onClick={() => handleSuspend(c.id)}
                      disabled={isProcessing}
                      className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                        isSuspended
                          ? 'text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30'
                          : 'text-amber-400 hover:bg-amber-500/15 border border-amber-500/20'
                      }`}
                      title={isSuspended ? (isAr ? 'إعادة تفعيل التيم' : 'Resume Team') : (isAr ? 'إيقاف التيم مؤقتاً' : 'Suspend Team')}
                    >
                      {isProcessing ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : isSuspended ? (
                        <PlayCircle className="size-4" />
                      ) : (
                        <PauseCircle className="size-4" />
                      )}
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteClub(c.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border/40"
                      title={isAr ? 'حذف التيم' : 'Delete Team'}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <h4 className="mt-2 font-display text-lg font-bold">{c.name}</h4>
                <p className="text-xs text-muted-foreground">{c.faculty} · {c.members} {isAr ? 'عضو' : 'members'}</p>
                <p className="mt-2 text-xs text-foreground/80 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.openRoles.length} {isAr ? 'أدوار مفتوحة' : 'open roles'}</span>
                {isSuspended ? (
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <PauseCircle className="size-3.5" /> {isAr ? 'موقوف مؤقتاً' : 'Suspended'}
                  </span>
                ) : (
                  <span className="font-semibold text-gold flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {isAr ? 'متاح للتقديم' : 'Recruiting'}
                  </span>
                )}
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Modal Add Club */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-start rtl:text-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-gold" />
                  {isAr ? 'إضافة تيم / نشاط جديد في الكلية' : 'Add New Faculty Team'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'اسم الفريق / النشاط' : 'Team / Activity Name'}</label>
                  <input
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder={isAr ? 'مثال: نادي الذكاء الاصطناعي والابتكار' : 'e.g. AI & Innovation Society'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{isAr ? 'المجال / التصنيف' : 'Category'}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{isAr ? 'الكلية التابع لها' : 'Faculty'}</label>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold text-foreground"
                    >
                      {currentFaculties.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'الشعار المختصر (Tagline)' : 'Tagline'}</label>
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder={isAr ? 'مثال: ابنِ مستقبلك التكنولوجي معنا.' : 'Build the future with us.'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'وصف الفريق والأنشطة' : 'Team Description'}</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isAr ? 'اكتب وصفاً جذاباً للفريق وأهدافه والأنشطة التي يقدمها للطلاب...' : 'Describe team goals and activities...'}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">{isAr ? 'الوظائف والأدوار المتاحة للتقديم (مفصولة بفاصلة)' : 'Open Roles (comma-separated)'}</label>
                  <input
                    value={openRoles}
                    onChange={(e) => setOpenRoles(e.target.value)}
                    placeholder="Front-end Developer, UI/UX Designer"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:scale-105 transition-transform"
                  >
                    {isAr ? 'حفظ وإضافة الفريق' : 'Save & Add Team'}
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

export function OwnerWorkspace() {
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const tabs: DashboardTab[] = [
    { id: 'overview', label: isAr ? 'نظرة عامة' : 'Overview', icon: Building2, render: () => <Overview /> },
    { id: 'admins', label: isAr ? 'ليدرز الفرق' : 'Team Leaders', icon: ShieldCheck, render: () => <AdminsManagement /> },
    { id: 'clubs', label: isAr ? 'الفرق والأندية' : 'Teams & Clubs', icon: LayoutGrid, render: () => <ClubsManagement /> },
  ]

  return (
    <DashboardShell
      tabs={tabs}
      accent="text-gold"
      sidebarHeader={
        <div className="text-start rtl:text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {isAr ? 'إدارة الكلية والجامعة' : 'University Management'}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gold">
            <Building2 className="size-4" />
            {isAr ? 'الواجهة الرئيسية للمناصب (Master Control)' : 'Platform Master Control'}
          </p>
        </div>
      }
    />
  )
}
