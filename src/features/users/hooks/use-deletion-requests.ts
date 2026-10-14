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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get('/admin/deletion-requests')
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.users)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load deletion requests.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
