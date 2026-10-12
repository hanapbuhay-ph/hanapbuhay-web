// Real API: POST /admin/bookings/{id}/cancel
//   body: { reason: string }
//   response: { success, message, data: { id, booking_code, status, ... } }

import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { type AdminBookingInput, type Booking } from '../types'

interface UseBookingActionResult {
  isSubmitting: boolean
  createForClient: (input: AdminBookingInput) => Promise<boolean>
  reschedule: (
    id: number,
    scheduledAt: string,
    onSuccess: (updated: Partial<Booking>) => void
  ) => Promise<void>
  forceCancel: (
    id: number,
    reason: string,
    onSuccess: (updated: Partial<Booking>) => void
  ) => Promise<void>
}

export function useBookingAction(): UseBookingActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function createForClient(input: AdminBookingInput): Promise<boolean> {
    setIsSubmitting(true)
    try {
      await api.post('/admin/bookings', input)
      toast.success('Booking created for the client.')
      return true
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
      toast.error(msg)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  async function reschedule(
    id: number,
    scheduledAt: string,
    onSuccess: (updated: Partial<Booking>) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.post(`/admin/bookings/${id}/reschedule`, {
        scheduled_at: scheduledAt,
      })
      toast.success('Booking rescheduled. Both the client and worker were notified.')
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

  return { isSubmitting, createForClient, reschedule, forceCancel }
}
