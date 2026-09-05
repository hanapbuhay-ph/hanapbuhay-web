import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Hash,
  User,
  HardHat,
  Wrench,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  RefreshCw,
  Ban,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBooking } from './hooks/use-booking'
import { useBookingAction } from './hooks/use-booking-action'
import { BookingStatusBadge } from './components/booking-status-badge'
import { ForceCancelDialog } from './components/force-cancel-dialog'
import { CANCELLABLE_STATUSES } from './types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingDetailPageProps {
  id: string
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function BookingDetailPage({ id }: BookingDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, setData } = useBooking(id)
  const { isSubmitting, forceCancel } = useBookingAction()
  const [showCancel, setShowCancel] = useState(false)

  const canForceCancel =
    data !== null && CANCELLABLE_STATUSES.includes(data.status)

  function handleForceCancelConfirm(reason: string) {
    if (!data) return
    forceCancel(data.id, reason, (updated) => {
      setData((prev) => prev ? { ...prev, ...updated } : prev)
      setShowCancel(false)
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
            onClick={() => navigate({ to: '/bookings' })}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Booking Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              Read-only view. Force cancel is the only available admin action.
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
              Failed to load booking
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
            {/* Booking info card */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <CardTitle className='font-mono text-lg text-foreground'>
                    {data.booking_code}
                  </CardTitle>
                  <BookingStatusBadge status={data.status} />
                </div>
              </CardHeader>

              <CardContent className='flex flex-col gap-2'>
                <InfoRow icon={User} label={`Client: ${data.client.name}`} />
                <InfoRow icon={HardHat} label={`Worker: ${data.worker.name}`} />
                <InfoRow
                  icon={Wrench}
                  label={`Service: ${data.service_category.name}`}
                />
                <InfoRow
                  icon={Calendar}
                  label={`Scheduled: ${format(new Date(data.scheduled_at), 'MMMM d, yyyy · h:mm a')}`}
                />
                <InfoRow
                  icon={Clock}
                  label={`Created: ${format(new Date(data.created_at), 'MMMM d, yyyy')}`}
                />
                <InfoRow
                  icon={Hash}
                  label={`Booking ID: ${data.id}`}
                />
                {/* Notes — only rendered when present */}
                {data.notes && (
                  <InfoRow icon={FileText} label={`Notes: ${data.notes}`} />
                )}
              </CardContent>
            </Card>

            {/* Force Cancel — only shown for cancellable statuses */}
            {canForceCancel && (
              <div>
                <Button
                  variant='outline'
                  onClick={() => setShowCancel(true)}
                  disabled={isSubmitting}
                  className='border-destructive text-destructive hover:bg-destructive/5'
                >
                  <Ban className='h-4 w-4' />
                  Force Cancel Booking
                </Button>
              </div>
            )}
          </div>
        )}
      </Main>

      {/* Dialog — outside Main so it portals correctly */}
      {data && (
        <ForceCancelDialog
          open={showCancel}
          bookingCode={data.booking_code}
          isSubmitting={isSubmitting}
          onConfirm={handleForceCancelConfirm}
          onCancel={() => setShowCancel(false)}
        />
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className='flex items-start gap-2 text-sm text-muted-foreground'>
      <Icon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
      <span>{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <Card className='rounded-2xl border-border bg-card'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-5 w-16 rounded-full' />
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Skeleton className='h-4 w-44' />
        <Skeleton className='h-4 w-44' />
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-4 w-52' />
        <Skeleton className='h-4 w-40' />
      </CardContent>
    </Card>
  )
}
