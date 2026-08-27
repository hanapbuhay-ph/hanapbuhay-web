// When the real API is ready, published announcements are pushed to all target
// users via /api/admin/announcements. The mobile app displays active
// (published, not expired) announcements in the notification center.
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type Announcement, type AnnouncementPayload } from '../types'

interface UseAnnouncementActionResult {
  isSubmitting: boolean
  create: (
    payload: AnnouncementPayload,
    onSuccess: (created: Announcement) => void
  ) => Promise<void>
  edit: (
    id: number,
    payload: AnnouncementPayload,
    onSuccess: (updated: Announcement) => void
  ) => Promise<void>
  archive: (
    id: number,
    onSuccess: (updated: Announcement) => void
  ) => Promise<void>
}

export function useAnnouncementAction(): UseAnnouncementActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function create(
    payload: AnnouncementPayload,
    onSuccess: (created: Announcement) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.post<Announcement>('/announcements', payload)
      toast.success('Announcement created.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create announcement.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function edit(
    id: number,
    payload: AnnouncementPayload,
    onSuccess: (updated: Announcement) => void
  ) {
    setIsSubmitting(true)
    try {
      // Read-then-merge to preserve all fields
      const current = await api.get<Announcement>(`/announcements/${id}`)
      const merged = { ...current.data, ...payload }
      const res = await api.put<Announcement>(`/announcements/${id}`, merged)
      toast.success('Announcement updated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update announcement.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function archive(
    id: number,
    onSuccess: (updated: Announcement) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.patch<Announcement>(`/announcements/${id}`, {
        status: 'archived',
      })
      toast.success('Announcement archived.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to archive announcement.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, create, edit, archive }
}
