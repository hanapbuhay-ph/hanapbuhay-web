import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Announcement } from '../types'

interface UseAnnouncementsResult {
  data: Announcement[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAnnouncements(): UseAnnouncementsResult {
  const [data, setData] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<Announcement[]>('/announcements')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load announcements.'
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
