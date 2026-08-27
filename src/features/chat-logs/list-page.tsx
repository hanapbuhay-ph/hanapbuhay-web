import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  AlertTriangle,
  InboxIcon,
  MessageSquare,
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
                  Client
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Worker
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Messages
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Latest Message
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Action
                </TableHead>
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
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-7 w-16 rounded-lg' />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Error */}
              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={6}>
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
                  <TableCell colSpan={6}>
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
                data.map((log) => {
                  const lastMsg = log.messages[log.messages.length - 1]
                  const flaggedCount = log.messages.filter(
                    (m) => m.is_flagged
                  ).length

                  return (
                    <TableRow
                      key={log.id}
                      className='cursor-pointer hover:bg-primary/5'
                      onClick={() =>
                        navigate({ to: '/chat-logs/$id', params: { id: log.booking_id } })
                      }
                    >
                      <TableCell className='ps-4'>
                        <span className='font-mono text-sm font-semibold text-foreground'>
                          {log.booking_code}
                        </span>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {log.client_name}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {log.worker_name}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <MessageSquare className='h-3.5 w-3.5 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {log.messages.length}
                          </span>
                          {flaggedCount > 0 && (
                            <span className='ml-1 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700'>
                              {flaggedCount} flagged
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {lastMsg
                          ? format(new Date(lastMsg.sent_at), 'MMM d, yyyy')
                          : '—'}
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
                              params: { id: log.booking_id },
                            })
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
