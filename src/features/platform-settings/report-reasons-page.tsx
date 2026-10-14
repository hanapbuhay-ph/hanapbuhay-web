import { useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useReportReasonAction } from './hooks/use-report-reason-action'
import { ReportReasonDialog } from './components/report-reason-dialog'
import { ReportReasonsTable } from './components/report-reasons-table'
import { type ReportReason, type ReportReasonPayload } from './types'

export function ReportReasonsPage() {
  const { isSubmitting, add, update, toggle, remove } = useReportReasonAction()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<ReportReason | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [reasons, setReasons] = useState<ReportReason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [audience, setAudience] = useState<'client' | 'worker'>('client')

  function loadReasons() {
    setIsLoading(true)
    setError(null)

    api
      .get<{ success: boolean; data: ReportReason[] }>(`/admin/settings/report-reasons?audience=${audience}`)
      .then((res) => {
        setReasons(res.data.data ?? [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load report reasons.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadReasons() // eslint-disable-line react-hooks/set-state-in-effect
  }, [audience])

  function resetDialog() {
    setDialogOpen(false)
    setEditingReason(null)
  }

  function openAddDialog() {
    resetDialog()
    setDialogOpen(true)
  }

  function openEditDialog(reason: ReportReason) {
    setEditingReason(reason)
    setDialogOpen(true)
  }

  function handleSave(payload: ReportReasonPayload) {
    if (editingReason?.id === undefined) {
      add(payload, () => {
        resetDialog()
        refetch()
      })
      return
    }

    update(editingReason.id, payload, () => {
      resetDialog()
      loadReasons()
    })
  }

  function handleToggle(reason: ReportReason) {
    if (reason.id === undefined) return
    setTogglingId(reason.id)
    toggle(reason.id, !(reason.is_active ?? true), () => {
      setTogglingId(null)
      loadReasons()
    })
  }

  function handleDelete(reason: ReportReason) {
    if (reason.id === undefined) return
    remove(reason.id, () => {
      loadReasons()
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
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Report Reason Categories
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage the predefined reasons users can select when filing a report.
            </p>
            <div className='mt-4 flex gap-2'>
              <Button variant={audience === 'client' ? 'default' : 'outline'} onClick={() => setAudience('client')}>Client Reports</Button>
              <Button variant={audience === 'worker' ? 'default' : 'outline'} onClick={() => setAudience('worker')}>Worker Reports</Button>
            </div>
          </div>

          <Button
            onClick={openAddDialog}
            className='shrink-0 bg-green-600 text-white hover:bg-green-700'
          >
            <Plus size={16} className='mr-1.5' />
            Add Reason
          </Button>
        </div>

        <ReportReasonsTable
          data={reasons}
          isLoading={isLoading}
          error={error}
          togglingId={togglingId}
          onEdit={openEditDialog}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onRetry={loadReasons}
        />
      </Main>

      {editingReason ? (
        <ReportReasonDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) resetDialog()
            else setDialogOpen(true)
          }}
          reason={editingReason}
          isSubmitting={isSubmitting}
          onConfirm={handleSave}
        />
      ) : (
        <ReportReasonDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) resetDialog()
            else setDialogOpen(true)
          }}
          reason={{
            code: '',
            label: '',
            description: '',
            is_active: true,
            audience,
          }}
          isSubmitting={isSubmitting}
          onConfirm={handleSave}
        />
      )}
    </>
  )
}
