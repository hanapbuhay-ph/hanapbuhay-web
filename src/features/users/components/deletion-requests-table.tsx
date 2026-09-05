import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { type DeletionUser } from '../types'
import { UserRoleBadge } from './user-role-badge'
import { useDeletionRequestAction } from '../hooks/use-deletion-request-action'

interface DeletionRequestsTableProps {
  data: DeletionUser[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onProcessed: (userId: number) => void
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className='h-4 w-28' /></TableCell>
          <TableCell><Skeleton className='h-4 w-36' /></TableCell>
          <TableCell><Skeleton className='h-5 w-14 rounded-full' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell><Skeleton className='h-7 w-20' /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function DeletionRequestsTable({
  data,
  isLoading,
  error,
  onRetry,
  onProcessed,
}: DeletionRequestsTableProps) {
  const { isSubmitting, processDeletion } = useDeletionRequestAction()
  const [confirmingUser, setConfirmingUser] = useState<DeletionUser | null>(null)

  return (
    <>
      <div
        className='overflow-x-auto rounded-2xl border border-border bg-card'
        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
      >
        <Table className='min-w-[640px]'>
          <TableHeader>
            <TableRow className='bg-background hover:bg-background'>
              <TableHead className='ps-4 font-semibold text-foreground'>Name</TableHead>
              <TableHead className='font-semibold text-foreground'>Email</TableHead>
              <TableHead className='font-semibold text-foreground'>Role</TableHead>
              <TableHead className='font-semibold text-foreground'>Barangay</TableHead>
              <TableHead className='font-semibold text-foreground'>Requested</TableHead>
              <TableHead className='font-semibold text-foreground'>Actions</TableHead>
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
                <TableCell colSpan={6}>
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <InboxIcon className='h-7 w-7 text-muted-foreground' />
                    <p className='text-sm font-semibold text-foreground'>
                      No deletion requests
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      All caught up — no pending requests.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && data.map((user) => (
              <TableRow key={user.id} className='hover:bg-primary/5'>
                <TableCell className='ps-4 font-medium text-foreground'>
                  {user.name}
                </TableCell>
                <TableCell className='text-muted-foreground'>{user.email}</TableCell>
                <TableCell><UserRoleBadge role={user.role} /></TableCell>
                <TableCell className='text-muted-foreground'>
                  {user.barangay ?? '—'}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(user.deletion_requested_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={isSubmitting}
                    onClick={() => setConfirmingUser(user)}
                    className='h-7 border-destructive text-xs text-destructive hover:bg-destructive/5'
                  >
                    Process Deletion
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!confirmingUser}
        onOpenChange={(o) => { if (!o) setConfirmingUser(null) }}
      >
        <AlertDialogContent className='rounded-2xl border-border bg-card'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-4 w-4' />
              Process Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-1'>
              <span className='block'>
                You are permanently deleting the account of{' '}
                <span className='font-semibold text-foreground'>
                  {confirmingUser?.name}
                </span>.
              </span>
              <span className='block font-medium text-destructive'>
                All personal data will be anonymised. This cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className='border-border'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={() => {
                if (!confirmingUser) return
                void processDeletion(confirmingUser.id, () => {
                  onProcessed(confirmingUser.id)
                  setConfirmingUser(null)
                })
              }}
            >
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              Confirm & Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
