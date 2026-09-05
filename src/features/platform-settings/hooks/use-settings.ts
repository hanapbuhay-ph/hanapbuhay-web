import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  type PlatformSettings,
  type ReportReason,
  type NotificationTemplate,
} from '../types'

// Raw shapes returned by the real API (differ from our display types)
interface RawSettings {
  service_categories: PlatformSettings['service_categories']
  report_reasons: string[]                        // ['no_show', 'misconduct', ...]
  notification_templates: Record<string, string>  // { booking_accepted: 'body...', ... }
  active_announcement: PlatformSettings['active_announcement']
}

const REASON_LABELS: Record<string, string> = {
  no_show:              'No Show',
  unsatisfactory_work:  'Unsatisfactory Work',
  misconduct:           'Misconduct',
  non_payment:          'Non-Payment',
  unsafe_environment:   'Unsafe Environment',
  abusive_behavior:     'Abusive Behavior',
  false_information:    'False Information',
  other:                'Other',
}

function normalise(raw: RawSettings): PlatformSettings {
  const report_reasons: ReportReason[] = raw.report_reasons.map((code) => ({
    code,
    label: REASON_LABELS[code] ?? code,
  }))

  const notification_templates: NotificationTemplate[] = Object.entries(
    raw.notification_templates
  ).map(([key, body]) => ({ key, body }))

  return {
    service_categories:     raw.service_categories,
    report_reasons,
    notification_templates,
    active_announcement:    raw.active_announcement,
  }
}

interface UseSettingsResult {
  data: PlatformSettings | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSettings(): UseSettingsResult {
  const [data, setData] = useState<PlatformSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    api
      .get<{ success: boolean; data: RawSettings }>('/admin/settings')
      .then((res) => { if (!cancelled) setData(normalise(res.data.data)) })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load settings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) }
}
