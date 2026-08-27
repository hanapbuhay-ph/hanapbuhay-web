import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useNotificationTemplates } from './hooks/use-notification-templates'
import { useNotificationTemplateAction } from './hooks/use-notification-template-action'
import { NotificationTemplatesTable } from './components/notification-templates-table'
import { NotificationTemplateDialog } from './components/notification-template-dialog'
import {
  type NotificationTemplate,
  type NotificationTemplatePayload,
} from './types'

export function NotificationTemplatesPage() {
  const { data, isLoading, error, refetch } = useNotificationTemplates()
  const { isSubmitting, edit, toggle } = useNotificationTemplateAction()

  // Dialog state — always editing (no add flow)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationTemplate | null>(null)

  // Per-row toggle loading
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Optimistic local overrides so rows update instantly
  const [localOverrides, setLocalOverrides] = useState<
    Map<number, NotificationTemplate>
  >(new Map())

  const displayed = data.map((t) => localOverrides.get(t.id) ?? t)

  function openEdit(template: NotificationTemplate) {
    setEditing(template)
    setDialogOpen(true)
  }

  function handleConfirm(payload: NotificationTemplatePayload) {
    if (!editing) return
    edit(editing.id, payload, (updated) => {
      setLocalOverrides((m) => new Map(m).set(updated.id, updated))
      setDialogOpen(false)
    })
  }

  function handleToggle(template: NotificationTemplate) {
    setTogglingId(template.id)
    toggle(template, (updated) => {
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
            Notification Templates
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Edit the content of system notifications sent to users. Templates
            are system-defined — only content and active status can be changed.
          </p>
        </div>

        <NotificationTemplatesTable
          data={displayed}
          isLoading={isLoading}
          error={error}
          togglingId={togglingId}
          onEdit={openEdit}
          onToggle={handleToggle}
          onRetry={refetch}
        />
      </Main>

      {/* Edit dialog — only rendered when a template is selected */}
      {editing && (
        <NotificationTemplateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          template={editing}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
