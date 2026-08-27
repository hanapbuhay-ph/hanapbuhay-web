interface UserStatusBadgeProps {
  isActive: boolean
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'bg-destructive/10 text-destructive',
      ].join(' ')}
    >
      {isActive ? 'Active' : 'Suspended'}
    </span>
  )
}
