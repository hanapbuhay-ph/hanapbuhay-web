import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, RefreshCw, InboxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Booking } from '../types'
import { BookingStatusBadge } from './booking-status-badge'

interface BookingsTableProps {
  data: Booking[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className='h-4 w-28' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-32' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-32' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-28' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-16 rounded-full' />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function BookingsTable({
  data,
  isLoading,
  error,
  onRetry,
}: BookingsTableProps) {
  const navigate = useNavigate()

  return (
    <div
      className='overflow-x-auto rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <Table className='min-w-[680px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>
              Booking Code
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Client
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Worker
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Service
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Scheduled
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Loading */}
          {isLoading && <TableSkeleton />}

          {/* Error */}
          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={6}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load bookings
                  </p>
                  <p className='text-xs text-muted-foreground'>{error}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={onRetry}
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
              <TableCell colSpan={6}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>
                    No bookings found
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Try changing the filter.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Rows — read-only, no action buttons */}
          {!isLoading &&
            !error &&
            data.map((b) => (
              <TableRow
                key={b.id}
                className='cursor-pointer hover:bg-primary/5'
                onClick={() =>
                  navigate({ to: '/bookings/$id', params: { id: b.id } })
                }
              >
                <TableCell className='ps-4 font-mono text-sm font-medium text-foreground'>
                  {b.booking_code}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {b.client}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {b.worker}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {b.service_category}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(b.scheduled_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={b.status} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
