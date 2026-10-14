import { useEffect, useState } from 'react'
import { ArrowLeft, Megaphone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { AnnouncementDialog } from './components/announcement-dialog'
import { AnnouncementsTable } from './components/announcements-table'
import { useAnnouncementAction } from './hooks/use-announcement-action'
import { useSettings } from './hooks/use-settings'
import type { Announcement, AnnouncementPayload } from './types'

type AnnouncementFilter = 'all' | 'published' | 'archived' | 'draft'

export function AnnouncementsPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const { isSubmitting, save, archive, remove } = useAnnouncementAction()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined)
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<AnnouncementFilter>('all')

  const active = data?.active_announcement ?? null
  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === 'all') return true
    return announcement.status === filter
  })

  async function loadAnnouncements() {
    setLoadingList(true)
    setListError(null)

    try {
      const response = await api.get<{ data: Announcement[] }>('/admin/settings/announcements')
      setAnnouncements(response.data.data)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load announcements.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    void loadAnnouncements()
  }, []) // eslint-disable-line react-hooks/set-state-in-effect

  async function handleSaveAnnouncement(payload: AnnouncementPayload) {
    const done = async () => {
      setDialogOpen(false)
      setSelectedAnnouncement(undefined)
      await loadAnnouncements()
      void refetch()
    }

    if (selectedAnnouncement) {
      await save(payload, done, selectedAnnouncement.id)
      return
    }

    await save(payload, done)
  }

  async function handleArchive(announcement: Announcement) {
    setArchivingId(announcement.id)
    await archive(announcement.id, async () => {
      setArchivingId(null)
      await loadAnnouncements()
      void refetch()
    })
    setArchivingId(null)
  }

  async function handleDelete(announcement: Announcement) {
    if (!window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(announcement.id)
    await remove(announcement.id, async () => {
      setDeletingId(null)
      await loadAnnouncements()
      void refetch()
    })
    setDeletingId(null)
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
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Announcements
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage platform-wide announcements shown in the notification center.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedAnnouncement(undefined)
              setDialogOpen(true)
            }}
            className='shrink-0 bg-green-600 hover:bg-green-700 text-white'
          >
            <Megaphone size={16} className='mr-1.5' />
            New Announcement
          </Button>
        </div>

        {isLoading && <Skeleton className='h-32 rounded-xl' />}

        {!isLoading && error && (
          <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
            <Button
              variant='link'
              size='sm'
              className='ml-2 h-auto p-0 text-destructive underline'
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {active ? (
              <Card
                className='rounded-2xl border-border bg-card mb-6'
                style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base text-foreground'>
                    Active Announcement
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-1'>
                  <p className='font-medium text-foreground'>{active.title}</p>
                  <p className='text-sm text-muted-foreground'>{active.body}</p>
                  {active.expires_at && (
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Expires:{' '}
                      {format(new Date(active.expires_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className='mb-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-14 text-center'>
                <Megaphone className='h-7 w-7 text-muted-foreground' />
                <p className='text-sm font-medium text-foreground'>
                  No active announcement
                </p>
                <p className='text-xs text-muted-foreground'>
                  Create one to display it to all users.
                </p>
              </div>
            )}

            <div className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-lg font-semibold text-foreground'>Announcement History</h2>
                <div className='flex flex-wrap items-center gap-2'>
                  {(['all', 'published', 'archived', 'draft'] as AnnouncementFilter[]).map((option) => {
                    const isActive = filter === option
                    const label =
                      option === 'all'
                        ? 'All'
                        : option.charAt(0).toUpperCase() + option.slice(1)

                    return (
                      <Button
                        key={option}
                        type='button'
                        size='sm'
                        variant={isActive ? 'default' : 'outline'}
                        className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => setFilter(option)}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </div>
              <AnnouncementsTable
                data={filteredAnnouncements}
                isLoading={loadingList}
                error={listError}
                archivingId={archivingId}
                deletingId={deletingId}
                onEdit={(announcement) => {
                  setSelectedAnnouncement(announcement)
                  setDialogOpen(true)
                }}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRetry={loadAnnouncements}
              />
            </div>
          </>
        )}
      </Main>

      <AnnouncementDialog
        open={dialogOpen}
        announcement={selectedAnnouncement}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setSelectedAnnouncement(undefined)
          }
        }}
        onConfirm={handleSaveAnnouncement}
      />
    </>
  )
}
