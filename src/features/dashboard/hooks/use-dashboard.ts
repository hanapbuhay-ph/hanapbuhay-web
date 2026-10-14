import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface RecentActivityItem {
  type: string
  description: string
  created_at: string
}

export interface ActivityTrendPoint {
  date: string
  label: string
  bookings: number
  verifications: number
  active_jobs: number
}

export interface ServiceCategoryStat {
  name: string
  count: number
}

export interface DashboardStats {
  total_users: number
  total_clients: number
  total_workers: number
  pending_verifications: number
  active_bookings: number
  open_disputes: number
  completed_bookings_today: number
  completed_bookings_yesterday: number
  total_active_job_posts: number
  activity_trend?: ActivityTrendPoint[]
  top_service_categories?: ServiceCategoryStat[]
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
  const query = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<DashboardApiResponse>('/admin/dashboard')
      return res.data.data
    },
    staleTime: 30 * 1000,
  })
  const recentActivity = query.data?.recent_activity ?? []
  const data: DashboardStats | null = query.data ? { ...query.data } : null

  return {
    data,
    recentActivity,
    isLoading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Failed to load dashboard data.'
      : null,
    refetch: () => {
      void query.refetch()
    },
  }
}
