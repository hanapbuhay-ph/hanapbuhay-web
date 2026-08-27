import { createFileRoute } from '@tanstack/react-router'
import { ReportDetailPage } from '@/features/reports/detail-page'

export const Route = createFileRoute('/_authenticated/reports/$id')({
  component: function ReportDetailRoute() {
    const { id } = Route.useParams()
    return <ReportDetailPage id={id} />
  },
})
