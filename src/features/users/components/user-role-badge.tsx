import { type UserRole } from '../types'

interface UserRoleBadgeProps {
  role: UserRole | null
}

const config: Record<UserRole, { label: string; className: string }> = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
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
  if (role === null) {
    return (
      <span className='inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300'>
        Profile incomplete
      </span>
    )
  }

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
