import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Review, type ReviewStatusFilter } from '../types'

interface UseReviewsResult {
  data: Review[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReviews(
  statusFilter: ReviewStatusFilter = 'flagged'
): UseReviewsResult {
  const [data, setData] = useState<Review[]>([])
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
      .get<Review[]>('/reviews', { params })
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load reviews.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [statusFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
