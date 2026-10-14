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
  const [tick, setTick] = useState(0)
  const requestKey = `${statusFilter}:${tick}`
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{
    key: string
    message: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<VerificationsApiResponse>('/admin/verifications', {
        params: statusFilter === 'all' ? undefined : { status: statusFilter },
      })
      .then((res) => {
        if (!cancelled) {
          const list = res.data.data.verifications ?? []
          setData(list)
          setRequestError(null)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setRequestError({
            key: requestKey,
            message:
              err instanceof Error
                ? err.message
                : 'Failed to load verifications.',
          })
      })
      .finally(() => {
        if (!cancelled) setLoadedRequestKey(requestKey)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, requestKey])

  return {
    data,
    isLoading: loadedRequestKey !== requestKey,
    error: requestError?.key === requestKey ? requestError.message : null,
    refetch: () => setTick((t) => t + 1),
  }
}
