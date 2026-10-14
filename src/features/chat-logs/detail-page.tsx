import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
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
              Read-only message history across{' '}
              {conversation?.bookings_count ?? 'their'} booking(s).
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

        {/* Empty — booking found but no chat log record */}
        {!isLoading && !error && !data && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <InboxIcon className='h-8 w-8 text-muted-foreground' />
            <p className='text-sm font-semibold text-foreground'>
              No chat history found for this booking.
            </p>
            <p className='text-xs text-muted-foreground'>
              The conversation may not have started yet, or it has not been
              synced.
            </p>
          </div>
        )}

        {/* Chat view */}
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
                {data.some((m) => m.is_flagged) && (
                  <div className='flex items-center gap-2'>
                    <span className='h-3 w-3 rounded-full bg-amber-400' />
                    <span className='text-sm text-amber-700'>
                      Amber border = flagged by automated moderation
                    </span>
                  </div>
                )}
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

            {/* Message bubbles */}
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
                  <MessageList
                    messages={data}
                    clientId={clientId}
                    clientPhotoUrl={
                      conversation?.client.profile_photo_url ?? null
                    }
                    workerPhotoUrl={
                      conversation?.worker.profile_photo_url ?? null
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* is_flagged note */}
            <p className='text-center text-xs text-muted-foreground'>
              {/* is_flagged messages are flagged by the mobile app's automated
                  moderation. The admin view is read-only — admins cannot
                  flag/unflag messages in this version. */}
              Flagged messages are marked by the mobile app's automated
              moderation. Admin view is read-only.
            </p>
          </div>
        )}
      </Main>
    </>
  )
}

// ── Message list with date separators ────────────────────────────────────────

function MessageList({
  messages,
  clientId,
  clientPhotoUrl,
  workerPhotoUrl,
}: {
  messages: ChatMessage[]
  clientId: number
  clientPhotoUrl: string | null
  workerPhotoUrl: string | null
}) {
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
            <MessageBubble
              message={msg}
              profilePhotoUrl={
                msg.sender_id === clientId ? clientPhotoUrl : workerPhotoUrl
              }
            />
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

// ── Single message bubble ─────────────────────────────────────────────────────

function MessageBubble({
  message,
  profilePhotoUrl,
}: {
  message: ChatMessage
  profilePhotoUrl: string | null
}) {
  const isWorker = message.sender_role === 'worker'
  const initials = getInitials(message.sender_name)
  const avatarUrl =
    profilePhotoUrl ?? message.sender_profile_photo_url ?? undefined

  return (
    <div
      className={[
        'mb-2 flex items-end gap-2',
        isWorker ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      {!isWorker && (
        <Avatar className='h-8 w-8 shrink-0'>
          <AvatarImage src={avatarUrl} alt={`${message.sender_name} profile`} />
          <AvatarFallback className='bg-primary/10 text-xs text-primary'>
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={[
          'flex max-w-[75%] flex-col',
          isWorker ? 'items-end' : 'items-start',
        ].join(' ')}
      >
        <span className='mb-1 px-1 text-[11px] font-semibold text-muted-foreground'>
          {message.sender_name}
          {message.booking_code ? ` · ${message.booking_code}` : ''}
        </span>
        <div
          className={[
            'relative rounded-2xl px-3.5 py-2.5',
            isWorker
              ? 'rounded-br-sm bg-primary text-white'
              : 'rounded-bl-sm bg-muted text-foreground',
            message.is_flagged
              ? isWorker
                ? 'border-l-4 border-amber-400 bg-primary/80'
                : 'border-l-4 border-amber-400 bg-amber-50'
              : '',
          ].join(' ')}
        >
          <p className='text-sm leading-relaxed'>{message.content}</p>
          {message.attachment_url && (
            <a
              href={message.attachment_url}
              target='_blank'
              rel='noreferrer'
              className='mt-2 block text-xs underline'
            >
              View attachment
            </a>
          )}
          <div
            className={[
              'mt-1 flex items-center gap-2',
              isWorker ? 'justify-end' : 'justify-start',
            ].join(' ')}
          >
            <span
              className={[
                'text-[10px]',
                isWorker ? 'text-white/70' : 'text-muted-foreground',
              ].join(' ')}
            >
              {format(new Date(message.created_at), 'h:mm a')}
            </span>
            {message.is_flagged && (
              <span className='inline-flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700'>
                <Flag className='h-2.5 w-2.5' />
                Flagged
              </span>
            )}
          </div>
        </div>
      </div>
      {isWorker && (
        <Avatar className='h-8 w-8 shrink-0'>
          <AvatarImage src={avatarUrl} alt={`${message.sender_name} profile`} />
          <AvatarFallback className='bg-primary/10 text-xs text-primary'>
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
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
          {/* Simulate alternating left/right bubbles */}
          {[false, true, false, true, false].map((right, i) => (
            <div
              key={i}
              className={[
                'flex flex-col',
                right ? 'items-end' : 'items-start',
              ].join(' ')}
            >
              <Skeleton className='mb-1 h-3 w-20' />
              <Skeleton
                className={['h-10 rounded-2xl', right ? 'w-48' : 'w-56'].join(
                  ' '
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
