import { format } from 'date-fns'
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
import { type AuditLog, ACTION_LABELS } from '../types'

interface AuditLogsTableProps {
  data: AuditLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

// ── Details renderer ──────────────────────────────────────────────────────────
// Renders the details object generically — shows "value" if one key,
// otherwise "key: value" pairs joined with ·

function renderDetails(details: AuditLog['details']): string {
  const entries = Object.entries(details)
  if (entries.length === 0) return '—'
  if (entries.length === 1) return String(entries[0][1])
  return entries.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableRow key={i} className='hover:bg-transparent'>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-44' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-32' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-40' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-28' />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AuditLogsTable({
  data,
  isLoading,
  error,
  onRetry,
}: AuditLogsTableProps) {
  return (
    <div
      className='overflow-x-auto rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <Table className='min-w-[640px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>
              Admin
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Action
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Target
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Details
            </TableHead>
            <TableHead className='font-semibold text-foreground'>Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Loading */}
          {isLoading && <TableSkeleton />}

          {/* Error */}
          {!isLoading && error && (
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load audit logs
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
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>
                    No audit logs found
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Try changing the filter.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Rows — read-only, no cursor-pointer, no hover highlight */}
          {!isLoading &&
            !error &&
            data.map((log) => (
              <TableRow key={log.id} className='hover:bg-transparent'>
                <TableCell className='ps-4 font-medium text-foreground'>
                  {log.admin_name}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] ??
                    log.action}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {log.target_type} #{log.target_id}
                </TableCell>
                <TableCell className='max-w-xs truncate text-muted-foreground'>
                  {renderDetails(log.details)}
                </TableCell>
                <TableCell className='whitespace-nowrap text-muted-foreground'>
                  {format(new Date(log.created_at), 'MMM d, yyyy · h:mm a')}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
