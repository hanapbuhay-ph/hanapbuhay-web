import { type DeletionRequestStatus } from '../types'

interface DeletionRequestStatusBadgeProps {
  status: DeletionRequestStatus
}

const config: Record<DeletionRequestStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-primary/10 text-primary',
  },
  denied: {
    label: 'Denied',
    className: 'bg-destructive/10 text-destructive',
  },
}

export function DeletionRequestStatusBadge({
  status,
}: DeletionRequestStatusBadgeProps) {
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
