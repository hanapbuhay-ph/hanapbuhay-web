import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAdminNotifications } from '../hooks/use-admin-notifications'
import type { AdminNotification } from '../types'
import { openAdminNotificationDestination } from '../utils'
import { NotificationList } from './notification-list'

type StoredUser = { role?: string }

export function AdminNotificationBell() {
  const user = getUser<StoredUser>()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  if (!isAdmin) return null

  return (
    <AdminNotificationBellContent isSuperAdmin={user?.role === 'super_admin'} />
  )
}

function AdminNotificationBellContent({
  isSuperAdmin,
}: {
  isSuperAdmin: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, isLoading, error, load, markRead } =
    useAdminNotifications({ poll: true })

  const onOpenNotification = async (item: AdminNotification) => {
    try {
      await markRead(item)
      setOpen(false)
      if (!openAdminNotificationDestination(item.data?.url)) {
        void navigate({ to: '/notifications' })
      }
    } catch {
      return
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) void load()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative rounded-full'
          aria-label='Notifications'
        >
          <Bell className='size-[1.2rem]' />
          {unreadCount > 0 && (
            <span className='text-destructive-foreground absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[380px] max-w-[calc(100vw-2rem)] p-0'
      >
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <div>
            <h2 className='font-semibold'>Notifications</h2>
            <p className='text-xs text-muted-foreground'>
              {unreadCount
                ? `${unreadCount} unread`
                : 'No unread notifications'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => void navigate({ to: '/notifications' })}
            >
              <CheckCheck className='size-4' />
              View all
            </Button>
          )}
        </div>
        <div className='max-h-[min(65vh,440px)] overflow-y-auto px-3'>
          {isLoading ? (
            <p className='py-10 text-center text-sm text-muted-foreground'>
              Loading notifications…
            </p>
          ) : error ? (
            <div className='py-8 text-center text-sm text-muted-foreground'>
              <p>Notifications could not be loaded.</p>
              <Button variant='link' size='sm' onClick={() => void load()}>
                Try again
              </Button>
            </div>
          ) : (
            <NotificationList
              items={notifications.slice(0, 8)}
              isSuperAdmin={isSuperAdmin}
              onOpen={(item) => void onOpenNotification(item)}
            />
          )}
        </div>
        <div className='border-t p-2'>
          <Button
            variant='ghost'
            className='w-full justify-center'
            onClick={() => {
              setOpen(false)
              void navigate({ to: '/notifications' })
            }}
          >
            <ExternalLink className='size-4' />
            Open notification center
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
