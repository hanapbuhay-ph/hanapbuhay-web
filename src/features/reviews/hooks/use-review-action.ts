import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface UseReviewActionResult {
  isSubmitting: boolean
  removeRating: (id: number, reason: string, onSuccess: () => void) => Promise<void>
}

export function useReviewAction(): UseReviewActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    removeRating: async (id, reason, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.delete(`/admin/ratings/${id}`, { data: { reason } })
        toast.success('Review removed.')
        onSuccess()
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Action failed. Please try again.'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
