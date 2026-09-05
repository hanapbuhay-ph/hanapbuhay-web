import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Report, type ReportStatusFilter } from '../types'

interface UseReportsResult {
  data: Report[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReports(
  statusFilter: ReportStatusFilter = 'under_review'
): UseReportsResult {
  const [data, setData] = useState<Report[]>([])
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
      .get<{ success: boolean; data: { reports: Report[] } }>('/admin/reports', { params })
      .then((res) => { if (!cancelled) setData(res.data.data.reports) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load reports.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [statusFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
