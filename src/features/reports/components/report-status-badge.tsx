import { type ReportStatus } from '../types'

interface ReportStatusBadgeProps {
  status: ReportStatus
}

const config: Record<ReportStatus, { label: string; className: string }> = {
  under_review: {
    label: 'Under Review',
    className: 'bg-muted text-muted-foreground',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-primary/10 text-primary',
  },
  dismissed: {
    label: 'Dismissed',
    className: 'bg-muted/60 text-muted-foreground',
  },
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const { label, className } = config[status] ?? config.under_review
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}
