import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Verification, type VerificationStatus } from '../types'

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

    const params =
      statusFilter !== 'all'
        ? { verification_status: statusFilter }
        : undefined

    api
      .get<Verification[]>('/verifications', { params })
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load verifications.')
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
