import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface AnnouncementPayload {
  title: string
  body: string
  status?: 'draft' | 'published' | 'archived'
  target_audience?: 'all' | 'clients' | 'workers'
  expires_at: string | null
}

interface UseAnnouncementActionResult {
  isSubmitting: boolean
  post: (payload: AnnouncementPayload, onSuccess: () => void) => Promise<void>
  save: (payload: AnnouncementPayload, onSuccess: () => void, id?: number) => Promise<void>
  archive: (id: number, onSuccess: () => void) => Promise<void>
  remove: (id: number, onSuccess: () => void) => Promise<void>
}

export function useAnnouncementAction(): UseAnnouncementActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function runMutation(
    request: () => Promise<unknown>,
    successMessage: string,
    onSuccess: () => void,
  ) {
    setIsSubmitting(true)
    try {
      await request()
      toast.success(successMessage)
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,

    post: async (payload, onSuccess) => {
      await runMutation(
        () =>
          api.post('/admin/settings/announcements', {
            ...payload,
            status: payload.status ?? 'published',
            target_audience: payload.target_audience ?? 'all',
          }),
        'Announcement posted.',
        onSuccess,
      )
    },

    save: async (payload, onSuccess, id) => {
      await runMutation(
        () => {
          if (id) {
            return api.patch(`/admin/settings/announcements/${id}`, payload)
          }

          return api.post('/admin/settings/announcements', {
            ...payload,
            status: payload.status ?? 'draft',
            target_audience: payload.target_audience ?? 'all',
          })
        },
        id ? 'Announcement updated.' : 'Announcement created.',
        onSuccess,
      )
    },

    archive: async (id, onSuccess) => {
      await runMutation(
        () => api.patch(`/admin/settings/announcements/${id}`, { status: 'archived' }),
        'Announcement archived.',
        onSuccess,
      )
    },

    remove: async (id, onSuccess) => {
      await runMutation(
        () => api.delete(`/admin/settings/announcements/${id}`),
        'Announcement deleted.',
        onSuccess,
      )
    },
  }
}
