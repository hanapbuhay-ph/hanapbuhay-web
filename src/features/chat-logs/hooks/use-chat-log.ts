import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ChatMessage, type ThreadResponse } from '../types'

interface UseChatLogResult {
  data: ChatMessage[]
  bookingCode: string | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLog(bookingId: string): UseChatLogResult {
  const [data, setData] = useState<ChatMessage[]>([])
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<{ success: boolean; data: ThreadResponse }>(`/messages/${bookingId}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.messages)
          setBookingCode(res.data.data.booking.booking_code)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load chat log.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [bookingId, tick])

  return { data, bookingCode, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
