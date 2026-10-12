import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ChatMessage, type ChatPagination, type ThreadResponse } from '../types'

interface UseChatLogResult {
  data: ChatMessage[]
  conversation: ThreadResponse['conversation'] | null
  pagination: ChatPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLog(clientId: number, workerId: number, page = 1): UseChatLogResult {
  const [data, setData] = useState<ChatMessage[]>([])
  const [conversation, setConversation] = useState<ThreadResponse['conversation'] | null>(null)
  const [pagination, setPagination] = useState<ChatPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    api
      .get<{ success: boolean; data: ThreadResponse }>(
        `/admin/chat-logs/conversations/${clientId}/${workerId}`,
        { params: { page } }
      )
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.messages)
          setConversation(res.data.data.conversation)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load chat log.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [clientId, workerId, page, tick])

  return { data, conversation, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
