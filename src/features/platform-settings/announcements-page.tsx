import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAnnouncements } from './hooks/use-announcements'
import { useAnnouncementAction } from './hooks/use-announcement-action'
import { AnnouncementsTable } from './components/announcements-table'
import { AnnouncementDialog } from './components/announcement-dialog'
import { type Announcement, type AnnouncementPayload } from './types'

export function AnnouncementsPage() {
  const { data, isLoading, error, refetch } = useAnnouncements()
  const { isSubmitting, create, edit, archive } = useAnnouncementAction()

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | undefined>(undefined)

  // Archive confirmation dialog
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archivingId, setArchivingId] = useState<number | null>(null)

  // Optimistic local overrides
  const [localOverrides, setLocalOverrides] = useState<
    Map<number, Announcement>
  >(new Map())

  const displayed = data.map((a) => localOverrides.get(a.id) ?? a)

  // ── Handlers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement)
    setDialogOpen(true)
  }

  function openArchiveConfirm(announcement: Announcement) {
    setArchiveTarget(announcement)
    setArchiveDialogOpen(true)
  }

  function handleConfirm(payload: AnnouncementPayload) {
    if (editing) {
      edit(editing.id, payload, (updated) => {
        setLocalOverrides((m) => new Map(m).set(updated.id, updated))
        setDialogOpen(false)
      })
    } else {
      create(payload, (created) => {
        setDialogOpen(false)
        refetch()
      })
    }
  }

  function handleArchiveConfirm() {
    if (!archiveTarget) return
    setArchivingId(archiveTarget.id)
    archive(archiveTarget.id, (updated) => {
      setLocalOverrides((m) => new Map(m).set(updated.id, updated))
      setArchiveDialogOpen(false)
      setArchiveTarget(null)
      setArchivingId(null)
    }).finally(() => {
      setArchivingId(null)
    })
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
        {/* Back link */}
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        {/* Page header */}
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Announcements
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Create and manage platform-wide announcements shown to users in
              the notification center.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className='shrink-0 bg-green-600 hover:bg-green-700 text-white'
          >
            <Plus size={16} className='mr-1.5' />
            New Announcement
          </Button>
        </div>

        <AnnouncementsTable
          data={displayed}
          isLoading={isLoading}
          error={error}
          archivingId={archivingId}
          onEdit={openEdit}
          onArchive={openArchiveConfirm}
          onRetry={refetch}
        />
      </Main>

      {/* Create / Edit dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        announcement={editing}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />

      {/* Archive confirmation dialog */}
      {archiveTarget && (
        <ConfirmDialog
          open={archiveDialogOpen}
          onOpenChange={(open) => {
            setArchiveDialogOpen(open)
            if (!open) setArchiveTarget(null)
          }}
          title='Archive Announcement'
          desc={
            <>
              Are you sure you want to archive{' '}
              <span className='font-medium'>"{archiveTarget.title}"</span>?
              Archived announcements are read-only and will no longer be
              displayed to users.
            </>
          }
          confirmText='Archive'
          isLoading={isSubmitting}
          handleConfirm={handleArchiveConfirm}
        />
      )}
    </>
  )
}
