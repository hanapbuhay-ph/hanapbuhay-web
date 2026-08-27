import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ChatLog } from '../types'

interface UseChatLogsResult {
  data: ChatLog[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLogs(): UseChatLogsResult {
  const [data, setData] = useState<ChatLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    // When the real API is ready, replace this endpoint with
    // GET /api/admin/chat-logs
    // The response shape may include pagination — plan to handle a paginated list.
    api
      .get<ChatLog[]>('/chat_logs')
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load chat logs.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
