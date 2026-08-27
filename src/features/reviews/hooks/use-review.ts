import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Review } from '../types'

interface UseReviewResult {
  data: Review | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  setData: React.Dispatch<React.SetStateAction<Review | null>>
}

export function useReview(id: string): UseReviewResult {
  const [data, setData] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<Review>(`/reviews/${id}`)
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load review.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1), setData }
}
