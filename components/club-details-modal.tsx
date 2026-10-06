'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  MapPin,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { faculties, type Club } from '@/lib/data'
import { categoryStyles } from '@/lib/category-styles'
import { createClient } from '@/lib/supabase/client'
import { useSystem } from '@/lib/system-context'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useRole } from '@/components/role-context'
import { isValidEmail, isValidStudentId, isValidPhone, sanitizeText, sanitizeUrl } from '@/lib/security'
import { toast } from 'sonner'

type ModalProps = {
  club: Club | null
  onClose: () => void
}

export function ClubDetailsModal({ club, onClose }: ModalProps) {
  const { applyToClub } = useSystem()
  const { t, language } = useLanguage()
  const [applying, setApplying] = useState(false)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    whatsapp: '',
    faculty: '',
    year: '',
    role: '',
    portfolio: '',
    motivation: '',
  })

  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (club) {
      setApplying(false)
      setStep(0)
      setSubmitted(false)
      setForm({
        name: session?.user?.user_metadata?.full_name || '',
        email: session?.user?.email || '',
        studentId: session?.user?.user_metadata?.student_id || '',
        whatsapp: '',
        faculty: session?.user?.user_metadata?.faculty || '',
        year: '',
        role: '',
        portfolio: '',
        motivation: '',
      })
    }
  }, [club, session])

  const handleStartApply = () => {
    if (!session) {
      toast.error(
        language === 'ar'
          ? 'عفواً، يجب تسجيل الدخول بالحساب الجامعي لتقديم طلب انضمام'
          : 'Please sign in with your official university account to apply'
      )
      window.location.href = '/auth'
      return
    }
    setApplying(true)
  }

  useEffect(() => {
    document.body.style.overflow = club ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [club])

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <AnimatePresence>
      {club && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card sm:rounded-3xl text-start rtl:text-right"
          >
            <button
              onClick={onClose}
              className="absolute rtl:left-4 ltr:right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-all hover:bg-background hover:scale-110 active:scale-95"
              aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="size-4" />
            </button>

            <div className="relative h-40 shrink-0 overflow-hidden">
              <img
                src={club.image || '/placeholder.svg'}
                alt={`${club.name} banner`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 rtl:text-right text-left">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${categoryStyles[club.category]}`}
                >
                  {t(`category.${club.category}` as any)}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {club.name}
                </h2>
                <p className="text-sm text-muted-foreground">{club.tagline}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {!applying && !submitted && (
                <ClubOverview club={club} onApply={handleStartApply} onClose={onClose} />
              )}

              {applying && !submitted && (
                <ApplicationForm
                  club={club}
                  step={step}
                  setStep={setStep}
                  form={form}
                  set={set}
                  onSubmit={() => {
                    applyToClub(
                      club.id,
                      club.name,
                      form.role || club.openRoles[0],
                      sanitizeText(form.motivation),
                      sanitizeUrl(form.portfolio),
                      form.whatsapp.trim(),
                      form.studentId.trim(),
                      form.faculty,
                      sanitizeText(form.name)
                    )
                    setSubmitted(true)
                  }}
                  onBackToOverview={() => setApplying(false)}
                />
              )}

              {submitted && (
                <SuccessState clubName={club.name} onClose={onClose} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type LiveEvent = { title: string; date: string; location: string }

function ClubOverview({ club, onApply, onClose }: { club: Club; onApply: () => void; onClose: () => void }) {
  const { role } = useRole()
  const { t } = useLanguage()
  const isTeamMember = role === 'leader' || role === 'assistant' || role === 'member'
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[] | null>(null)

  useEffect(() => {
    if (!club) return
    const supabase = createClient()

    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', club.id)
      .eq('status', 'active')
      .then(({ count }) => {
        if (count !== null) setMemberCount(count)
      })

    supabase
      .from('team_events')
      .select('title, date, location')
      .eq('club_id', club.id)
      .order('date', { ascending: true })
      .limit(4)
      .then(({ data }) => {
        if (data) setLiveEvents(data as LiveEvent[])
      })
  }, [club?.id])

  const displayCount = memberCount !== null ? memberCount : club.members
  const displayEvents = liveEvents !== null ? liveEvents : club.events

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-4 text-primary" />
          {displayCount.toLocaleString()} {t('modal.activeMembers')}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Award className="size-4 text-accent" />
          {club.faculty}
        </span>
      </div>

      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('modal.about')}
        </h3>
        <p className="mt-2 leading-relaxed text-foreground/90">
          {club.description}
        </p>
      </div>

      {club.achievements && club.achievements.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Award className="size-4 text-accent" /> {t('modal.achievements')}
          </h3>
          <ul className="mt-3 space-y-2">
            {club.achievements.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-foreground/90">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Calendar className="size-4 text-primary" /> {t('modal.events')}
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {displayEvents.length === 0 ? (
            <p className="col-span-2 text-sm text-muted-foreground">{t('modal.noEvents')}</p>
          ) : (
            displayEvents.map((e) => (
              <div
                key={e.title}
                className="rounded-xl border border-border bg-secondary/40 p-3"
              >
                <p className="text-sm font-medium">{e.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3" /> {e.date}
                  {e.location && <><MapPin className="ml-1 size-3" /> {e.location}</>}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {isTeamMember ? (
        <a
          href="#dashboard"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-[1.01] hover:bg-primary/20"
        >
          {t('modal.goToDashboard')}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </a>
      ) : (
        <button
          onClick={onApply}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          {t('modal.startApplication')}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </button>
      )}
    </div>
  )
}

type FormState = {
  name: string
  email: string
  studentId: string
  whatsapp: string
  faculty: string
  year: string
  role: string
  portfolio: string
  motivation: string
}

function ApplicationForm({
  club,
  step,
  setStep,
  form,
  set,
  onSubmit,
  onBackToOverview,
}: {
  club: Club
  step: number
  setStep: (n: number) => void
  form: FormState
  set: (key: keyof FormState) => (value: string) => void
  onSubmit: () => void
  onBackToOverview: () => void
}) {
  const { t, language } = useLanguage()
  const currentFaculties = faculties[language] || faculties.ar
  
  const stepLabels = [
    t('modal.stepDetails'),
    t('modal.stepAcademics'),
    t('modal.stepPortfolio'),
    t('modal.stepReview'),
  ]

  const canProceed = () => {
    if (step === 0) return form.name.trim().length >= 3 && form.email.trim() && form.studentId.trim() && form.whatsapp.trim()
    if (step === 1) return form.faculty && form.year && form.role
    return true
  }

  const next = () => {
    if (step === 0) {
      if (!isValidEmail(form.email)) {
        toast.error(language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address format')
        return
      }
      if (!isValidStudentId(form.studentId)) {
        toast.error(language === 'ar' ? 'الرقم الجامعي يجب أن يكون أرقام فقط (6 إلى 12 رقماً)' : 'Student ID must contain 6 to 12 digits')
        return
      }
    }
    if (step < stepLabels.length - 1) setStep(step + 1)
    else onSubmit()
  }

  const back = () => {
    if (step === 0) onBackToOverview()
    else setStep(step - 1)
  }

  return (
    <div>
      {/* Mobile: compact step indicator */}
      <div className="mb-5 sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">
            {language === 'ar'
              ? `الخطوة ${step + 1} من ${stepLabels.length}`
              : `Step ${step + 1} of ${stepLabels.length}`}
          </p>
          <span className="text-xs font-medium text-primary">{stepLabels[step]}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Desktop: full horizontal stepper */}
      <div className="mb-6 hidden sm:flex items-center">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                  i < step
                    ? 'border-accent bg-accent text-accent-foreground'
                    : i === step
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 flex-1 rounded transition-colors duration-300 ${
                  i < step ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mb-4 text-sm font-medium text-muted-foreground sm:hidden sr-only">
        {language === 'ar'
          ? `الخطوة ${step + 1} من ${stepLabels.length} — ${stepLabels[step]}`
          : `Step ${step + 1} of ${stepLabels.length} — ${stepLabels[step]}`}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <Field label={t('modal.fullName')}>
                <input
                  value={form.name}
                  onChange={(e) => set('name')(e.target.value)}
                  placeholder={t('modal.fullNamePlaceholder')}
                  className={inputClass}
                />
              </Field>
              <Field label={t('modal.email')}>
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email')(e.target.value.replace(/[^\x20-\x7E]/g, '').trim())}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pasted = e.clipboardData.getData('text').replace(/[^\x20-\x7E]/g, '').trim()
                    set('email')(pasted)
                  }}
                  placeholder={t('modal.emailPlaceholder')}
                  className={inputClass}
                />
              </Field>
              <Field label={t('modal.studentId')}>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => set('studentId')(e.target.value)}
                  placeholder={t('modal.studentIdPlaceholder')}
                  className={inputClass}
                />
              </Field>
              <Field label={t('modal.whatsapp')}>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp')(e.target.value)}
                  placeholder={t('modal.whatsappPlaceholder')}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label={t('modal.faculty')}>
                <select
                  value={form.faculty}
                  onChange={(e) => set('faculty')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('modal.selectFaculty')}</option>
                  {currentFaculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('modal.year')}>
                <select
                  value={form.year}
                  onChange={(e) => set('year')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('modal.selectYear')}</option>
                  {['year.1', 'year.2', 'year.3', 'year.4', 'year.post'].map((yKey) => (
                    <option key={yKey} value={t(yKey as any)}>
                      {t(yKey as any)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('modal.role')}>
                <select
                  value={form.role}
                  onChange={(e) => set('role')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('modal.selectRole')}</option>
                  {club.openRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label={t('modal.cvLink')}>
                <input
                  value={form.portfolio}
                  onChange={(e) => set('portfolio')(e.target.value)}
                  placeholder={t('modal.cvPlaceholder')}
                  className={inputClass}
                />
              </Field>
              <Field label={t('modal.motivation')}>
                <textarea
                  value={form.motivation}
                  onChange={(e) => set('motivation')(e.target.value)}
                  rows={4}
                  placeholder={t('modal.motivationPlaceholder')}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-4">
              <ReviewRow label={t('modal.applyingTo')} value={club.name} />
              <ReviewRow label={t('modal.fullName')} value={form.name || '—'} />
              <ReviewRow label={t('modal.email')} value={form.email || '—'} />
              <ReviewRow label={t('modal.studentId')} value={form.studentId || '—'} />
              <ReviewRow label={t('modal.whatsapp')} value={form.whatsapp || '—'} />
              <ReviewRow label={t('modal.faculty')} value={form.faculty || '—'} />
              <ReviewRow label={t('modal.year')} value={form.year || '—'} />
              <ReviewRow label={t('modal.role')} value={form.role || '—'} />
              <ReviewRow label={t('modal.cvLink')} value={form.portfolio || '—'} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={back}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {step === 0 ? t('modal.back') : t('modal.previous')}
        </button>
        <button
          onClick={next}
          disabled={!canProceed()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === stepLabels.length - 1 ? t('modal.submit') : t('modal.continue')}
          {step < stepLabels.length - 1 && <ArrowRight className="size-4 rtl:rotate-180" />}
        </button>
      </div>
    </div>
  )
}

function SuccessState({
  clubName,
  onClose,
}: {
  clubName: string
  onClose: () => void
}) {
  const { t } = useLanguage()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent glow-ring">
        <CheckCircle2 className="size-8" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold">{t('modal.successTitle')}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t('modal.successDesc1')}
        <span className="font-medium text-foreground">{clubName}</span>
        {t('modal.successDesc2')}
      </p>
      <div className="mt-6 flex gap-3">
        <a
          href="#dashboard"
          onClick={onClose}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {t('modal.goToDashboard')}
        </a>
        <button
          onClick={onClose}
          className="rounded-xl border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          {t('modal.close')}
        </button>
      </div>
    </motion.div>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40 text-start rtl:text-right'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-start rtl:text-right">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right rtl:text-left font-medium text-foreground">{value}</span>
    </div>
  )
}
