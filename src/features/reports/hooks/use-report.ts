import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type Report } from '../types'

interface UseReportResult {
  data: Report | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  setData: React.Dispatch<React.SetStateAction<Report | null>>
}

export function useReport(id: string): UseReportResult {
  const [data, setData] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<{ success: boolean; data: Report }>(`/admin/reports/${id}`)
      .then((res) => { if (!cancelled) setData(res.data.data) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load report.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [id, tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1), setData }
}
