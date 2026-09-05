import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Booking, type BookingStatusFilter } from '../types'

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface UseBookingsResult {
  data: Booking[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useBookings(
  statusFilter: BookingStatusFilter = 'all'
): UseBookingsResult {
  const [data, setData] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params = statusFilter !== 'all' ? { status: statusFilter } : undefined

    api
      .get('/admin/bookings', { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.bookings)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load bookings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [statusFilter, tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
