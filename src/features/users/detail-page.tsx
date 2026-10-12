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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserDetailPage({ id }: UserDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, setData } = useUser(id)
  const { isSubmitting, suspend, reactivate } = useUserAction()
  const { hasPendingDeletion, requestedAt } = useUserDeletionRequest(data)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showReactivate, setShowReactivate] = useState(false)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)

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
          <div className='grid items-start gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]'>
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardContent className='flex flex-col items-center p-6 text-center'>
                {data.profile_photo_url ? (
                  <button
                    type='button'
                    aria-label={`View ${data.name}'s profile photo`}
                    onClick={() => setIsPhotoOpen(true)}
                    className='mb-4 cursor-zoom-in rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  >
                    <Avatar className='h-36 w-36 border-4 border-background shadow-md'>
                      <AvatarImage src={data.profile_photo_url} alt={`${data.name} profile`} />
                      <AvatarFallback className='bg-primary/10 text-3xl font-semibold text-primary'>
                        {getInitials(data.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <Avatar className='mb-4 h-36 w-36 border-4 border-background shadow-md'>
                    <AvatarFallback className='bg-primary/10 text-3xl font-semibold text-primary'>
                      {getInitials(data.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h2 className='text-xl font-semibold text-foreground'>{data.name}</h2>
                <div className='mt-3 flex flex-wrap justify-center gap-2'>
                  <UserRoleBadge role={data.role} />
                  <UserStatusBadge isActive={data.is_active} />
                </div>
                <div className='mt-6 w-full border-t border-border pt-5'>
                  {data.is_active ? (
                    <Button
                      variant='outline'
                      onClick={() => setShowSuspend(true)}
                      disabled={isSubmitting}
                      className='w-full border-destructive text-destructive hover:bg-destructive/5'
                    >
                      <UserX className='h-4 w-4' />
                      Suspend User
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowReactivate(true)}
                      disabled={isSubmitting}
                      className='w-full bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                    >
                      <UserCheck className='h-4 w-4' />
                      Reactivate User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className='flex flex-col gap-5'>
              <Card
                className='rounded-2xl border-border bg-card'
                style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
              >
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base text-foreground'>Contact &amp; Location</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
                  <InfoRow icon={Mail} label={data.email} />
                  <InfoRow icon={Phone} label={data.mobile_number || 'Phone number not provided'} />
                  <InfoRow icon={MapPin} label={data.barangay ?? 'Barangay not set'} />
                </CardContent>
              </Card>

              <Card
                className='rounded-2xl border-border bg-card'
                style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
              >
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base text-foreground'>Account Details</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
                  <InfoRow
                    icon={Calendar}
                    label={`Joined ${format(new Date(data.created_at), 'MMMM d, yyyy')}`}
                  />
                  {data.is_google_account !== undefined && (
                    <InfoRow
                      icon={ShieldCheck}
                      label={data.is_google_account ? 'Google account' : 'Email & password account'}
                    />
                  )}
                  {data.email_verified_at && (
                    <InfoRow
                      icon={ShieldCheck}
                      label={`Email verified ${format(new Date(data.email_verified_at), 'MMMM d, yyyy')}`}
                    />
                  )}
                  {hasPendingDeletion && requestedAt && (
                    <InfoRow
                      icon={Trash2}
                      label={`Deletion requested ${format(new Date(requestedAt), 'MMM d, yyyy')}`}
                    />
                  )}
                </CardContent>
              </Card>

              {data.worker_profile && (
                <Card
                  className='rounded-2xl border-border bg-card'
                  style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
                >
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-base text-foreground'>Worker Profile</CardTitle>
                  </CardHeader>
                  <CardContent className='grid gap-4 sm:grid-cols-3'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Verification</p>
                      <p className='mt-1 text-sm font-medium capitalize text-foreground'>
                        {data.worker_profile.verification_status.replaceAll('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Average rating</p>
                      <p className='mt-1 text-sm font-medium text-foreground'>
                        {Number(data.worker_profile.average_rating).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Reviews</p>
                      <p className='mt-1 text-sm font-medium text-foreground'>
                        {data.worker_profile.total_reviews}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {data?.profile_photo_url && (
          <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
            <DialogContent className='max-w-3xl rounded-2xl border-border bg-card p-4 sm:p-6'>
              <DialogHeader>
                <DialogTitle className='text-sm font-semibold text-foreground'>
                  {data.name}'s profile photo
                </DialogTitle>
              </DialogHeader>
              <img
                src={data.profile_photo_url}
                alt={`${data.name}'s profile`}
                className='max-h-[75vh] w-full rounded-xl object-contain'
              />
            </DialogContent>
          </Dialog>
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
    <div className='grid items-start gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardContent className='flex flex-col items-center p-6'>
          <Skeleton className='mb-4 h-36 w-36 rounded-full' />
          <Skeleton className='h-6 w-40' />
          <Skeleton className='mt-3 h-5 w-32 rounded-full' />
          <Skeleton className='mt-6 h-9 w-full' />
        </CardContent>
      </Card>
      <div className='flex flex-col gap-5'>
        {[0, 1, 2].map((section) => (
          <Card key={section} className='rounded-2xl border-border bg-card'>
            <CardHeader>
              <Skeleton className='h-5 w-36' />
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-44' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
