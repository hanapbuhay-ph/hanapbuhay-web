import { createFileRoute } from '@tanstack/react-router'
import { ReportAnalyticsPage } from '@/features/report-analytics'

export const Route = createFileRoute('/_authenticated/report-analytics/')({
  component: ReportAnalyticsPage,
})
