import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type ReportReasonPayload } from '../types'

interface UseReportReasonActionResult {
  isSubmitting: boolean
  add: (payload: ReportReasonPayload, onSuccess: () => void) => Promise<void>
  update: (
    id: number,
    payload: ReportReasonPayload,
    onSuccess: () => void
  ) => Promise<void>
  toggle: (
    id: number,
    isActive: boolean,
    onSuccess: () => void
  ) => Promise<void>
  remove: (id: number, onSuccess: () => void) => Promise<void>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = err.response as { data?: { message?: string } }
    if (response?.data?.message) {
      return response.data.message
    }
  }

  return err instanceof Error ? err.message : fallback
}

export function useReportReasonAction(): UseReportReasonActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    add: async (
      { code, label, description, is_active = true, audience },
      onSuccess
    ) => {
      setIsSubmitting(true)
      try {
        await api.post('/admin/settings/report-reasons', {
          code: code?.trim() || undefined,
          label: label.trim(),
          description: description?.trim() || null,
          is_active,
          audience,
        })
        toast.success('Report reason added.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to add report reason.'))
      } finally {
        setIsSubmitting(false)
      }
    },

    update: async (
      id,
      { code, label, description, is_active, audience },
      onSuccess
    ) => {
      setIsSubmitting(true)
      try {
        await api.patch(`/admin/settings/report-reasons/${id}`, {
          code: code?.trim() || undefined,
          label: label.trim(),
          description: description?.trim() || null,
          is_active,
          audience,
        })
        toast.success('Report reason updated.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update report reason.'))
      } finally {
        setIsSubmitting(false)
      }
    },

    toggle: async (id, isActive, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.patch(`/admin/settings/report-reasons/${id}`, {
          is_active: isActive,
        })
        toast.success(
          isActive ? 'Report reason enabled.' : 'Report reason disabled.'
        )
        onSuccess()
      } catch (err) {
        toast.error(
          getErrorMessage(err, 'Failed to update report reason status.')
        )
      } finally {
        setIsSubmitting(false)
      }
    },

    remove: async (id, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.delete(`/admin/settings/report-reasons/${id}`)
        toast.success('Report reason deleted.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete report reason.'))
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
