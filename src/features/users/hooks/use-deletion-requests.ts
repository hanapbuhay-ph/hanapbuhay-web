import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type DeletionRequest, type DeletionRequestStatus } from '../types'

interface UseDeletionRequestsResult {
  data: DeletionRequest[]
  pendingCount: number
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDeletionRequests(
  statusFilter: DeletionRequestStatus | 'all' = 'all'
): UseDeletionRequestsResult {
  const [data, setData] = useState<DeletionRequest[]>([])
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
      .get<DeletionRequest[]>('/deletion_requests', { params })
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load deletion requests.'
          )
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [statusFilter, tick])

  const pendingCount = data.filter((r) => r.status === 'pending').length

  return { data, pendingCount, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
