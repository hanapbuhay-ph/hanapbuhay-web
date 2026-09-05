// MISMATCH NOTE: Mock used GET /verifications?verification_status={status}
// and returned a flat Verification[].
// Real API only has GET /admin/verifications/pending (Section K2) which returns:
//   { success, data: { verifications: [...], pagination: {} } }
// There is no endpoint for approved/rejected/resubmission_requested status filters.
// Those filter tabs will return empty results until the backend adds them.
// The real API also adds time_elapsed and mobile_number on the user object.

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Verification, type VerificationStatus } from '../types'

interface PendingApiResponse {
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

// Module-level cache so the detail page can look up a record by worker_profile_id
// without a separate fetch (no single-record endpoint exists in the real API).
export const verificationCache = new Map<string | number, Verification>()

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

    // Only 'pending' and 'all' have a real endpoint; other statuses return empty
    if (statusFilter !== 'pending' && statusFilter !== 'all') {
      setData([])
      setIsLoading(false)
      return
    }

    api
      .get<PendingApiResponse>('/admin/verifications/pending')
      .then((res) => {
        if (!cancelled) {
          const list = res.data.data.verifications ?? []
          // Populate cache keyed by worker_profile_id for detail page lookups
          list.forEach((v) => verificationCache.set(v.worker_profile_id, v))
          setData(list)
        }
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
