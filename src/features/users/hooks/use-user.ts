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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get(`/admin/users/${id}`)
      .then((res) => { if (!cancelled) setData(res.data.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load user.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1), setData }
}
