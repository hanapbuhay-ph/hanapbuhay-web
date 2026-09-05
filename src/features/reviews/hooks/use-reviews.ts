import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Review, type ScoreFilter, type DirectionFilter } from '../types'

interface UseReviewsResult {
  data: Review[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReviews(
  scoreFilter: ScoreFilter = 'all',
  directionFilter: DirectionFilter = 'all'
): UseReviewsResult {
  const [data, setData] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params: Record<string, string | number> = {}
    if (scoreFilter !== 'all') params.score = scoreFilter
    if (directionFilter !== 'all') params.direction = directionFilter

    api
      .get<{ success: boolean; data: { ratings: Review[] } }>('/admin/ratings', {
        params: Object.keys(params).length ? params : undefined,
      })
      .then((res) => { if (!cancelled) setData(res.data.data.ratings) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load ratings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [scoreFilter, directionFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
