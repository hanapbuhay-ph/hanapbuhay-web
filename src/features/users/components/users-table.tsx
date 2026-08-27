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
import { type User } from '../types'
import { UserRoleBadge } from './user-role-badge'
import { UserStatusBadge } from './user-status-badge'

interface UsersTableProps {
  data: User[]
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
            <Skeleton className='h-4 w-32' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-40' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-14 rounded-full' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-16 rounded-full' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-12' />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function UsersTable({
  data,
  isLoading,
  error,
  onRetry,
}: UsersTableProps) {
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
              Name
            </TableHead>
            <TableHead className='font-semibold text-foreground'>
              Email
            </TableHead>
            <TableHead className='font-semibold text-foreground'>Role</TableHead>
            <TableHead className='font-semibold text-foreground'>
              Barangay
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
              <TableCell colSpan={6}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>
                    Failed to load users
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
                    No users found
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Try adjusting the filters.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Rows */}
          {!isLoading &&
            !error &&
            data.map((user) => (
              <TableRow
                key={user.id}
                className='cursor-pointer hover:bg-primary/5'
                onClick={() =>
                  navigate({ to: '/users/$id', params: { id: user.id } })
                }
              >
                <TableCell className='ps-4 font-medium text-foreground'>
                  {user.name}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {user.email}
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {user.barangay}
                </TableCell>
                <TableCell>
                  <UserStatusBadge isActive={user.is_active} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 text-xs text-primary hover:bg-primary/10'
                    onClick={() =>
                      navigate({ to: '/users/$id', params: { id: user.id } })
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
