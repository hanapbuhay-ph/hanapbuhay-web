import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type AuditLog, type AuditActionFilter } from '../types'

interface UseAuditLogsResult {
  data: AuditLog[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAuditLogs(
  actionFilter: AuditActionFilter = 'all'
): UseAuditLogsResult {
  const [data, setData] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params =
      actionFilter !== 'all' ? { action: actionFilter } : undefined

    api
      .get<{ success: boolean; data: { logs: AuditLog[] } }>(
        '/admin/audit-logs',
        { params }
      )
      .then((res) => { if (!cancelled) setData(res.data.data.logs) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load audit logs.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [actionFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
