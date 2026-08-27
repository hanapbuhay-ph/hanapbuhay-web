import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useReportReasons } from './hooks/use-report-reasons'
import { useReportReasonAction } from './hooks/use-report-reason-action'
import { ReportReasonsTable } from './components/report-reasons-table'
import { ReportReasonDialog } from './components/report-reason-dialog'
import { type ReportReason, type ReportReasonPayload } from './types'

export function ReportReasonsPage() {
  const { data, isLoading, error, refetch } = useReportReasons()
  const { isSubmitting, edit, toggle } = useReportReasonAction()

  // Dialog state — always editing (no add flow)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ReportReason | null>(null)

  // Per-row toggle loading
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Optimistic local overrides so rows update instantly
  const [localOverrides, setLocalOverrides] = useState<Map<number, ReportReason>>(new Map())

  const displayed = data.map((r) => localOverrides.get(r.id) ?? r)

  function openEdit(reason: ReportReason) {
    setEditing(reason)
    setDialogOpen(true)
  }

  function handleConfirm(payload: ReportReasonPayload) {
    if (!editing) return
    edit(editing.id, payload, (updated) => {
      setLocalOverrides((m) => new Map(m).set(updated.id, updated))
      setDialogOpen(false)
    })
  }

  function handleToggle(reason: ReportReason) {
    setTogglingId(reason.id)
    toggle(reason, (updated) => {
      setLocalOverrides((m) => new Map(m).set(updated.id, updated))
      setTogglingId(null)
    }).finally(() => setTogglingId(null))
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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Report Reason Categories
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Edit labels, descriptions, and visibility of report reasons.
            Codes are read-only and set by the API contract.
          </p>
        </div>

        <ReportReasonsTable
          data={displayed}
          isLoading={isLoading}
          error={error}
          togglingId={togglingId}
          onEdit={openEdit}
          onToggle={handleToggle}
          onRetry={refetch}
        />
      </Main>

      {/* Edit dialog — only rendered when editing is set */}
      {editing && (
        <ReportReasonDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          reason={editing}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
