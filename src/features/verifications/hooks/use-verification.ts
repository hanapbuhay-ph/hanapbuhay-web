// MISMATCH NOTE: Mock used GET /verifications/:id returning a single Verification.
// The real API has no single-record detail endpoint (Section K2–K4 only covers
// the pending list and review actions). The detail record is served from the
// verificationCache populated by useVerifications on the list page.
// If the cache is empty (e.g. user navigates directly to the detail URL),
// we fall back to re-fetching the pending list to warm the cache.

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Verification } from '../types'
import { verificationCache } from './use-verifications'

interface PendingApiResponse {
  success: boolean
  data: {
    verifications: Verification[]
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

    // The route param is worker_profile_id (used as the URL :id)
    const cached = verificationCache.get(Number(id)) ?? verificationCache.get(id)
    if (cached) {
      setData(cached)
      setIsLoading(false)
      return
    }

    // Cache miss — warm the cache by fetching the pending list
    api
      .get<PendingApiResponse>('/admin/verifications/pending')
      .then((res) => {
        if (!cancelled) {
          const list = res.data.data.verifications ?? []
          list.forEach((v) => verificationCache.set(v.worker_profile_id, v))
          const found =
            list.find((v) => String(v.worker_profile_id) === String(id)) ?? null
          setData(found)
          if (!found) setError('Verification record not found.')
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load verification.')
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
