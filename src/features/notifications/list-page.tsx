import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCheck, Trash2 } from 'lucide-react'
import { getUser } from '@/lib/auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationList } from './components/notification-list'
import { useAdminNotifications } from './hooks/use-admin-notifications'
import type { AdminNotification } from './types'
import { openAdminNotificationDestination } from './utils'

type StoredUser = { role?: string }

export function NotificationsListPage() {
  const navigate = useNavigate()
  const isSuperAdmin = getUser<StoredUser>()?.role === 'super_admin'
  const [confirmClear, setConfirmClear] = useState(false)
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    load,
    loadMore,
    markRead,
    markAllRead,
    deleteOne,
    deleteAll,
  } = useAdminNotifications()

  const onOpenNotification = async (item: AdminNotification) => {
    try {
      await markRead(item)
      if (!openAdminNotificationDestination(item.data?.url)) {
        void navigate({ to: '/notifications' })
      }
    } catch {
      return
    }
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Notifications
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Activity and security updates for the admin team.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {unreadCount > 0 && (
              <Button variant='outline' onClick={() => void markAllRead()}>
                <CheckCheck className='size-4' />
                Mark all read
              </Button>
            )}
            {isSuperAdmin && notifications.length > 0 && (
              <Button
                variant='destructive'
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 className='size-4' />
                Clear all
              </Button>
            )}
          </div>
        </div>
        <section className='rounded-xl border bg-card px-4'>
          {isLoading ? (
            <p className='py-12 text-center text-sm text-muted-foreground'>
              Loading notifications…
            </p>
          ) : error ? (
            <div className='py-12 text-center'>
              <p className='text-sm text-muted-foreground'>
                Notifications could not be loaded.
              </p>
              <Button variant='link' onClick={() => void load()}>
                Try again
              </Button>
            </div>
          ) : (
            <NotificationList
              items={notifications}
              isSuperAdmin={isSuperAdmin}
              onOpen={(item) => void onOpenNotification(item)}
              onDelete={(id) => void deleteOne(id)}
            />
          )}
        </section>
        {hasMore && (
          <div className='mt-4 flex justify-center'>
            <Button
              variant='outline'
              disabled={isLoadingMore}
              onClick={loadMore}
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </Main>
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes notifications for every admin. Audit log
              records are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={() => void deleteAll()}
            >
              Clear all notifications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
