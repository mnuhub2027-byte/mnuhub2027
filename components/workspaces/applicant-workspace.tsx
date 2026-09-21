'use client'

import { CheckCircle2, Clock, FileText, CalendarClock } from 'lucide-react'
import { useSystem } from '@/lib/system-context'
import { StatusBadge } from '@/components/status-badge'
import { Panel, SectionTitle, StatCard } from '@/components/dashboard-shell'

const steps = ['Pending', 'Reviewing', 'Interview Scheduled', 'Accepted']

function Progress({ status }: { status: string }) {
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
            {s === 'Pending' ? 'تم الإرسال' : s === 'Reviewing' ? 'مراجعة المساعد' : s === 'Interview Scheduled' ? 'مقابلة شخصية' : 'مقبول بالفريق'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ApplicantWorkspace() {
  const { studentApplications } = useSystem()

  const summary = [
    {
      label: 'طلبات الانضمام',
      value: studentApplications.length,
      icon: FileText,
      accent: 'text-primary',
    },
    {
      label: 'المقابلات الشخصية',
      value: studentApplications.filter(
        (a) => a.status === 'Interview Scheduled',
      ).length,
      icon: CalendarClock,
      accent: 'text-accent',
    },
    {
      label: 'مقبول بالفريق',
      value: studentApplications.filter((a) => a.status === 'Accepted').length,
      icon: CheckCircle2,
      accent: 'text-chart-3',
    },
    {
      label: 'قيد المراجعة',
      value: studentApplications.filter((a) => a.status === 'Pending').length,
      icon: Clock,
      accent: 'text-chart-4',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div>
        <SectionTitle
          title="طلبات انضمامي للفرق"
          subtitle="متابعة حالة وتقدم كل طلب من التقديم وحتى قرار المساعدين والأدمن."
        />
        <div className="space-y-3">
          {studentApplications.map((app) => (
            <Panel key={app.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-foreground text-base">{app.clubName}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-sans">
                    الوظيفة: {app.role} · قُدم بتاريخ {app.submitted}
                  </p>
                  <p className="mt-2 text-sm text-foreground/80 rounded-lg bg-secondary/30 p-2.5 border border-border/50">
                    💡 {app.note}
                  </p>
                </div>
              </div>
              <Progress status={app.status} />
            </Panel>
          ))}

          {studentApplications.length === 0 && (
            <Panel className="text-center py-8">
              <p className="text-sm text-muted-foreground">لم تقدم على أي فريق بعد. تصفح الفرق المعروضة وقدم الآن!</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
