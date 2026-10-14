import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type User } from '../types'

interface UseUserResult {
  data: User | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  setData: React.Dispatch<React.SetStateAction<User | null>>
}

export function useUser(id: string): UseUserResult {
  const [data, setData] = useState<User | null>(null)
  const [tick, setTick] = useState(0)
  const requestKey = `${id}:${tick}`
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{
    key: string
    message: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get(`/admin/users/${id}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data)
          setRequestError(null)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setRequestError({
            key: requestKey,
            message:
              err instanceof Error ? err.message : 'Failed to load user.',
          })
      })
      .finally(() => {
        if (!cancelled) setLoadedRequestKey(requestKey)
      })

    return () => {
      cancelled = true
    }
  }, [id, requestKey])

  return {
    data,
    isLoading: loadedRequestKey !== requestKey,
    error: requestError?.key === requestKey ? requestError.message : null,
    refetch: () => setTick((t) => t + 1),
    setData,
  }
}
