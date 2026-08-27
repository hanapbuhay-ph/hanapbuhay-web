import { createFileRoute } from '@tanstack/react-router'
import { ReportsListPage } from '@/features/reports/list-page'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsListPage,
})
