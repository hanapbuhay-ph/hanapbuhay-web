import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  type Report,
  type ReportPagination,
  type ReportReasonFilter,
  type ReportStatusFilter,
} from '../types'

interface UseReportsResult {
  data: Report[]
  pagination: ReportPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReports(
  statusFilter: ReportStatusFilter = 'under_review',
  reasonFilter: ReportReasonFilter = 'all',
  page = 1
): UseReportsResult {
  const [data, setData] = useState<Report[]>([])
  const [pagination, setPagination] = useState<ReportPagination | null>(null)
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
    if (reasonFilter !== 'all') params.reason = reasonFilter

    api
      .get<{
        success: boolean
        data: { reports: Report[]; pagination: ReportPagination }
      }>('/admin/reports', { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.reports)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load reports.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, reasonFilter, page, tick])

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
