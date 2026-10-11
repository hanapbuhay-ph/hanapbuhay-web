import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { subscribeToAdminPanel } from '@/lib/realtime'
import {
  type User,
  type RoleFilter,
  type StatusFilter,
  type UserPagination,
} from '../types'
type VerificationFilter = 'all' | 'verified' | 'unverified'

interface UseUsersResult {
  data: User[]
  pagination: UserPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers(
  roleFilter: RoleFilter = 'all',
  statusFilter: StatusFilter = 'all',
  search = '',
  page = 1,
  verification: VerificationFilter = 'all',
  barangayId: number | null = null,
): UseUsersResult {
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToAdminPanel(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient])

  const params: Record<string, string> = {}
  if (roleFilter !== 'all') params.role = roleFilter
  if (statusFilter === 'active') params.status = 'active'
  if (statusFilter === 'suspended') params.status = 'suspended'
  if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
  if (verification !== 'all') params.verification = verification
  if (barangayId !== null) params.barangay = String(barangayId)
  params.page = String(page)

  const query = useQuery({
    queryKey: ['admin', 'users', { roleFilter, statusFilter, search: debouncedSearch, page, verification, params }],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params })
      return res.data.data as {
        users: User[]
        pagination: UserPagination
      }
    },
    staleTime: 15_000,
    refetchInterval: 12_000,
    refetchOnWindowFocus: true,
    gcTime: 30 * 60 * 1000,
  })

  return {
    data: query.data?.users ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : query.error ? 'Failed to load users.' : null,
    refetch: () => query.refetch(),
  }
}
