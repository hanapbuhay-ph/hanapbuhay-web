// Real API: POST /admin/bookings/{id}/cancel
//   body: { reason: string }
//   response: { success, message, data: { id, booking_code, status, ... } }

import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { type Booking } from '../types'

interface UseBookingActionResult {
  isSubmitting: boolean
  forceCancel: (
    id: number,
    reason: string,
    onSuccess: (updated: Partial<Booking>) => void
  ) => Promise<void>
}

export function useBookingAction(): UseBookingActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function forceCancel(
    id: number,
    reason: string,
    onSuccess: (updated: Partial<Booking>) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.post(`/admin/bookings/${id}/cancel`, { reason })
      toast.success('Booking force-cancelled successfully.')
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

  return { isSubmitting, forceCancel }
}
