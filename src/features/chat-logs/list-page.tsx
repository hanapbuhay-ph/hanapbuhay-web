import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  InboxIcon,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useChatLogs } from './hooks/use-chat-logs'
import { type Conversation } from './types'

// ── Page ──────────────────────────────────────────────────────────────────────

export function ChatLogsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const { data, pagination, isLoading, error, refetch } = useChatLogs(
    page,
    debouncedSearch
  )

  function openConversation(log: Conversation) {
    void navigate({
      to: '/chat-logs/$id',
      params: { id: log.conversation_id },
      search: { from: '/chat-logs' },
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
        {pagination && pagination.last_page > 1 && (
          <div className='mb-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>
              Page {pagination.current_page} of {pagination.last_page} (
              {pagination.total} conversations)
            </span>
            <div className='flex gap-1'>
              <Button
                variant='outline'
                size='icon'
                title='Previous page'
                aria-label='Previous page'
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(pagination.current_page - 1)}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                title='Next page'
                aria-label='Next page'
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage(pagination.current_page + 1)}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Header>

      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Chat Logs
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Browse message histories grouped by the client and worker
            communicating, across their bookings.
          </p>
        </div>

        <div className='relative mb-4 w-full sm:max-w-xs'>
          <Search className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
          <Input
            value={search}
            placeholder='Search client or worker'
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className='border-border pl-9'
          />
        </div>

        {/* Table */}
        <div
          className='overflow-x-auto rounded-2xl border border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <Table className='min-w-[850px]'>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>
                  Client
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Worker
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Latest Message
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Messages
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Bookings
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
                        Conversations will appear here once a client and worker
                        exchange messages.
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
                    key={log.conversation_id}
                    className='cursor-pointer hover:bg-primary/5'
                    onClick={() => openConversation(log)}
                  >
                    <TableCell className='ps-4'>
                      <span className='text-sm font-medium text-foreground'>
                        {log.client.name}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {log.worker.name}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {log.last_message ? (
                        <>
                          <span className='block max-w-xs truncate'>
                            {log.last_message}
                          </span>
                          <span className='text-xs'>
                            {log.last_message_at
                              ? format(
                                  new Date(log.last_message_at),
                                  'MMM d, yyyy h:mm a'
                                )
                              : '—'}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {log.messages_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {log.bookings_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-7 border-border text-xs text-primary hover:bg-primary/5'
                        onClick={(e) => {
                          e.stopPropagation()
                          openConversation(log)
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
