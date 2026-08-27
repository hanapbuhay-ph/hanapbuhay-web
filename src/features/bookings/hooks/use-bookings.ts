import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Booking, type BookingStatusFilter } from '../types'

interface UseBookingsResult {
  data: Booking[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useBookings(
  statusFilter: BookingStatusFilter = 'all'
): UseBookingsResult {
  const [data, setData] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params =
      statusFilter !== 'all' ? { status: statusFilter } : undefined

    api
      .get<Booking[]>('/bookings', { params })
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load bookings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [statusFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
