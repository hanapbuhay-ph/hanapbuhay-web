import { startTransition, useEffect, useState } from 'react'
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
  const [data, setData] = useState<JobPost[]>([])
  const [pagination, setPagination] = useState<JobPostPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (workerProfileId === undefined) {
      return () => { cancelled = true }
    }

    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    const params: Record<string, string> = {}
    if (workerProfileId !== null) params.worker_profile_id = String(workerProfileId)
    if (categoryId !== null) params.category_id = String(categoryId)
    if (barangayId !== null) params.barangay_id = String(barangayId)
    if (status !== 'all') params.status = status
    if (verification !== 'all') params.verification = verification
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    params.page = String(page)

    api
      .get('/admin/posts', { params })
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data.posts)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load job posts.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [workerProfileId, categoryId, barangayId, status, verification, debouncedSearch, page, tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
