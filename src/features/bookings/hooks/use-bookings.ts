import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  type Booking,
  type BookingPagination,
  type BookingStatusFilter,
} from '../types'

interface UseBookingsResult {
  data: Booking[]
  pagination: BookingPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useBookings(
  statusFilter: BookingStatusFilter = 'all',
  categoryId: number | null = null,
  dateFrom = '',
  dateTo = '',
  search = '',
  page = 1
): UseBookingsResult {
  const debouncedSearch = useDebouncedValue(search)
  const [data, setData] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<BookingPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    const params: Record<string, string> = { page: String(page) }
    if (statusFilter !== 'all') params.status = statusFilter
    if (categoryId !== null) params.category_id = String(categoryId)
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()

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
          setError(
            err instanceof Error ? err.message : 'Failed to load bookings.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, categoryId, dateFrom, dateTo, debouncedSearch, page, tick])

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
