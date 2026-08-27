import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type User } from '../types'

interface UseUserActionResult {
  isSubmitting: boolean
  suspend: (id: string, onSuccess: (updated: User) => void) => Promise<void>
  reactivate: (id: string, onSuccess: (updated: User) => void) => Promise<void>
}

export function useUserAction(): UseUserActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function patchActive(
    id: string,
    isActive: boolean,
    onSuccess: (updated: User) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.patch<User>(`/users/${id}`, { is_active: isActive })
      toast.success(
        isActive ? 'User reactivated successfully.' : 'User suspended successfully.'
      )
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
    suspend: (id, onSuccess) => patchActive(id, false, onSuccess),
    reactivate: (id, onSuccess) => patchActive(id, true, onSuccess),
  }
}
