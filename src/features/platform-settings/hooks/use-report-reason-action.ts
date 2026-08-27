// When the real API is ready, PUT/PATCH here maps to /api/admin/report-reasons.
// The 'code' field on report reasons is read-only — it is set at creation and
// never changed by the admin panel.
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type ReportReason, type ReportReasonPayload } from '../types'

interface UseReportReasonActionResult {
  isSubmitting: boolean
  edit: (
    id: number,
    payload: ReportReasonPayload,
    onSuccess: (updated: ReportReason) => void
  ) => Promise<void>
  toggle: (
    current: ReportReason,
    onSuccess: (updated: ReportReason) => void
  ) => Promise<void>
}

export function useReportReasonAction(): UseReportReasonActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function edit(
    id: number,
    payload: ReportReasonPayload,
    onSuccess: (updated: ReportReason) => void
  ) {
    setIsSubmitting(true)
    try {
      // Read-then-merge to preserve all fields (including read-only 'code')
      const current = await api.get<ReportReason>(`/report_reasons/${id}`)
      const merged = { ...current.data, ...payload }
      const res = await api.put<ReportReason>(`/report_reasons/${id}`, merged)
      toast.success('Report reason updated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update reason.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggle(
    current: ReportReason,
    onSuccess: (updated: ReportReason) => void
  ) {
    setIsSubmitting(true)
    const newValue = !current.is_active
    try {
      const res = await api.patch<ReportReason>(
        `/report_reasons/${current.id}`,
        { is_active: newValue }
      )
      toast.success(newValue ? 'Reason activated.' : 'Reason deactivated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, edit, toggle }
}
