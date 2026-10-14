// Real API: GET /admin/deletion-requests
//   response: { success, data: { users: DeletionUser[], pagination } }
//   No status filter — endpoint always returns users with pending deletion_requested_at
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type DeletionUser } from '../types'

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface UseDeletionRequestsResult {
  data: DeletionUser[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDeletionRequests(): UseDeletionRequestsResult {
  const [data, setData] = useState<DeletionUser[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [tick, setTick] = useState(0)
  const [loadedTick, setLoadedTick] = useState<number | null>(null)
  const [requestError, setRequestError] = useState<{
    tick: number
    message: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get('/admin/deletion-requests')
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.users)
          setPagination(res.data.data.pagination)
          setRequestError(null)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setRequestError({
            tick,
            message:
              err instanceof Error
                ? err.message
                : 'Failed to load deletion requests.',
          })
      })
      .finally(() => {
        if (!cancelled) setLoadedTick(tick)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return {
    data,
    pagination,
    isLoading: loadedTick !== tick,
    error: requestError?.tick === tick ? requestError.message : null,
    refetch: () => setTick((t) => t + 1),
  }
}
