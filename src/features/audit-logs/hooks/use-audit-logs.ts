import { useEffect, useMemo, useState } from 'react'
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
  const [raw, setRaw] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    // Fetch all — json-server doesn't support filtering on nested fields,
    // so we filter client-side after fetching all records.
    api
      .get<AuditLog[]>('/audit_logs')
      .then((res) => {
        if (!cancelled) {
          // Sort newest first
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          setRaw(sorted)
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
  }, [tick])

  const data = useMemo(() => {
    if (actionFilter === 'all') return raw
    return raw.filter((log) => log.action === actionFilter)
  }, [raw, actionFilter])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
