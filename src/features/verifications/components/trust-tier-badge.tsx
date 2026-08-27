import { type TrustTier } from '../types'

interface TrustTierBadgeProps {
  tier: TrustTier
}

const config: Record<TrustTier, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-primary/10 text-primary',
  },
  trusted: {
    label: 'Trusted',
    className: 'bg-blue-100 text-blue-700',
  },
  flagged: {
    label: 'Flagged',
    className: 'bg-amber-100 text-amber-700',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-destructive/10 text-destructive',
  },
}

export function TrustTierBadge({ tier }: TrustTierBadgeProps) {
  const { label, className } = config[tier] ?? config.verified
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
