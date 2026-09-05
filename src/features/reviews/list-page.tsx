import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, InboxIcon, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from './components/star-rating'
import { useReviews } from './hooks/use-reviews'
import { useReviewAction } from './hooks/use-review-action'
import { type Review, type ScoreFilter, type DirectionFilter } from './types'

export function ReviewsListPage() {
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all')
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all')
  const { data, isLoading, error, refetch } = useReviews(scoreFilter, directionFilter)
  const { isSubmitting, removeRating } = useReviewAction()

  const [targetReview, setTargetReview] = useState<Review | null>(null)
  const [removeReason, setRemoveReason] = useState('')

  function handleRemoveConfirm() {
    if (!targetReview) return
    removeRating(targetReview.id, removeReason, () => {
      setTargetReview(null)
      setRemoveReason('')
      refetch()
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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Ratings & Reviews
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage and moderate user reviews and ratings.
          </p>
        </div>

        {/* Filters */}
        <div className='mb-4 flex flex-wrap gap-3'>
          <Select
            value={String(scoreFilter)}
            onValueChange={(v) =>
              setScoreFilter(v === 'all' ? 'all' : (Number(v) as ScoreFilter))
            }
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='All scores' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All scores</SelectItem>
              {[1, 2, 3, 4, 5].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} star{s !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={directionFilter}
            onValueChange={(v) => setDirectionFilter(v as DirectionFilter)}
          >
            <SelectTrigger className='w-44'>
              <SelectValue placeholder='All directions' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All directions</SelectItem>
              <SelectItem value='client_to_worker'>Client → Worker</SelectItem>
              <SelectItem value='worker_to_client'>Worker → Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div
          className='overflow-x-auto rounded-2xl border border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <Table className='min-w-[700px]'>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>
                  Booking Code
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Rated By
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Rated User
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Rating
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Comment
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Date
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className='ps-4'>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-16' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-40' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-20' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-7 w-16 rounded-lg' />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <AlertTriangle className='h-7 w-7 text-destructive' />
                      <p className='text-sm font-semibold text-foreground'>
                        Failed to load ratings
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
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <InboxIcon className='h-7 w-7 text-muted-foreground' />
                      <p className='text-sm font-semibold text-foreground'>
                        No ratings found
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Try adjusting the filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !error &&
                data.map((review) => (
                  <TableRow key={review.id} className='hover:bg-primary/5'>
                    <TableCell className='ps-4 font-mono text-sm font-medium text-foreground'>
                      {review.booking_code}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {review.rated_by_name}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {review.rated_user_name}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.score} size='sm' showNumeric />
                    </TableCell>
                    <TableCell className='max-w-xs truncate text-sm text-muted-foreground'>
                      {review.comment
                        ? review.comment.length > 60
                          ? `${review.comment.substring(0, 60)}…`
                          : review.comment
                        : <span className='italic'>No comment</span>}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-7 border-destructive/40 text-xs text-destructive hover:bg-destructive/5'
                        onClick={() => {
                          setTargetReview(review)
                          setRemoveReason('')
                        }}
                      >
                        <Trash2 className='h-3 w-3' />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Main>

      {/* Remove confirm dialog */}
      <AlertDialog
        open={!!targetReview}
        onOpenChange={(open) => { if (!open) setTargetReview(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Review</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review by{' '}
              <span className='font-medium text-foreground'>
                {targetReview?.rated_by_name}
              </span>{' '}
              and recalculate the worker's average rating. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder='Reason for removal (required)'
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            className='mt-2 min-h-[80px]'
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting || !removeReason.trim()}
              onClick={handleRemoveConfirm}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {isSubmitting ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
