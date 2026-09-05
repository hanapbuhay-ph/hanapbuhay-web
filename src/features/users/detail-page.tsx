import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ReactivateDialog } from './components/reactivate-dialog'
import { SuspendDialog } from './components/suspend-dialog'
import { UserRoleBadge } from './components/user-role-badge'
import { UserStatusBadge } from './components/user-status-badge'
import { useUser } from './hooks/use-user'
import { useUserAction } from './hooks/use-user-action'
import { useUserDeletionRequest } from './hooks/use-user-deletion-request'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserDetailPageProps {
  id: string
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserDetailPage({ id }: UserDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, setData } = useUser(id)
  const { isSubmitting, suspend, reactivate } = useUserAction()
  const { hasPendingDeletion, requestedAt } = useUserDeletionRequest(data)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showReactivate, setShowReactivate] = useState(false)

  function handleSuspendConfirm(reason: string) {
    if (!data) return
    suspend(data.id, reason, (isActive) => {
      setData((prev) => prev ? { ...prev, is_active: isActive } : prev)
      setShowSuspend(false)
    })
  }

  function handleReactivateConfirm() {
    if (!data) return
    reactivate(data.id, (isActive) => {
      setData((prev) => prev ? { ...prev, is_active: isActive } : prev)
      setShowReactivate(false)
    })
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
        {/* Back + title */}
        <div className='mb-6 flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate({ to: '/users' })}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              User Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              View and manage this user's account.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <DetailSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
            <p className='text-sm font-semibold text-foreground'>
              Failed to load user
            </p>
            <p className='text-xs text-muted-foreground'>{error}</p>
            <Button
              size='sm'
              variant='outline'
              onClick={refetch}
              className='mt-1 border-border text-primary hover:bg-primary/5'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Retry
            </Button>
          </div>
        )}

        {/* Data */}
        {!isLoading && !error && data && (
          <div className='flex flex-col gap-5'>
            {/* Info card */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <CardTitle className='text-lg text-foreground'>
                    {data.name}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <UserRoleBadge role={data.role} />
                    <UserStatusBadge isActive={data.is_active} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className='flex flex-col gap-2'>
                <InfoRow icon={Mail} label={data.email} />
                <InfoRow icon={MapPin} label={data.barangay} />
                <InfoRow
                  icon={Calendar}
                  label={`Joined ${format(new Date(data.created_at), 'MMMM d, yyyy')}`}
                />
                {/* Optional fields — only rendered when present */}
                {data.mobile_number && (
                  <InfoRow icon={Phone} label={data.mobile_number} />
                )}
                {data.is_google_account !== undefined && (
                  <InfoRow
                    icon={ShieldCheck}
                    label={
                      data.is_google_account
                        ? 'Google account'
                        : 'Email & password account'
                    }
                  />
                )}
                {/* Deletion request info row — shown if pending deletion exists */}
                {hasPendingDeletion && requestedAt && (
                  <div className='mt-1 flex items-center gap-2'>
                    <Trash2 className='h-4 w-4 shrink-0 text-primary' />
                    <span className='text-sm text-muted-foreground'>
                      Deletion requested on{' '}
                      {format(new Date(requestedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action button */}
            <div>
              {data.is_active ? (
                <Button
                  variant='outline'
                  onClick={() => setShowSuspend(true)}
                  disabled={isSubmitting}
                  className='border-destructive text-destructive hover:bg-destructive/5'
                >
                  <UserX className='h-4 w-4' />
                  Suspend User
                </Button>
              ) : (
                <Button
                  onClick={() => setShowReactivate(true)}
                  disabled={isSubmitting}
                  className='bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                >
                  <UserCheck className='h-4 w-4' />
                  Reactivate User
                </Button>
              )}
            </div>
          </div>
        )}
      </Main>

      {/* Dialogs — rendered outside Main so they always portal correctly */}
      {data && (
        <>
          <SuspendDialog
            open={showSuspend}
            userName={data.name}
            isSubmitting={isSubmitting}
            onConfirm={handleSuspendConfirm}
            onCancel={() => setShowSuspend(false)}
          />
          <ReactivateDialog
            open={showReactivate}
            userName={data.name}
            isSubmitting={isSubmitting}
            onConfirm={handleReactivateConfirm}
            onCancel={() => setShowReactivate(false)}
          />
        </>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      <Icon className='h-4 w-4 shrink-0 text-primary' />
      <span>{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <Card className='rounded-2xl border-border bg-card'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <Skeleton className='h-6 w-40' />
          <div className='flex gap-2'>
            <Skeleton className='h-5 w-14 rounded-full' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-44' />
      </CardContent>
    </Card>
  )
}
