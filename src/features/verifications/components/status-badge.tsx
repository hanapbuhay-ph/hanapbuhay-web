import { type VerificationStatus } from '../types'

interface StatusBadgeProps {
  status: VerificationStatus
}

const config: Record<VerificationStatus, { label: string; className: string }> =
  {
    pending: {
      label: 'Pending',
      className: 'bg-muted text-muted-foreground',
    },
    approved: {
      label: 'Approved',
      className: 'bg-primary/10 text-primary',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-destructive/10 text-destructive',
    },
    resubmission_requested: {
      label: 'Resubmission Requested',
      className: 'bg-amber-100 text-amber-700',
    },
  }

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status] ?? config.pending
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
