// Real API: POST /admin/deletion-requests/{id}/process
//   No request body — irreversible anonymisation + soft-delete
//   response: { success, message }

import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'

interface UseDeletionRequestActionResult {
  isSubmitting: boolean
  processDeletion: (userId: string | number, onSuccess: () => void) => Promise<void>
}

export function useDeletionRequestAction(): UseDeletionRequestActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function processDeletion(userId: string | number, onSuccess: () => void) {
    setIsSubmitting(true)
    try {
      const res = await api.post(`/admin/deletion-requests/${userId}/process`)
      toast.success(res.data.message ?? 'Account deleted and data anonymised.')
      onSuccess()
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, processDeletion }
}
