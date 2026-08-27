import { type UserRole } from '../types'

interface UserRoleBadgeProps {
  role: UserRole
}

const config: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-[#34a835]/15 text-primary',
  },
  worker: {
    label: 'Worker',
    className: 'bg-primary/10 text-primary',
  },
  client: {
    label: 'Client',
    className: 'bg-muted text-muted-foreground',
  },
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { label, className } = config[role] ?? config.client
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
