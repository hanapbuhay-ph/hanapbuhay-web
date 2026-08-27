import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type AuditLog } from '@/features/audit-logs/types'

interface UseRecentActivityResult {
  data: AuditLog[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useRecentActivity(): UseRecentActivityResult {
  const [data, setData] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<AuditLog[]>('/audit_logs')
      .then((res) => {
        if (!cancelled) {
          // Sort descending by created_at, take the first 8
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setData(sorted.slice(0, 8))
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load recent activity.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
