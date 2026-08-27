import { type BookingStatus } from '../types'

interface BookingStatusBadgeProps {
  status: BookingStatus
}

const config: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-[#34a835]/15 text-primary',
  },
  active: {
    label: 'Active',
    className: 'bg-primary/10 text-primary',
  },
  completed: {
    label: 'Completed',
    className: 'bg-primary/20 text-primary font-semibold',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive',
  },
  declined: {
    label: 'Declined',
    className: 'bg-muted text-muted-foreground line-through',
  },
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
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
