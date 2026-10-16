// Real API: POST /admin/users/{id}/toggle-status
//   body: { action: 'suspend' | 'reactivate', reason?: string }
//   response: { success, message, data: { user_id, is_active } }
import { useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface UserActionResult {
  is_active: boolean
  action?: 'suspend'
  scheduled_for?: string
}

interface UseUserActionResult {
  isSubmitting: boolean
  suspend: (
    id: string | number,
    reason: string,
    onSuccess: (result: UserActionResult) => void
  ) => Promise<void>
  reactivate: (
    id: string | number,
    onSuccess: (result: UserActionResult) => void
  ) => Promise<void>
}

export function useUserAction(): UseUserActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function toggleStatus(
    id: string | number,
    action: 'suspend' | 'reactivate',
    onSuccess: (result: UserActionResult) => void,
    reason?: string
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.post(`/admin/users/${id}/toggle-status`, {
        action,
        ...(reason ? { reason } : {}),
      })
      toast.success(res.data.message)
      onSuccess(res.data.data)
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

  return {
    isSubmitting,
    suspend: (id, reason, onSuccess) =>
      toggleStatus(id, 'suspend', onSuccess, reason),
    reactivate: (id, onSuccess) => toggleStatus(id, 'reactivate', onSuccess),
  }
}
