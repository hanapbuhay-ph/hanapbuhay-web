import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type Review } from '../types'

interface UseReviewActionResult {
  isSubmitting: boolean
  flagReview: (
    id: string,
    flaggedReason: string,
    onSuccess: (updated: Review) => void
  ) => Promise<void>
  removeReview: (
    id: string,
    onSuccess: (updated: Review) => void
  ) => Promise<void>
  restoreReview: (
    id: string,
    onSuccess: (updated: Review) => void
  ) => Promise<void>
}

export function useReviewAction(): UseReviewActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    flagReview: async (id, flaggedReason, onSuccess) => {
      setIsSubmitting(true)
      try {
        const res = await api.patch<Review>(`/reviews/${id}`, {
          status: 'flagged',
          is_flagged: true,
          flagged_reason: flaggedReason,
          flagged_at: new Date().toISOString(),
          // When the real API is ready, replace this hardcoded value
          // with the authenticated admin's name from the auth context.
          flagged_by: 'Admin User',
        })
        // onSuccess closes the dialog first, then the caller fires the toast
        // so it renders above the (now-dismissed) backdrop.
        onSuccess(res.data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },

    removeReview: async (id, onSuccess) => {
      setIsSubmitting(true)
      try {
        const res = await api.patch<Review>(`/reviews/${id}`, {
          status: 'removed',
        })
        onSuccess(res.data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },

    restoreReview: async (id, onSuccess) => {
      setIsSubmitting(true)
      try {
        const res = await api.patch<Review>(`/reviews/${id}`, {
          status: 'visible',
          is_flagged: false,
          flagged_reason: null,
          flagged_at: null,
          flagged_by: null,
        })
        onSuccess(res.data)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
