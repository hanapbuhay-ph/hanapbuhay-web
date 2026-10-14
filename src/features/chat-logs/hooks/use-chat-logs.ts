import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Conversation, type ChatPagination } from '../types'

interface UseChatLogsResult {
  data: Conversation[]
  pagination: ChatPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useChatLogs(page = 1, search = ''): UseChatLogsResult {
  const [data, setData] = useState<Conversation[]>([])
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
      .get<{
        success: boolean
        data: { conversations: Conversation[]; pagination: ChatPagination }
      }>('/admin/chat-logs', {
        params: { page, ...(search.trim() ? { search: search.trim() } : {}) },
      })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.conversations)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load chat logs.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, search, tick])

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
