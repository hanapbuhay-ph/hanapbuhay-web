import { type ReviewStatus, STATUS_LABELS } from '../types'

interface ReviewStatusBadgeProps {
  status: ReviewStatus
}

const config: Record<ReviewStatus, { className: string }> = {
  visible: {
    className: 'bg-primary/10 text-primary',
  },
  flagged: {
    className: 'bg-amber-100 text-amber-700',
  },
  removed: {
    className: 'bg-destructive/10 text-destructive',
  },
}

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  const { className } = config[status] ?? config.visible
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      ].join(' ')}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
