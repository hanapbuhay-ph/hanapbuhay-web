import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

// Each row has a count (null = fetch failed for that row)
export interface NeedsAttentionData {
  pendingVerifications: number | null
  resubmissionRequested: number | null
  underReviewReports: number | null
  flaggedReviews: number | null
  pendingDeletions: number | null
}

interface UseNeedsAttentionResult {
  data: NeedsAttentionData
  isLoading: boolean
  refetch: () => void
}

// Safe fetch: resolves to the array length or null on failure
async function safeCount<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<number | null> {
  try {
    const res = await api.get<T[]>(endpoint, { params })
    return Array.isArray(res.data) ? res.data.length : null
  } catch {
    return null
  }
}

export function useNeedsAttention(): UseNeedsAttentionResult {
  const [data, setData] = useState<NeedsAttentionData>({
    pendingVerifications: null,
    resubmissionRequested: null,
    underReviewReports: null,
    flaggedReviews: null,
    pendingDeletions: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    // All 5 fetches run in parallel; individual failures return null (not null for all)
    Promise.all([
      safeCount('/verifications', { verification_status: 'pending' }),
      safeCount('/verifications', { verification_status: 'resubmission_requested' }),
      safeCount('/reports', { status: 'under_review' }),
      safeCount('/reviews', { status: 'flagged' }),
      safeCount('/deletion_requests', { status: 'pending' }),
    ]).then(
      ([
        pendingVerifications,
        resubmissionRequested,
        underReviewReports,
        flaggedReviews,
        pendingDeletions,
      ]) => {
        if (!cancelled) {
          setData({
            pendingVerifications,
            resubmissionRequested,
            underReviewReports,
            flaggedReviews,
            pendingDeletions,
          })
          setIsLoading(false)
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, isLoading, refetch: () => setTick((t) => t + 1) }
}
