import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  InboxIcon,
  RefreshCw,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useChatLog } from './hooks/use-chat-log'
import { type ChatMessage } from './types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatLogDetailPageProps {
  clientId: number
  workerId: number
}

// The ?from= query param carries the referring path so the back button
// returns to the correct report detail page.
interface SearchParams {
  from?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ChatLogDetailPage({
  clientId,
  workerId,
}: ChatLogDetailPageProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const search = useSearch({ strict: false }) as SearchParams
  const { data, conversation, pagination, isLoading, error, refetch } =
    useChatLog(clientId, workerId, page)

  function handleBack() {
    if (search.from) {
      void navigate({ to: search.from as '/' })
    } else {
      void navigate({ to: '/chat-logs' })
    }
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back + title */}
        <div className='mb-6 flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleBack}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              {isLoading
                ? 'Chat Conversation'
                : conversation
                  ? `${conversation.client.name} and ${conversation.worker.name}`
                  : 'Chat Conversation'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Message activity metadata across{' '}
              {conversation?.bookings_count ?? 'their'} booking(s). Message
              content and attachments are not available in the admin panel.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <ChatSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
            <p className='text-sm font-semibold text-foreground'>
              Failed to load chat log
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
        )}

        {/* Empty — conversation found but no message metadata */}
        {!isLoading && !error && !data && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <InboxIcon className='h-8 w-8 text-muted-foreground' />
            <p className='text-sm font-semibold text-foreground'>
              No message activity found for this conversation.
            </p>
            <p className='text-xs text-muted-foreground'>
              The conversation may not have started yet, or it has not been
              synced.
            </p>
          </div>
        )}

        {/* Metadata-only activity view */}
        {!isLoading && !error && data && (
          <div className='flex flex-col gap-4'>
            {/* Participants legend */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pt-4 pb-2'>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-4 pb-4'>
                {(() => {
                  const participants = [
                    {
                      name: conversation?.client.name ?? 'Client',
                      label: 'Client',
                    },
                    {
                      name: conversation?.worker.name ?? 'Worker',
                      label: 'Worker',
                    },
                  ]
                  return participants.map(({ name, label }, idx) => (
                    <div key={idx} className='flex items-center gap-2'>
                      <Avatar className='h-9 w-9'>
                        <AvatarImage
                          src={
                            (idx === 0
                              ? conversation?.client.profile_photo_url
                              : conversation?.worker.profile_photo_url) ??
                            undefined
                          }
                          alt={`${name} profile`}
                        />
                        <AvatarFallback className='bg-primary/10 text-xs text-primary'>
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm text-muted-foreground'>
                        <span className='font-medium text-foreground'>
                          {name}
                        </span>{' '}
                        — {label}
                      </span>
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
            {pagination && pagination.last_page > 1 && (
              <div className='flex items-center justify-between text-sm text-muted-foreground'>
                <span>
                  Page {pagination.current_page} of {pagination.last_page}
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

            {/* Message metadata */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardContent className='flex flex-col gap-1 p-4'>
                {data.length === 0 ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>
                    No messages in this conversation.
                  </p>
                ) : (
                  <MessageTimeline messages={data} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}

// ── Metadata timeline with date separators ───────────────────────────────────

function MessageTimeline({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1]
        const showDateSeparator =
          !prev ||
          !isSameDay(new Date(prev.created_at), new Date(msg.created_at))

        return (
          <div key={msg.id}>
            {showDateSeparator && (
              <DateSeparator date={new Date(msg.created_at)} />
            )}
            <MessageActivity message={msg} />
          </div>
        )
      })}
    </>
  )
}

// ── Date separator ────────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className='my-4 flex items-center gap-3'>
      <div className='h-px flex-1 bg-border' />
      <span className='text-xs font-medium text-muted-foreground'>
        {format(date, 'MMMM d, yyyy')}
      </span>
      <div className='h-px flex-1 bg-border' />
    </div>
  )
}

// ── Single message metadata row ───────────────────────────────────────────────

function MessageActivity({ message }: { message: ChatMessage }) {
  return (
    <div className='mb-2 flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-2'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium text-foreground'>
          {message.sender_role === 'worker' ? 'Worker' : 'Client'} sent a
          message
        </p>
        <p className='text-xs text-muted-foreground'>
          {message.booking_code ? `Booking ${message.booking_code} · ` : ''}
          {message.has_attachment ? 'Attachment included · ' : ''}
          {message.is_read ? 'Read' : 'Unread'}
        </p>
      </div>
      <span className='shrink-0 text-xs text-muted-foreground'>
        {format(new Date(message.created_at), 'h:mm a')}
      </span>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ChatSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader className='pt-4 pb-2'>
          <Skeleton className='h-4 w-24' />
        </CardHeader>
        <CardContent className='flex gap-6 pb-4'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-32' />
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-border bg-card'>
        <CardContent className='flex flex-col gap-4 p-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-40' />
              </div>
              <Skeleton className='h-3 w-16' />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
