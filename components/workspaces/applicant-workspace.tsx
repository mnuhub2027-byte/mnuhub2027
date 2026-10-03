'use client'

import { CheckCircle2, Clock, FileText, CalendarClock, Trash2, CalendarPlus, MapPin, Sparkles } from 'lucide-react'
import { useSystem } from '@/lib/system-context'
import { StatusBadge } from '@/components/status-badge'
import { Panel, SectionTitle, StatCard } from '@/components/dashboard-shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const steps = ['Pending', 'Reviewing', 'Interview Scheduled', 'Accepted']

function Progress({ status }: { status: string }) {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const current = Math.max(0, steps.indexOf(status))
  return (
    <div className="mt-4 flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1.5">
          <div
            className={`h-1.5 rounded-full ${
              i <= current ? 'bg-primary' : 'bg-secondary'
            }`}
          />
          <span
            className={`hidden text-[10px] sm:block ${
              i <= current ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {s === 'Pending'
              ? (isAr ? 'تم الإرسال' : 'Submitted')
              : s === 'Reviewing'
                ? (isAr ? 'مراجعة المساعد' : 'Admin Review')
                : s === 'Interview Scheduled'
                  ? (isAr ? 'مقابلة شخصية' : 'Interview')
                  : (isAr ? 'مقبول بالفريق' : 'Accepted')}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ApplicantWorkspace() {
  const { studentApplications, withdrawApplication, clubs } = useSystem()
  const { language } = useLanguage()
  const isAr = language === 'ar'

  const summary = [
    {
      label: isAr ? 'طلبات الانضمام' : 'Total Applications',
      value: studentApplications.length,
      icon: FileText,
      accent: 'text-primary',
    },
    {
      label: isAr ? 'المقابلات الشخصية' : 'Interviews',
      value: studentApplications.filter(
        (a) => a.status === 'Interview Scheduled',
      ).length,
      icon: CalendarClock,
      accent: 'text-accent',
    },
    {
      label: isAr ? 'مقبول بالفريق' : 'Accepted',
      value: studentApplications.filter((a) => a.status === 'Accepted').length,
      icon: CheckCircle2,
      accent: 'text-chart-3',
    },
    {
      label: isAr ? 'قيد المراجعة' : 'Pending Review',
      value: studentApplications.filter((a) => a.status === 'Pending').length,
      icon: Clock,
      accent: 'text-chart-4',
    },
  ]

  const appliedClubIds = new Set(studentApplications.map((a) => a.clubId))
  const recommendedClubs = clubs.filter((c) => !appliedClubIds.has(c.id)).slice(0, 2)

  return (
    <div className="space-y-6 text-start rtl:text-right">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div>
        <SectionTitle
          title={isAr ? 'طلبات انضمامي للفرق' : 'My Applications'}
          subtitle={
            isAr
              ? 'متابعة حالة وتقدم كل طلب من التقديم وحتى قرار المساعدين والأدمن.'
              : 'Track the status and progress of your applications from submission to final decision.'
          }
        />
        <div className="space-y-3">
          {studentApplications.map((app) => (
            <Panel key={app.id} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-foreground text-base">{app.clubName}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-sans">
                    {isAr ? `الوظيفة: ${app.role} · قُدم بتاريخ ${app.submitted}` : `Role: ${app.role} · Submitted: ${app.submitted}`}
                  </p>
                  <p className="mt-2 text-sm text-foreground/80 rounded-lg bg-secondary/30 p-2.5 border border-border/50">
                    💡 {app.note}
                  </p>
                </div>

                {app.status === 'Pending' && (
                  <button
                    onClick={() => withdrawApplication(app.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                    {isAr ? 'سحب الطلب' : 'Withdraw'}
                  </button>
                )}
              </div>

              {app.status === 'Interview Scheduled' && (
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-accent">
                    <MapPin className="size-4 shrink-0" />
                    <span>{isAr ? 'مقابلة شخصية قادمة: المبنى الأكاديمي الرئيسي - قاعة B2' : 'Upcoming Interview: Academic Building B2'}</span>
                  </div>
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`[MNUHub] المقابلة الشخصية - ${app.clubName}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-accent text-accent-foreground px-2.5 py-1 text-xs font-semibold hover:bg-accent/90 transition-colors shrink-0"
                  >
                    <CalendarPlus className="size-3.5" />
                    <span>{isAr ? 'أضف للتقويم' : 'Add to Calendar'}</span>
                  </a>
                </div>
              )}

              <Progress status={app.status} />
            </Panel>
          ))}

          {studentApplications.length === 0 && (
            <Panel className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? 'لم تقدم على أي فريق بعد. تصفح الفرق المعروضة وقدم الآن!'
                  : 'You have not applied to any club yet. Browse clubs above and apply!'}
              </p>
            </Panel>
          )}
        </div>
      </div>

      {/* Recommended Clubs Banner */}
      {recommendedClubs.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-secondary/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Sparkles className="size-4 text-primary animate-pulse" />
            <span>{isAr ? 'فرق ترشحها لك المنصة بجامعة المنصورة الأهلية' : 'Recommended University Clubs'}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendedClubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3">
                <div>
                  <p className="font-semibold text-xs text-foreground">{club.name}</p>
                  <p className="text-[11px] text-muted-foreground">{club.faculty}</p>
                </div>
                <a href="#directory" className="text-xs font-semibold text-primary hover:underline">
                  {isAr ? 'تقديم الانضمام ←' : 'Apply Now →'}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
