import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Conversation } from '../types'

interface UseChatLogsResult {
  data: Conversation[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLogs(): UseChatLogsResult {
  const [data, setData] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<{ success: boolean; data: { conversations: Conversation[] } }>('/messages')
      .then((res) => {
        if (!cancelled) setData(res.data.data.conversations)
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load chat logs.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
