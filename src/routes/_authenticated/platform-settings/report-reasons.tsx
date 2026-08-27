import { createFileRoute } from '@tanstack/react-router'
import { ReportReasonsPage } from '@/features/platform-settings/report-reasons-page'

export const Route = createFileRoute(
  '/_authenticated/platform-settings/report-reasons'
)({
  component: ReportReasonsPage,
})
