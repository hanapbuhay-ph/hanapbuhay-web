import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Booking } from '../types'

interface UseBookingResult {
  data: Booking | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  setData: React.Dispatch<React.SetStateAction<Booking | null>>
}

export function useBooking(id: string): UseBookingResult {
  const [data, setData] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get(`/admin/bookings/${id}`)
      .then((res) => { if (!cancelled) setData(res.data.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load booking.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1), setData }
}
