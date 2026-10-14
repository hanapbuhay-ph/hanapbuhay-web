import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  AlertTriangle,
  Flag,
  RefreshCw,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { FlagReviewDialog } from './components/flag-dialog'
import { RemoveReviewDialog } from './components/remove-dialog'
import { RestoreReviewDialog } from './components/restore-dialog'
import { ReviewStatusBadge } from './components/review-status-badge'
import { StarRating } from './components/star-rating'
import { useReview } from './hooks/use-review'
import { useReviewAction } from './hooks/use-review-action'

interface ReviewDetailPageProps {
  id: string
}

export function ReviewDetailPage({ id }: ReviewDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, setData } = useReview(id)
  const { isSubmitting, flagReview, removeReview, restoreReview } =
    useReviewAction()
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  function handleFlagConfirm(reason: string) {
    if (!data) return
    flagReview(data.id, reason, (updated) => {
      setShowFlagDialog(false)
      setData(updated)
      toast.success('Review flagged.')
    })
  }

  function handleRemoveConfirm() {
    if (!data) return
    removeReview(data.id, (updated) => {
      setShowRemoveDialog(false)
      setData(updated)
      toast.success('Review removed.')
    })
  }

  function handleRestoreConfirm() {
    if (!data) return
    restoreReview(data.id, (updated) => {
      setShowRestoreDialog(false)
      setData(updated)
      toast.success('Review restored to visible.')
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
            onClick={() => navigate({ to: '/reviews' })}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Review Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              View and manage this review.
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
              Failed to load review
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
            {/* Review info card */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='font-mono text-lg text-foreground'>
                      {data.booking_code}
                    </CardTitle>
                    <p className='text-xs text-muted-foreground'>
                      Booking{' '}
                      <button
                        onClick={() =>
                          navigate({
                            to: '/bookings/$id',
                            params: { id: data.booking_id },
                          })
                        }
                        className='font-medium text-primary underline hover:text-primary/80'
                      >
                        #{data.booking_id}
                      </button>
                    </p>
                  </div>
                  <ReviewStatusBadge status={data.status} />
                </div>
              </CardHeader>

              <CardContent className='flex flex-col gap-3'>
                {/* Reviewer */}
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    REVIEWER
                  </p>
                  <p className='text-sm text-foreground'>
                    {data.reviewer_name}{' '}
                    <span className='text-xs text-muted-foreground'>
                      ({data.reviewer_role})
                    </span>
                  </p>
                </div>

                {/* Reviewed Worker */}
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    WORKER
                  </p>
                  <p className='text-sm text-foreground'>
                    {data.reviewed_name}{' '}
                    <span className='text-xs text-muted-foreground'>
                      ({data.reviewed_role})
                    </span>
                  </p>
                </div>

                {/* Large star rating */}
                <div className='py-2'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    RATING
                  </p>
                  <StarRating rating={data.rating} size='lg' showNumeric />
                </div>

                {/* Full comment */}
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    COMMENT
                  </p>
                  <p className='mt-1 text-sm leading-relaxed text-foreground'>
                    {data.comment}
                  </p>
                </div>

                {/* Created date */}
                <div className='pt-1'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    SUBMITTED
                  </p>
                  <p className='text-sm text-foreground'>
                    {format(new Date(data.created_at), 'MMMM d, yyyy · h:mm a')}
                  </p>
                </div>

                {/* Flagged info — shown if is_flagged */}
                {data.is_flagged && (
                  <div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3'>
                    <p className='text-xs font-semibold text-amber-900'>
                      FLAGGED REVIEW
                    </p>
                    <p className='mt-1 text-sm text-amber-800'>
                      <span className='font-medium'>Reason:</span>{' '}
                      {data.flagged_reason}
                    </p>
                    {data.flagged_at && (
                      <p className='mt-0.5 text-xs text-amber-700'>
                        Flagged on{' '}
                        <span className='font-medium'>
                          {format(
                            new Date(data.flagged_at),
                            'MMM d, yyyy · h:mm a'
                          )}
                        </span>{' '}
                        by{' '}
                        <span className='font-medium'>
                          {data.flagged_by || 'System'}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Removed info — shown if status === removed */}
                {data.status === 'removed' && (
                  <div className='mt-3 rounded-lg border border-red-200 bg-red-50 p-3'>
                    <p className='text-sm text-red-800'>
                      This review has been removed and is no longer visible to
                      users.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions — conditional based on status */}
            {data.status === 'visible' && (
              <Button
                variant='outline'
                onClick={() => setShowFlagDialog(true)}
                disabled={isSubmitting}
                className='border-amber-400 text-amber-700 hover:bg-amber-50'
              >
                <Flag className='h-4 w-4' />
                Flag Review
              </Button>
            )}

            {data.status === 'flagged' && (
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Button
                  variant='destructive'
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className='h-4 w-4' />
                  Remove Review
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowRestoreDialog(true)}
                  disabled={isSubmitting}
                  className='border-border text-muted-foreground hover:bg-muted/50'
                >
                  <RotateCcw className='h-4 w-4' />
                  Restore Review
                </Button>
              </div>
            )}
          </div>
        )}
      </Main>

      {/* Dialogs */}
      {data && (
        <>
          <FlagReviewDialog
            open={showFlagDialog}
            reviewerName={data.reviewer_name}
            isSubmitting={isSubmitting}
            onConfirm={handleFlagConfirm}
            onCancel={() => setShowFlagDialog(false)}
          />
          <RemoveReviewDialog
            open={showRemoveDialog}
            reviewerName={data.reviewer_name}
            isSubmitting={isSubmitting}
            onConfirm={handleRemoveConfirm}
            onCancel={() => setShowRemoveDialog(false)}
          />
          <RestoreReviewDialog
            open={showRestoreDialog}
            reviewerName={data.reviewer_name}
            isSubmitting={isSubmitting}
            onConfirm={handleRestoreConfirm}
            onCancel={() => setShowRestoreDialog(false)}
          />
        </>
      )}
    </>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <Card className='rounded-2xl border-border bg-card'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-5 w-20 rounded-full' />
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-4 w-full max-w-xs' />
        ))}
      </CardContent>
    </Card>
  )
}
