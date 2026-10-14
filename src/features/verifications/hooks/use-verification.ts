import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Verification } from '../types'

interface VerificationApiResponse {
  success: boolean
  data: {
    verification: Verification
  }
}

interface UseVerificationResult {
  data: Verification | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useVerification(id: string | number): UseVerificationResult {
  const [data, setData] = useState<Verification | null>(null)
  const [tick, setTick] = useState(0)
  const requestKey = `${id}:${tick}`
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{
    key: string
    message: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<VerificationApiResponse>(`/admin/verifications/${id}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.verification)
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
                : 'Failed to load verification.',
          })
      })
      .finally(() => {
        if (!cancelled) setLoadedRequestKey(requestKey)
      })

    return () => {
      cancelled = true
    }
  }, [id, requestKey])

  return {
    data,
    isLoading: loadedRequestKey !== requestKey,
    error: requestError?.key === requestKey ? requestError.message : null,
    refetch: () => setTick((t) => t + 1),
  }
}
