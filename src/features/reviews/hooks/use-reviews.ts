import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { type Review, type ReviewPagination, type ScoreFilter, type DirectionFilter } from '../types'

interface UseReviewsResult {
  data: Review[]
  pagination: ReviewPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReviews(
  scoreFilter: ScoreFilter = 'all',
  directionFilter: DirectionFilter = 'all',
  workerId: number | null = null,
  clientId: number | null = null,
  search = '',
  page = 1,
  ratedUserId: number | null = null,
): UseReviewsResult {
  const debouncedSearch = useDebouncedValue(search)
  const [data, setData] = useState<Review[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (ratedUserId === null) {
      startTransition(() => {
        setData([])
        setPagination(null)
        setIsLoading(false)
        setError(null)
      })
      return () => { cancelled = true }
    }

    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    const params: Record<string, string | number> = {}
    if (scoreFilter !== 'all') params.score = scoreFilter
    if (directionFilter !== 'all') params.direction = directionFilter
    if (workerId !== null) params.worker_id = workerId
    if (clientId !== null) params.client_id = clientId
    params.rated_user_id = ratedUserId
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    params.page = page

    api
      .get<{ success: boolean; data: { ratings: Review[]; pagination: ReviewPagination } }>('/admin/ratings', {
        params: Object.keys(params).length ? params : undefined,
      })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.ratings)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load ratings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [scoreFilter, directionFilter, workerId, clientId, debouncedSearch, page, ratedUserId, tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
