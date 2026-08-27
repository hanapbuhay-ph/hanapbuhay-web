import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  AlertTriangle,
  InboxIcon,
  RefreshCw,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useReviews } from './hooks/use-reviews'
import { ReviewStatusBadge } from './components/review-status-badge'
import { StarRating } from './components/star-rating'
import { type ReviewStatusFilter } from './types'

// ── Page ──────────────────────────────────────────────────────────────────────

export function ReviewsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('flagged')
  const { data, isLoading, error, refetch } = useReviews(statusFilter)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Ratings & Reviews
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage and moderate user reviews and ratings.
          </p>
        </div>

        {/* Status filter tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ReviewStatusFilter)}
          className='mb-6'
        >
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='visible'>Visible</TabsTrigger>
            <TabsTrigger value='flagged'>Flagged</TabsTrigger>
            <TabsTrigger value='removed'>Removed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        <div
          className='overflow-x-auto rounded-2xl border border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <Table className='min-w-[800px]'>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>
                  Booking Code
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Reviewer
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Worker
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Rating
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Comment
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Status
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
              {/* Loading skeleton */}
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
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
                      <Skeleton className='h-4 w-32' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-16 rounded-full' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-20' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-7 w-14 rounded-lg' />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Error */}
              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <AlertTriangle className='h-7 w-7 text-destructive' />
                      <p className='text-sm font-semibold text-foreground'>
                        Failed to load reviews
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

              {/* Empty */}
              {!isLoading && !error && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <InboxIcon className='h-7 w-7 text-muted-foreground' />
                      <p className='text-sm font-semibold text-foreground'>
                        No reviews found
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {statusFilter === 'flagged'
                          ? 'No flagged reviews to review.'
                          : 'No reviews in this category.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Rows */}
              {!isLoading &&
                !error &&
                data.map((review) => {
                  const truncated =
                    review.comment.length > 60
                      ? `${review.comment.substring(0, 60)}…`
                      : review.comment

                  return (
                    <TableRow
                      key={review.id}
                      className='cursor-pointer hover:bg-primary/5'
                      onClick={() =>
                        navigate({ to: '/reviews/$id', params: { id: review.id } })
                      }
                    >
                      <TableCell className='ps-4'>
                        <span className='font-mono text-sm font-semibold text-foreground'>
                          {review.booking_code}
                        </span>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {review.reviewer_name}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {review.reviewed_name}
                      </TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} size='sm' showNumeric />
                      </TableCell>
                      <TableCell className='max-w-xs truncate text-sm text-muted-foreground'>
                        {truncated}
                      </TableCell>
                      <TableCell>
                        <ReviewStatusBadge status={review.status} />
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-7 border-border text-xs text-primary hover:bg-primary/5'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate({
                              to: '/reviews/$id',
                              params: { id: review.id },
                            })
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
