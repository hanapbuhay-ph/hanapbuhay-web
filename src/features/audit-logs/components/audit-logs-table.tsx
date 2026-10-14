import { format } from 'date-fns'
import { AlertTriangle, InboxIcon, RefreshCw, Trash2 } from 'lucide-react'
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
  canDelete: boolean
  isDeleting: boolean
  onDelete: (log: AuditLog) => void
}

function renderDetails(details: AuditLog['details']): string {
  if (!details) return '—'
  const entries = Object.entries(details)
  if (entries.length === 0) return '—'
  return entries
    .flatMap(([key, value]) => {
      if (
        key === 'changes' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return Object.entries(value).map(([field, change]) => {
          if (
            typeof change === 'object' &&
            change !== null &&
            'from' in change &&
            'to' in change
          ) {
            return `${field.replace(/_/g, ' ')}: ${String(change.from)} → ${String(change.to)}`
          }
          return `${field.replace(/_/g, ' ')}: ${JSON.stringify(change) ?? String(change)}`
        })
      }

      if (typeof value === 'object' && value !== null) {
        return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value) ?? String(value)}`
      }

      return `${key.replace(/_/g, ' ')}: ${String(value)}`
    })
    .join(' · ')
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <TableRow key={index} className='hover:bg-transparent'>
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className='h-4 w-28' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function AuditLogsTable({
  data,
  isLoading,
  error,
  onRetry,
  canDelete,
  isDeleting,
  onDelete,
}: AuditLogsTableProps) {
  return (
    <div
      className='overflow-x-auto rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <Table className='min-w-[1100px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>
              Type
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Actor
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Action
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Outcome
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              IP address
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Target
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Details
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Date
            </TableHead>
            {canDelete && <TableHead className='w-12' aria-label='Actions' />}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={canDelete ? 9 : 8}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load logs
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
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={canDelete ? 9 : 8}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>
                    No logs found
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
            data.map((log) => (
              <TableRow key={log.id} className='hover:bg-transparent'>
                <TableCell className='ps-4 text-muted-foreground'>
                  {log.category === 'security' ? 'Security' : 'Admin activity'}
                </TableCell>
                <TableCell className='max-w-48'>
                  <div className='truncate font-medium text-foreground'>
                    {log.admin.name}
                  </div>
                  {log.admin.email && (
                    <div className='truncate text-xs text-muted-foreground'>
                      {log.admin.email}
                    </div>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')}
                </TableCell>
                <TableCell>
                  {log.outcome ? (
                    <span
                      className={
                        log.outcome === 'success'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-destructive'
                      }
                    >
                      {log.outcome}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className='font-mono text-xs text-muted-foreground'>
                  {log.ip_address ?? '—'}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {log.target_type
                    ? `${log.target_type}${log.target_id ? ` #${log.target_id}` : ''}`
                    : '—'}
                </TableCell>
                <TableCell
                  className='max-w-xs truncate text-muted-foreground'
                  title={[
                    renderDetails(log.details),
                    log.user_agent ? `User agent: ${log.user_agent}` : null,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                >
                  {renderDetails(log.details)}
                </TableCell>
                <TableCell className='whitespace-nowrap text-muted-foreground'>
                  {format(new Date(log.created_at), 'MMM d, yyyy · h:mm a')}
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <Button
                      size='icon'
                      variant='ghost'
                      aria-label={`Delete audit log ${log.id}`}
                      title='Delete log'
                      disabled={isDeleting}
                      onClick={() => onDelete(log)}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
