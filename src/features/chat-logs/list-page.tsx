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
import { useChatLogs } from './hooks/use-chat-logs'
import { type Conversation } from './types'

// ── Page ──────────────────────────────────────────────────────────────────────

export function ChatLogsListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useChatLogs()

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
            Chat Logs
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Browse conversation histories between clients and workers.
          </p>
        </div>

        {/* Table */}
        <div
          className='overflow-x-auto rounded-2xl border border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <Table className='min-w-[600px]'>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>
                  Booking Code
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Participant
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Latest Message
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Unread
                </TableHead>
                <TableHead className='font-semibold text-foreground'>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading skeleton */}
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className='ps-4'>
                      <Skeleton className='h-4 w-28' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-28' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-28' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-10' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-7 w-16 rounded-lg' />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Error */}
              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <AlertTriangle className='h-7 w-7 text-destructive' />
                      <p className='text-sm font-semibold text-foreground'>
                        Failed to load chat logs
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
                  <TableCell colSpan={5}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <InboxIcon className='h-7 w-7 text-muted-foreground' />
                      <p className='text-sm font-semibold text-foreground'>
                        No chat logs found
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Chat histories will appear here once bookings are active.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Rows */}
              {!isLoading &&
                !error &&
                data.map((log: Conversation) => (
                    <TableRow
                      key={log.booking_id}
                      className='cursor-pointer hover:bg-primary/5'
                      onClick={() =>
                        navigate({ to: '/chat-logs/$id', params: { id: String(log.booking_id) }, search: { from: '/chat-logs' } })
                      }
                    >
                    <TableCell className='ps-4'>
                      <span className='font-mono text-sm font-semibold text-foreground'>
                        {log.booking_code}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {log.other_party?.name ?? '—'}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {log.last_message
                        ? format(new Date(log.last_message_at ?? log.last_message), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {log.unread_count}
                      </span>
                    </TableCell>
                    <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-7 border-border text-xs text-primary hover:bg-primary/5'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate({
                              to: '/chat-logs/$id',
                              params: { id: String(log.booking_id) },
                              search: { from: '/chat-logs' },
                            })
                          }}
                        >
                          View
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
