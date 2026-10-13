import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  type AuditLog,
  type AuditActionFilter,
  type AuditPagination,
} from '../types'

interface UseAuditLogsResult {
  data: AuditLog[]
  pagination: AuditPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAuditLogs(
  actionFilter: AuditActionFilter = 'all',
  targetType = 'all',
  adminName = '',
  category = 'all',
  outcome = 'all',
  ipAddress = '',
  dateFrom = '',
  dateTo = '',
  page = 1
): UseAuditLogsResult {
  const [pagination, setPagination] = useState<AuditPagination | null>(null)
  const [data, setData] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    const params: Record<string, string | number> = { page }
    if (actionFilter !== 'all') params.action = actionFilter
    if (targetType !== 'all') params.target_type = targetType
    if (adminName.trim()) params.admin_name = adminName.trim()
    if (category !== 'all') params.category = category
    if (outcome !== 'all') params.outcome = outcome
    if (ipAddress.trim()) params.ip_address = ipAddress.trim()
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo

    api
      .get<{
        success: boolean
        data: { logs: AuditLog[]; pagination: AuditPagination }
      }>('/admin/audit-logs', { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.logs)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load audit logs.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    actionFilter,
    targetType,
    adminName,
    category,
    outcome,
    ipAddress,
    dateFrom,
    dateTo,
    page,
    tick,
  ])

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
