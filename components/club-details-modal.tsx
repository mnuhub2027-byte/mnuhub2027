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

type ModalProps = {
  club: Club | null
  onClose: () => void
}

const steps = ['Your Details', 'Academics', 'Portfolio', 'Review'] as const

export function ClubDetailsModal({ club, onClose }: ModalProps) {
  const { applyToClub } = useSystem()
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

  useEffect(() => {
    if (club) {
      setApplying(false)
      setStep(0)
      setSubmitted(false)
      setForm({
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
    }
  }, [club])

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
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
              aria-label="Close"
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
              <div className="absolute bottom-4 left-5 right-5">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${categoryStyles[club.category]}`}
                >
                  {club.category}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {club.name}
                </h2>
                <p className="text-sm text-muted-foreground">{club.tagline}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {!applying && !submitted && (
                <ClubOverview club={club} onApply={() => setApplying(true)} onClose={onClose} />
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
                      form.motivation,
                      form.portfolio,
                      form.whatsapp,
                      form.studentId,
                      form.faculty,
                      form.name
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

import { useRole } from '@/components/role-context'

type LiveEvent = { title: string; date: string; location: string }

function ClubOverview({ club, onApply, onClose }: { club: Club; onApply: () => void; onClose: () => void }) {
  const { role } = useRole()
  const isTeamMember = role === 'leader' || role === 'assistant' || role === 'member'
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[] | null>(null)

  useEffect(() => {
    if (!club) return
    const supabase = createClient()

    // Fetch real active member count
    supabase
      .from('club_members')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', club.id)
      .eq('status', 'active')
      .then(({ count }) => {
        if (count !== null) setMemberCount(count)
      })

    // Fetch real upcoming events
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
          {displayCount.toLocaleString()} active members
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Award className="size-4 text-accent" />
          {club.faculty}
        </span>
      </div>

      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          About the club
        </h3>
        <p className="mt-2 leading-relaxed text-foreground/90">
          {club.description}
        </p>
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Award className="size-4 text-accent" /> Past achievements
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

      <div>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Calendar className="size-4 text-primary" /> Upcoming events
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {displayEvents.length === 0 ? (
            <p className="col-span-2 text-sm text-muted-foreground">لا توجد فعاليات قادمة حالياً</p>
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
          الانتقال إلى لوحة التحكم (Dashboard)
          <ArrowRight className="size-4" />
        </a>
      ) : (
        <button
          onClick={onApply}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          Start your application
          <ArrowRight className="size-4" />
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
  const canProceed = () => {
    if (step === 0) return form.name.trim() && form.email.trim() && form.studentId.trim() && form.whatsapp.trim()
    if (step === 1) return form.faculty && form.year && form.role
    return true
  }

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onSubmit()
  }

  const back = () => {
    if (step === 0) onBackToOverview()
    else setStep(step - 1)
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-6 flex items-center">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  i < step
                    ? 'border-accent bg-accent text-accent-foreground'
                    : i === step
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  i < step ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mb-4 text-sm font-medium text-muted-foreground">
        Step {step + 1} of {steps.length} — {steps[step]}
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
              <Field label="Full name">
                <input
                  value={form.name}
                  onChange={(e) => set('name')(e.target.value)}
                  placeholder="Jordan Lee"
                  className={inputClass}
                />
              </Field>
              <Field label="University email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email')(e.target.value)}
                  placeholder="jordan.lee@uni.edu"
                  className={inputClass}
                />
              </Field>
              <Field label="Student ID">
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => set('studentId')(e.target.value)}
                  placeholder="20240101"
                  className={inputClass}
                />
              </Field>
              <Field label="WhatsApp Number">
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp')(e.target.value)}
                  placeholder="+20 123 456 7890"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Faculty">
                <select
                  value={form.faculty}
                  onChange={(e) => set('faculty')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select your faculty</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Year of study">
                <select
                  value={form.year}
                  onChange={(e) => set('year')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select your year</option>
                  {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate'].map(
                    (y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Role you're applying for">
                <select
                  value={form.role}
                  onChange={(e) => set('role')(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a role</option>
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
              <Field label="CV / portfolio link">
                <input
                  value={form.portfolio}
                  onChange={(e) => set('portfolio')(e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className={inputClass}
                />
              </Field>
              <Field label="Why do you want to join? (optional)">
                <textarea
                  value={form.motivation}
                  onChange={(e) => set('motivation')(e.target.value)}
                  rows={4}
                  placeholder="Tell the recruitment team what excites you…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-4">
              <ReviewRow label="Applying to" value={club.name} />
              <ReviewRow label="Name" value={form.name || '—'} />
              <ReviewRow label="Email" value={form.email || '—'} />
              <ReviewRow label="Student ID" value={form.studentId || '—'} />
              <ReviewRow label="WhatsApp" value={form.whatsapp || '—'} />
              <ReviewRow label="Faculty" value={form.faculty || '—'} />
              <ReviewRow label="Year" value={form.year || '—'} />
              <ReviewRow label="Role" value={form.role || '—'} />
              <ReviewRow label="Portfolio" value={form.portfolio || '—'} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={back}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4" />
          {step === 0 ? 'Back' : 'Previous'}
        </button>
        <button
          onClick={next}
          disabled={!canProceed()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === steps.length - 1 ? 'Submit application' : 'Continue'}
          {step < steps.length - 1 && <ArrowRight className="size-4" />}
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent glow-ring">
        <CheckCircle2 className="size-8" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold">Application sent!</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your application to{' '}
        <span className="font-medium text-foreground">{clubName}</span> is in.
        Track its status anytime from your student dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <a
          href="#dashboard"
          onClick={onClose}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Go to dashboard
        </a>
        <button
          onClick={onClose}
          className="rounded-xl border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Close
        </button>
      </div>
    </motion.div>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
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
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
