import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type NotificationTemplate } from '../types'

interface UseNotificationTemplatesResult {
  data: NotificationTemplate[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useNotificationTemplates(): UseNotificationTemplatesResult {
  const [data, setData] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<NotificationTemplate[]>('/notification_templates')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load notification templates.'
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
