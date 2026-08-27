import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type DeletionRequest } from '../types'

interface UseUserDeletionRequestResult {
  data: DeletionRequest | null
  isLoading: boolean
}

/** Fetches the most recent deletion request for a specific user, if any. */
export function useUserDeletionRequest(
  userId: string
): UseUserDeletionRequestResult {
  const [data, setData] = useState<DeletionRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    // NOTE: json-server v1 does not reliably filter by string foreign keys via
    // query params (?user_id=x returns empty). Fetch all and filter client-side.
    api
      .get<DeletionRequest[]>('/deletion_requests')
      .then((res) => {
        if (!cancelled) {
          const forUser = res.data.filter(
            (r) => String(r.user_id) === String(userId)
          )
          // Take the most recent request if multiple exist
          const sorted = forUser.sort(
            (a, b) =>
              new Date(b.requested_at).getTime() -
              new Date(a.requested_at).getTime()
          )
          setData(sorted[0] ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { data, isLoading }
}
