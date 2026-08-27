import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ChatLog } from '../types'

interface UseChatLogResult {
  data: ChatLog | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLog(bookingId: string): UseChatLogResult {
  const [data, setData] = useState<ChatLog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    // When the real API is ready, replace this endpoint with
    // GET /api/admin/chat-logs?booking_id=:bookingId
    // The response shape may include pagination — plan to handle a
    // paginated messages array rather than a flat list.
    //
    // NOTE: json-server does not reliably filter string fields via query params,
    // so we fetch all and filter client-side.
    api
      .get<ChatLog[]>('/chat_logs')
      .then((res) => {
        if (!cancelled) {
          const match = res.data.find(
            (log) => String(log.booking_id) === String(bookingId)
          )
          setData(match ?? null)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load chat log.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [bookingId, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
