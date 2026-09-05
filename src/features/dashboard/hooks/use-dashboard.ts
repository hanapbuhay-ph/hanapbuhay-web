import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface RecentActivityItem {
  type: string
  description: string
  created_at: string
}

export interface DashboardStats {
  total_users: number
  total_clients: number
  total_workers: number
  pending_verifications: number
  active_bookings: number
  open_disputes: number
  completed_bookings_today: number
  total_active_job_posts: number
}

// Real API response shape from GET /admin/dashboard
interface DashboardApiResponse {
  success: boolean
  data: DashboardStats & {
    recent_activity: RecentActivityItem[]
  }
}

interface UseDashboardResult {
  data: DashboardStats | null
  recentActivity: RecentActivityItem[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get<DashboardApiResponse>('/admin/dashboard')
        if (!cancelled) {
          const { recent_activity, ...stats } = res.data.data
          setData(stats)
          setRecentActivity(recent_activity ?? [])
        }
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
    recentActivity,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
