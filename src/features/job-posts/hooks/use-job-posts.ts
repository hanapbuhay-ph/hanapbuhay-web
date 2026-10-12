import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  type JobPost,
  type JobPostPagination,
  type JobPostStatusFilter,
  type JobPostVerificationFilter,
} from '../types'

interface UseJobPostsResult {
  data: JobPost[]
  pagination: JobPostPagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useJobPosts(
  categoryId: number | null = null,
  barangayId: number | null = null,
  status: JobPostStatusFilter = 'all',
  verification: JobPostVerificationFilter = 'all',
  search = '',
  page = 1,
  workerProfileId: number | null | undefined = null,
): UseJobPostsResult {
  const debouncedSearch = useDebouncedValue(search)
  const params: Record<string, string> = {}
  if (workerProfileId !== null && workerProfileId !== undefined) {
    params.worker_profile_id = String(workerProfileId)
  }
  if (categoryId !== null) params.category_id = String(categoryId)
  if (barangayId !== null) params.barangay_id = String(barangayId)
  if (status !== 'all') params.status = status
  if (verification !== 'all') params.verification = verification
  if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
  params.page = String(page)

  const query = useQuery({
    queryKey: [
      'admin',
      'job-posts',
      { categoryId, barangayId, status, verification, search: debouncedSearch, page, workerProfileId, params },
    ],
    queryFn: async () => {
      const response = await api.get('/admin/posts', { params })
      return {
        posts: response.data.data.posts as JobPost[],
        pagination: response.data.data.pagination as JobPostPagination,
      }
    },
    enabled: workerProfileId !== undefined,
    staleTime: 15_000,
    gcTime: 30 * 60 * 1000,
  })

  return {
    data: query.data?.posts ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    error: !query.data
      ? query.error instanceof Error
        ? query.error.message
        : query.error
          ? 'Failed to load job posts.'
          : null
      : null,
    refetch: () => {
      void query.refetch()
    },
  }
}
