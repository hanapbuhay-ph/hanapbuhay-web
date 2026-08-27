import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  type Report,
  type ReportHistoryEntry,
  type ReportStatus,
  type ResolutionAction,
} from '../types'

interface ResolvePayload {
  resolution_action: ResolutionAction
  admin_remarks: string
}

interface DismissPayload {
  admin_remarks: string
}

interface UseReportActionResult {
  isSubmitting: boolean
  resolve: (
    id: string,
    payload: ResolvePayload,
    onSuccess: (updated: Report) => void
  ) => Promise<void>
  dismiss: (
    id: string,
    payload: DismissPayload,
    onSuccess: (updated: Report) => void
  ) => Promise<void>
}

export function useReportAction(): UseReportActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Read-then-merge PATCH:
   * 1. GET the current record to obtain the existing history array.
   * 2. Build a new history entry.
   * 3. PATCH with the full updated history alongside the status fields.
   *
   * json-server replaces arrays wholesale on PATCH, so we must send the
   * complete merged history rather than just the new entry.
   */
  async function patchWithHistory(
    id: string,
    status: ReportStatus,
    newEntryAction: ReportHistoryEntry['action'],
    remarks: string,
    extraFields: Record<string, string>,
    successMessage: string,
    onSuccess: (updated: Report) => void
  ) {
    setIsSubmitting(true)
    try {
      // Step 1 — fetch current record
      const current = await api.get<Report>(`/reports/${id}`)
      const existingHistory: ReportHistoryEntry[] = current.data.history ?? []

      // Step 2 — build new history entry
      const newEntry: ReportHistoryEntry = {
        id: String(existingHistory.length + 1),
        action: newEntryAction,
        status,
        remarks: remarks || null,
        changed_at: new Date().toISOString(),
        changed_by: 'Admin User',
      }

      // Step 3 — PATCH with merged history
      const res = await api.patch<Report>(`/reports/${id}`, {
        status,
        ...extraFields,
        history: [...existingHistory, newEntry],
      })

      toast.success(successMessage)
      onSuccess(res.data)
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

    resolve: (id, { resolution_action, admin_remarks }, onSuccess) =>
      patchWithHistory(
        id,
        'resolved',
        'report_resolved',
        admin_remarks,
        { resolution_action, admin_remarks },
        'Report resolved successfully.',
        onSuccess
      ),

    dismiss: (id, { admin_remarks }, onSuccess) =>
      patchWithHistory(
        id,
        'dismissed',
        'report_dismissed',
        admin_remarks,
        { admin_remarks },
        'Report dismissed.',
        onSuccess
      ),
  }
}
