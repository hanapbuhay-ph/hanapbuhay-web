import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Verification, type VerificationStatus } from '../types'

interface VerificationsApiResponse {
  success: boolean
  data: {
    verifications: Verification[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }
}

interface UseVerificationsResult {
  data: Verification[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useVerifications(
  statusFilter: VerificationStatus | 'all' = 'all'
): UseVerificationsResult {
  const [data, setData] = useState<Verification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<VerificationsApiResponse>('/admin/verifications', {
        params: statusFilter === 'all' ? undefined : { status: statusFilter },
      })
      .then((res) => {
        if (!cancelled) {
          const list = res.data.data.verifications ?? []
          setData(list)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load verifications.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
