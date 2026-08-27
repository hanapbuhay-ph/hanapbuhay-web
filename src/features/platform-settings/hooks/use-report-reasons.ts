import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { type ReportReason } from '../types'

interface UseReportReasonsResult {
  data: ReportReason[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useReportReasons(): UseReportReasonsResult {
  const [data, setData] = useState<ReportReason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<ReportReason[]>('/report_reasons')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load report reasons.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
