import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type DeletionRequest } from '../types'

interface UseDeleteionRequestActionResult {
  isSubmitting: boolean
  approveDeletion: (
    id: string,
    adminRemarks: string,
    onSuccess: (updated: DeletionRequest) => void
  ) => Promise<void>
  denyDeletion: (
    id: string,
    adminRemarks: string,
    onSuccess: (updated: DeletionRequest) => void
  ) => Promise<void>
}

export function useDeletionRequestAction(): UseDeleteionRequestActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function patchRequest(
    id: string,
    status: 'approved' | 'denied',
    adminRemarks: string,
    successMessage: string,
    onSuccess: (updated: DeletionRequest) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.patch<DeletionRequest>(`/deletion_requests/${id}`, {
        status,
        processed_at: new Date().toISOString(),
        admin_remarks: adminRemarks,
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

    // NOTE: When the real API is ready, approving a deletion request should
    // also trigger account deactivation on the backend. The admin panel only
    // records the decision — actual data deletion is handled server-side.
    approveDeletion: (id, adminRemarks, onSuccess) =>
      patchRequest(
        id,
        'approved',
        adminRemarks,
        'Deletion request approved. Account marked for deletion.',
        onSuccess
      ),

    denyDeletion: (id, adminRemarks, onSuccess) =>
      patchRequest(id, 'denied', adminRemarks, 'Deletion request denied.', onSuccess),
  }
}
