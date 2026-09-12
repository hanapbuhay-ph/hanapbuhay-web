import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type ResolutionAction } from '../types'

interface ResolvePayload {
  status: 'resolved'
  resolution_action: ResolutionAction
  admin_notes: string
  admin_remarks?: string
}

interface DismissPayload {
  status: 'dismissed'
  resolution_action: 'no_action'
  admin_notes: string
  admin_remarks?: string
}

interface UseReportActionResult {
  isSubmitting: boolean
  resolve: (
    id: number,
    payload: ResolvePayload,
    onSuccess: () => void
  ) => Promise<void>
  dismiss: (
    id: number,
    payload: DismissPayload,
    onSuccess: () => void
  ) => Promise<void>
}

export function useReportAction(): UseReportActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function callResolve(
    id: number,
    body: ResolvePayload | DismissPayload,
    successMessage: string,
    onSuccess: () => void
  ) {
    setIsSubmitting(true)
    try {
      await api.patch(`/admin/reports/${id}/resolve`, body)
      toast.success(successMessage)
      onSuccess()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,

    resolve: (id, { status, resolution_action, admin_notes, admin_remarks }, onSuccess) =>
      callResolve(
        id,
        { status, resolution_action, admin_notes, admin_remarks },
        'Report resolved successfully.',
        onSuccess
      ),

    dismiss: (id, { admin_notes, admin_remarks }, onSuccess) =>
      callResolve(
        id,
        { status: 'dismissed', resolution_action: 'no_action', admin_notes, admin_remarks },
        'Report dismissed.',
        onSuccess
      ),
  }
}
