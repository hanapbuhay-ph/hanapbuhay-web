import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type User, type RoleFilter, type StatusFilter } from '../types'

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface UseUsersResult {
  data: User[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers(
  roleFilter: RoleFilter = 'all',
  statusFilter: StatusFilter = 'all'
): UseUsersResult {
  const [data, setData] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params: Record<string, string> = {}
    if (roleFilter !== 'all') params.role = roleFilter
    if (statusFilter === 'active') params.status = 'active'
    if (statusFilter === 'suspended') params.status = 'suspended'

    api
      .get('/admin/users', { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.users)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load users.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [roleFilter, statusFilter, tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
