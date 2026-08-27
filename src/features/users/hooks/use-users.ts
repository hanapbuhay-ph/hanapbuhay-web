import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type User, type RoleFilter, type StatusFilter } from '../types'

interface UseUsersResult {
  data: User[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers(
  roleFilter: RoleFilter = 'all',
  statusFilter: StatusFilter = 'all'
): UseUsersResult {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params: Record<string, string> = {}
    if (roleFilter !== 'all') params.role = roleFilter
    if (statusFilter === 'active') params.is_active = 'true'
    if (statusFilter === 'suspended') params.is_active = 'false'

    api
      .get<User[]>('/users', { params })
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load users.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [roleFilter, statusFilter, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
