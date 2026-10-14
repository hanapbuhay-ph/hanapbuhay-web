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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<VerificationApiResponse>(`/admin/verifications/${id}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.verification)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load verification.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
