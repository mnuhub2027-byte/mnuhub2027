import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  // Applications / pipeline
  Pending: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  Reviewing: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  'Interview Scheduled': 'bg-accent/15 text-accent border-accent/30',
  Interview: 'bg-accent/15 text-accent border-accent/30',
  Accepted: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  Rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  // Tasks
  'To Do': 'bg-muted text-muted-foreground border-border',
  'In Progress': 'bg-accent/15 text-accent border-accent/30',
  Done: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  // Priority
  High: 'bg-destructive/15 text-destructive border-destructive/30',
  Medium: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  Low: 'bg-muted text-muted-foreground border-border',
  // Team roles
  Leader: 'bg-primary/15 text-primary border-primary/30',
  'Vice Leader': 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  Member: 'bg-secondary text-secondary-foreground border-border',
  // Decisions
  Accept: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  Reject: 'bg-destructive/15 text-destructive border-destructive/30',
  // Event types
  Meeting: 'bg-accent/15 text-accent border-accent/30',
  Workshop: 'bg-primary/15 text-primary border-primary/30',
  Competition: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  Social: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        statusStyles[status] ?? 'bg-secondary text-secondary-foreground border-border',
        className,
      )}
    >
      {status}
    </span>
  )
}
