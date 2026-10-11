import { AlertTriangle, ArrowRight, InboxIcon, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { type User } from '@/features/users/types'

interface WorkersTableProps {
  data: User[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onSelect: (worker: User) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function WorkersTable({
  data,
  isLoading,
  error,
  onRetry,
  onSelect,
}: WorkersTableProps) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-border bg-card' style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}>
      <Table className='min-w-[640px]'>
        <TableHeader>
          <TableRow className='bg-background hover:bg-background'>
            <TableHead className='ps-4 font-semibold text-foreground'>Worker</TableHead>
            <TableHead className='font-semibold text-foreground'>Email</TableHead>
            <TableHead className='font-semibold text-foreground'>Barangay</TableHead>
            <TableHead className='font-semibold text-foreground'>Status</TableHead>
            <TableHead className='font-semibold text-foreground'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className='h-8 w-40' /></TableCell>
              <TableCell><Skeleton className='h-4 w-48' /></TableCell>
              <TableCell><Skeleton className='h-4 w-24' /></TableCell>
              <TableCell><Skeleton className='h-5 w-16 rounded-full' /></TableCell>
              <TableCell><Skeleton className='h-8 w-8' /></TableCell>
            </TableRow>
          ))}
          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <AlertTriangle className='h-7 w-7 text-destructive' />
                  <p className='text-sm font-semibold text-foreground'>Failed to load workers</p>
                  <p className='text-xs text-muted-foreground'>{error}</p>
                  <Button size='sm' variant='outline' onClick={onRetry}>
                    <RefreshCw className='h-3.5 w-3.5' /> Retry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !error && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className='flex flex-col items-center gap-2 py-10 text-center'>
                  <InboxIcon className='h-7 w-7 text-muted-foreground' />
                  <p className='text-sm font-semibold text-foreground'>No workers found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !error && data.map((worker) => (
            <TableRow
              key={worker.id}
              className={worker.worker_profile_id ? 'cursor-pointer hover:bg-primary/5' : 'cursor-not-allowed opacity-60'}
              onClick={() => {
                if (worker.worker_profile_id) onSelect(worker)
              }}
            >
              <TableCell className='ps-4 font-medium text-foreground'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={worker.profile_photo_url ?? undefined} alt={`${worker.name} profile`} />
                    <AvatarFallback className='bg-primary/10 text-xs text-primary'>
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>
                  {worker.name}
                </div>
              </TableCell>
              <TableCell className='text-muted-foreground'>{worker.email}</TableCell>
              <TableCell className='text-muted-foreground'>{worker.barangay ?? '—'}</TableCell>
              <TableCell>
                <span className={[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  worker.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                ].join(' ')}>
                  {worker.is_active ? 'Active' : 'Suspended'}
                </span>
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='icon'
                  disabled={!worker.worker_profile_id}
                  aria-label={`View ${worker.name}'s job posts`}
                >
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
