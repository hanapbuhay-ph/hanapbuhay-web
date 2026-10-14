import { startTransition, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type JobPostDetail } from '../types'

interface UseJobPostResult {
  data: JobPostDetail | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useJobPost(id: string): UseJobPostResult {
  const [data, setData] = useState<JobPostDetail | null>(null)
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
      .get<{ data: { job_post: JobPostDetail } }>(`/admin/posts/${id}`)
      .then((response) => {
        if (!cancelled) setData(response.data.data.job_post)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Failed to load job post.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((value) => value + 1) }
}
