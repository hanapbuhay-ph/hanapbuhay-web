import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type JobPost } from '../types'

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface UseJobPostsResult {
  data: JobPost[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useJobPosts(categoryId: number | null = null): UseJobPostsResult {
  const [data, setData] = useState<JobPost[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params: Record<string, string> = {}
    if (categoryId !== null) params.category_id = String(categoryId)

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
  }, [categoryId, tick])

  return { data, pagination, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
