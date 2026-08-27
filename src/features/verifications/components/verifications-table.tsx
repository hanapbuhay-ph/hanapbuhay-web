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
import { type Verification } from '../types'
import { StatusBadge } from './status-badge'

// ── Types ─────────────────────────────────────────────────────────────────────

interface VerificationsTableProps {
  data: Verification[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
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
          <TableCell>
            <Skeleton className='h-4 w-16' />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function VerificationsTable({
  data,
  isLoading,
  error,
  onRetry,
}: VerificationsTableProps) {
  const navigate = useNavigate()

  return (
    <div
      className='overflow-x-auto rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <Table className='min-w-[560px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>
              Worker Name
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Barangay
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Submitted
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Status
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Loading */}
          {isLoading && <TableSkeleton />}

          {/* Error */}
          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load verifications
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
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>
                    No verifications found
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Try changing the filter or check back later.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Data rows */}
          {!isLoading &&
            !error &&
            data.map((v) => (
              <TableRow
                key={v.id}
                className='cursor-pointer hover:bg-primary/5'
                onClick={() =>
                  navigate({
                    to: '/verifications/$id',
                    params: { id: String(v.id) },
                  })
                }
              >
                <TableCell className='ps-4 font-medium text-foreground'>
                  {v.user.name}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {v.user.barangay}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(v.submitted_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={v.verification_status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 text-xs text-primary hover:bg-primary/10'
                    onClick={() =>
                      navigate({
                        to: '/verifications/$id',
                        params: { id: String(v.id) },
                      })
                    }
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
