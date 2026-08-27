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
import { type Report, REASON_LABELS } from '../types'
import { ReportStatusBadge } from './report-status-badge'

interface ReportsTableProps {
  data: Report[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
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
            <Skeleton className='h-4 w-28' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-20 rounded-full' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function ReportsTable({
  data,
  isLoading,
  error,
  onRetry,
}: ReportsTableProps) {
  const navigate = useNavigate()

  return (
    <div
      className='overflow-x-auto rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <Table className='min-w-[640px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>
              Booking Code
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Reported By
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Reported User
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Reason
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Status
            </TableHead>
            <TableHead className='font-semibold text-foreground'>Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={6}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load reports
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

          {!isLoading && !error && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>
                    No reports found
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Try changing the filter.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !error &&
            data.map((r) => (
              <TableRow
                key={r.id}
                className='cursor-pointer hover:bg-primary/5'
                onClick={() =>
                  navigate({ to: '/reports/$id', params: { id: r.id } })
                }
              >
                <TableCell className='ps-4 font-mono text-sm font-medium text-foreground'>
                  {r.booking_code}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {r.reported_by}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {r.reported_user}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {REASON_LABELS[r.reason] ?? r.reason}
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={r.status} />
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(r.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
