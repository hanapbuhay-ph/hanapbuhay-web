import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  BriefcaseBusiness,
  FileCheck2,
  Flag,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AdminNotification } from '../types'

const notificationIcons: Record<string, typeof Bell> = {
  new_registration: UserRound,
  new_job_post: BriefcaseBusiness,
  verification_submitted: FileCheck2,
  new_report: Flag,
  security_alert: ShieldAlert,
}

export function NotificationList({
  items,
  isSuperAdmin,
  onOpen,
  onDelete,
}: {
  items: AdminNotification[]
  isSuperAdmin: boolean
  onOpen: (item: AdminNotification) => void
  onDelete?: (id: number) => void
}) {
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground'>
        <Bell className='size-6' />
        You're all caught up.
      </div>
    )
  }

  return (
    <ul className='divide-y divide-border'>
      {items.map((item) => {
        const Icon = notificationIcons[item.type] ?? Bell
        return (
          <li key={item.id} className='flex items-start gap-3 px-1 py-3'>
            <button
              type='button'
              onClick={() => onOpen(item)}
              className='flex min-w-0 flex-1 items-start gap-3 text-left'
            >
              <span
                className={cn(
                  'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground',
                  item.type === 'security_alert' &&
                    'bg-destructive/10 text-destructive'
                )}
              >
                <Icon className='size-4' />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'truncate text-sm',
                      !item.is_read && 'font-semibold'
                    )}
                  >
                    {item.title}
                  </span>
                  {!item.is_read && (
                    <span className='size-2 shrink-0 rounded-full bg-primary' />
                  )}
                </span>
                <span className='mt-1 block text-sm text-muted-foreground'>
                  {item.body}
                </span>
                <span className='mt-1 block text-xs text-muted-foreground'>
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </span>
            </button>
            {isSuperAdmin && onDelete && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='shrink-0 px-2 text-xs text-muted-foreground'
                onClick={() => onDelete(item.id)}
                aria-label={`Delete notification: ${item.title}`}
              >
                Clear
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
