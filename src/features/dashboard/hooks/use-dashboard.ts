import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface DashboardStats {
  total_users: number
  total_clients: number
  total_workers: number
  pending_verifications: number
  active_bookings: number
  open_disputes: number
  completed_bookings_today: number
}

interface UseDashboardResult {
  data: DashboardStats | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get<DashboardStats>('/dashboard')
        if (!cancelled) setData(res.data)
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Failed to load dashboard data.'
          setError(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDashboard()
    return () => {
      cancelled = true
    }
  }, [tick])

  return {
    data,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
