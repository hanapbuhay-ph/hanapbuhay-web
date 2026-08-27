// When the real API is ready, template body changes are sent to
// /api/admin/notification-templates/:id. The mobile app reads active templates
// to generate push/email/sms notifications. Deactivating a template suppresses
// that notification type platform-wide.
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type NotificationTemplate, type NotificationTemplatePayload } from '../types'

interface UseNotificationTemplateActionResult {
  isSubmitting: boolean
  edit: (
    id: number,
    payload: NotificationTemplatePayload,
    onSuccess: (updated: NotificationTemplate) => void
  ) => Promise<void>
  toggle: (
    current: NotificationTemplate,
    onSuccess: (updated: NotificationTemplate) => void
  ) => Promise<void>
}

export function useNotificationTemplateAction(): UseNotificationTemplateActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function edit(
    id: number,
    payload: NotificationTemplatePayload,
    onSuccess: (updated: NotificationTemplate) => void
  ) {
    setIsSubmitting(true)
    try {
      // Read-then-merge to preserve read-only fields (key, variables, etc.)
      const current = await api.get<NotificationTemplate>(
        `/notification_templates/${id}`
      )
      const merged = { ...current.data, ...payload }
      const res = await api.put<NotificationTemplate>(
        `/notification_templates/${id}`,
        merged
      )
      toast.success('Notification template updated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update template.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggle(
    current: NotificationTemplate,
    onSuccess: (updated: NotificationTemplate) => void
  ) {
    const newValue = !current.is_active
    try {
      const res = await api.patch<NotificationTemplate>(
        `/notification_templates/${current.id}`,
        {
          is_active: newValue,
          last_updated_at: new Date().toISOString(),
        }
      )
      toast.success(newValue ? 'Template activated.' : 'Template deactivated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update status.'
      )
    }
  }

  return { isSubmitting, edit, toggle }
}
