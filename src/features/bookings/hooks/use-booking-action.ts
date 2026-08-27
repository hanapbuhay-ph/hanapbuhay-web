import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type Booking } from '../types'

interface UseBookingActionResult {
  isSubmitting: boolean
  forceCancel: (
    id: string,
    reason: string,
    onSuccess: (updated: Booking) => void
  ) => Promise<void>
}

export function useBookingAction(): UseBookingActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function forceCancel(
    id: string,
    reason: string,
    onSuccess: (updated: Booking) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.patch<Booking>(`/bookings/${id}`, {
        status: 'cancelled',
        cancellation_reason: reason,
      })
      toast.success('Booking force-cancelled successfully.')
      onSuccess(res.data)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, forceCancel }
}
