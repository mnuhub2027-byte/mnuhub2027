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
} from 'lucide-react'
import { useSystem } from '@/lib/system-context'
import { faculties, categories, type Category } from '@/lib/data'
import {
  DashboardShell,
  Panel,
  SectionTitle,
  StatCard,
  type DashboardTab,
} from '@/components/dashboard-shell'

function Overview() {
  const { clubs, admins, studentApplications, members } = useSystem()
  const [activeMembersCount, setActiveMembersCount] = useState<number | null>(null)
  const [totalApplicationsCount, setTotalApplicationsCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Real active members count across all clubs
    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setActiveMembersCount(count) })

    // Real total applications count across all clubs
    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => { if (count !== null) setTotalApplicationsCount(count) })
  }, [])

  const stats = [
    { label: 'إجمالي الفرق والأنشطة', value: clubs.length, icon: Building2, accent: 'text-gold' },
    { label: 'حسابات الأدمن المعتمدة', value: admins.length, icon: ShieldCheck, accent: 'text-primary' },
    { label: 'أعضاء الكلية النشطون', value: activeMembersCount ?? members.length, icon: Users, accent: 'text-chart-3' },
    { label: 'طلبات الانضمام الكلية', value: totalApplicationsCount ?? studentApplications.length, icon: LayoutGrid, accent: 'text-chart-4' },
  ]

  return (
    <div className="space-y-6">
      <SectionTitle
        title="لوحة تحكم الكلية والمنصة"
        subtitle="إدارة المنظومة بالكامل، إضافة الفرق، وتعيين الليدرز لكل نشاط."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-semibold">حالة الفرق والأنشطة بالكلية</h4>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
              نشطة 100%
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
            <h4 className="font-display text-base font-semibold">حسابات ليدرز الفرق الرسمية</h4>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              مفعلة
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
  const [showModal, setShowModal] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [faculty, setFaculty] = useState(faculties[0])
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
    <div className="space-y-6">
      <SectionTitle
        title="إدارة حسابات قادة الفرق (Leaders)"
        subtitle="إنشاء حسابات الليدرز وتوزيع الإشراف على الفرق والأنشطة."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
          >
            <UserPlus className="size-4" />
            إنشاء حساب ليدر جديد
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
                    {a.email} · كلية {a.faculty}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary">{a.assignedTeamName}</p>
                  <p className="text-[11px] text-muted-foreground">تاريخ الإنشاء: {a.createdAt}</p>
                </div>
                <button
                  onClick={() => removeAdmin(a.id)}
                  className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/15 transition-colors"
                  title="حذف حساب الليدر"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <UserPlus className="size-5 text-gold" />
                  إنشاء حساب ليدر جديد
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">اسم الليدر (أو المشرف)</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: د. أحمد المحمدي"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">البريد الإلكتروني الجامعي</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mnuh.edu.eg"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">الكلية</label>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    {faculties.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">الفريق المخصص للإشراف عليه</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
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
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:scale-105 transition-transform"
                  >
                    إنشاء وتعيين
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
  const { clubs, addClub, deleteClub } = useSystem()
  const [showModal, setShowModal] = useState(false)

  const [clubName, setClubName] = useState('')
  const [category, setCategory] = useState<Category>('Tech')
  const [faculty, setFaculty] = useState(faculties[0])
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [openRoles, setOpenRoles] = useState('Front-end Developer, UI/UX Designer')

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clubName || !description) return

    addClub({
      name: clubName,
      category,
      faculty,
      tagline: tagline || 'فريق جديد معتمد من الجامعة.',
      description,
      image: '/clubs/robotics.png',
      achievements: ['فريق حديث تم إطلاقه بالكلية'],
      events: [{ title: 'اللقاء التعريفي الأول', date: 'قريباً', location: 'المبنى الرئيسي' }],
      openRoles: openRoles.split(',').map((r) => r.trim()).filter(Boolean),
    })

    setClubName('')
    setTagline('')
    setDescription('')
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="إضافة وإدارة الفرق والأنشطة"
        subtitle="إنشاء فرق جديدة وتفعيل الأنشطة بالجامعة فوراً."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
          >
            <Plus className="size-4" />
            إضافة تيم جديد
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c) => (
          <Panel key={c.id} className="relative flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between">
                <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
                  {c.category}
                </span>
                <button
                  onClick={() => deleteClub(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="حذف التيم"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <h4 className="mt-2 font-display text-lg font-bold">{c.name}</h4>
              <p className="text-xs text-muted-foreground">{c.faculty} · {c.members} عضو</p>
              <p className="mt-2 text-xs text-foreground/80 line-clamp-2">{c.description}</p>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{c.openRoles.length} أدوار مفتوحة</span>
              <span className="font-semibold text-gold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> متاح للتقديم
              </span>
            </div>
          </Panel>
        ))}
      </div>

      {/* Modal Add Club */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-gold" />
                  إضافة تيم / نشاط جديد في الكلية
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">اسم الفريق / النشاط</label>
                  <input
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="مثال: نادي الذكاء الاصطناعي والابتكار"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">المجال / التصنيف</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">الكلية التابع لها</label>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                    >
                      {faculties.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">الشعار المختصر (Tagline)</label>
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="مثال: ابنِ مستقبلك التكنولوجي معنا."
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">وصف الفريق والأنشطة</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصفاً جذاباً للفريق وأهدافه والأنشطة التي يقدمها للطلاب..."
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">الوظائف والأدوار المتاحة للتقديم (مفصولة بفاصلة)</label>
                  <input
                    value={openRoles}
                    onChange={(e) => setOpenRoles(e.target.value)}
                    placeholder="مثال: مصمم جرافيك، مطور برمجة، مسؤول تنظيم"
                    className="mt-1 w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:scale-105 transition-transform"
                  >
                    حفظ وإضافة الفريق
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
  const tabs: DashboardTab[] = [
    { id: 'overview', label: 'Overview', icon: Building2, render: () => <Overview /> },
    { id: 'admins', label: 'Team Leaders', icon: ShieldCheck, render: () => <AdminsManagement /> },
    { id: 'clubs', label: 'Teams & Clubs', icon: LayoutGrid, render: () => <ClubsManagement /> },
  ]

  return (
    <DashboardShell
      tabs={tabs}
      accent="text-gold"
      sidebarHeader={
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            إدارة الكلية والجامعة
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gold">
            <Building2 className="size-4" />
            Platform Master Control
          </p>
        </div>
      }
    />
  )
}
