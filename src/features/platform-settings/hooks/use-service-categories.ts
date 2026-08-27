import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ServiceCategory } from '../types'

interface UseServiceCategoriesResult {
  data: ServiceCategory[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useServiceCategories(): UseServiceCategoriesResult {
  const [data, setData] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<ServiceCategory[]>('/service_categories')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load service categories.'
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
