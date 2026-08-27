import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, RefreshCw, InboxIcon, ChevronDown, ChevronUp } from 'lucide-react'
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
import { type DeletionRequest } from '../types'
import { UserRoleBadge } from './user-role-badge'
import { DeletionRequestStatusBadge } from './deletion-request-status-badge'
import { ApproveDeletionDialog } from './approve-deletion-dialog'
import { DenyDeletionDialog } from './deny-deletion-dialog'
import { useDeletionRequestAction } from '../hooks/use-deletion-request-action'

interface DeletionRequestsTableProps {
  data: DeletionRequest[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onUpdated: (updated: DeletionRequest) => void
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className='h-4 w-28' /></TableCell>
          <TableCell><Skeleton className='h-4 w-36' /></TableCell>
          <TableCell><Skeleton className='h-5 w-14 rounded-full' /></TableCell>
          <TableCell><Skeleton className='h-4 w-40' /></TableCell>
          <TableCell><Skeleton className='h-5 w-16 rounded-full' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell><Skeleton className='h-4 w-28' /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Processed row with expandable details ─────────────────────────────────────

function ProcessedRow({ req }: { req: DeletionRequest }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <TableRow
        className='cursor-pointer hover:bg-primary/5'
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className='ps-4 font-medium text-foreground'>
          {req.user_name}
        </TableCell>
        <TableCell className='text-muted-foreground'>{req.user_email}</TableCell>
        <TableCell><UserRoleBadge role={req.user_role} /></TableCell>
        <TableCell className='max-w-[180px] truncate text-muted-foreground'>
          {req.reason}
        </TableCell>
        <TableCell><DeletionRequestStatusBadge status={req.status} /></TableCell>
        <TableCell className='text-muted-foreground'>
          {format(new Date(req.requested_at), 'MMM d, yyyy')}
        </TableCell>
        <TableCell>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1 text-xs text-muted-foreground'
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          >
            {expanded ? <ChevronUp className='h-3 w-3' /> : <ChevronDown className='h-3 w-3' />}
            Details
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className='bg-background'>
          <TableCell colSpan={7} className='ps-4 pb-3 pt-0'>
            <div className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
              {req.processed_at && (
                <span>
                  Processed:{' '}
                  <span className='font-medium text-foreground'>
                    {format(new Date(req.processed_at), 'MMM d, yyyy · h:mm a')}
                  </span>
                </span>
              )}
              {req.admin_remarks && (
                <span>
                  Admin remarks:{' '}
                  <span className='font-medium text-foreground'>
                    {req.admin_remarks}
                  </span>
                </span>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────

export function DeletionRequestsTable({
  data,
  isLoading,
  error,
  onRetry,
  onUpdated,
}: DeletionRequestsTableProps) {
  const { isSubmitting, approveDeletion, denyDeletion } = useDeletionRequestAction()
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [denyingId, setDenyingId] = useState<string | null>(null)

  const activeApprove = data.find((r) => r.id === approvingId) ?? null
  const activeDeny = data.find((r) => r.id === denyingId) ?? null

  return (
    <>
      <div
        className='overflow-x-auto rounded-2xl border border-border bg-card'
        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
      >
        <Table className='min-w-[720px]'>
          <TableHeader>
            <TableRow className='bg-background hover:bg-background'>
              <TableHead className='ps-4 font-semibold text-foreground'>Name</TableHead>
              <TableHead className='font-semibold text-foreground'>Email</TableHead>
              <TableHead className='font-semibold text-foreground'>Role</TableHead>
              <TableHead className='font-semibold text-foreground'>Reason</TableHead>
              <TableHead className='font-semibold text-foreground'>Status</TableHead>
              <TableHead className='font-semibold text-foreground'>Requested</TableHead>
              <TableHead className='font-semibold text-foreground'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && <TableSkeleton />}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <AlertTriangle className='h-7 w-7 text-destructive' />
                    <p className='text-sm font-semibold text-foreground'>
                      Failed to load deletion requests
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
                <TableCell colSpan={7}>
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <InboxIcon className='h-7 w-7 text-muted-foreground' />
                    <p className='text-sm font-semibold text-foreground'>
                      No deletion requests
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      All caught up — no requests to process.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              data.map((req) => {
                if (req.status !== 'pending') {
                  return <ProcessedRow key={req.id} req={req} />
                }
                return (
                  <TableRow key={req.id} className='hover:bg-primary/5'>
                    <TableCell className='ps-4 font-medium text-foreground'>
                      {req.user_name}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {req.user_email}
                    </TableCell>
                    <TableCell><UserRoleBadge role={req.user_role} /></TableCell>
                    <TableCell className='max-w-[180px] truncate text-muted-foreground'>
                      {req.reason}
                    </TableCell>
                    <TableCell>
                      <DeletionRequestStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {format(new Date(req.requested_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={isSubmitting}
                          onClick={() => setApprovingId(req.id)}
                          className='h-7 border-destructive text-xs text-destructive hover:bg-destructive/5'
                        >
                          Approve
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={isSubmitting}
                          onClick={() => setDenyingId(req.id)}
                          className='h-7 border-border text-xs text-muted-foreground hover:bg-muted/50'
                        >
                          Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {activeApprove && (
        <ApproveDeletionDialog
          open={!!approvingId}
          userName={activeApprove.user_name}
          isSubmitting={isSubmitting}
          onConfirm={(remarks) =>
            approveDeletion(activeApprove.id, remarks, (updated) => {
              onUpdated(updated)
              setApprovingId(null)
            })
          }
          onCancel={() => setApprovingId(null)}
        />
      )}
      {activeDeny && (
        <DenyDeletionDialog
          open={!!denyingId}
          userName={activeDeny.user_name}
          isSubmitting={isSubmitting}
          onConfirm={(remarks) =>
            denyDeletion(activeDeny.id, remarks, (updated) => {
              onUpdated(updated)
              setDenyingId(null)
            })
          }
          onCancel={() => setDenyingId(null)}
        />
      )}
    </>
  )
}
