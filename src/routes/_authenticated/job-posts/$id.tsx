import { createFileRoute } from '@tanstack/react-router'
import { JobPostDetailPage } from '@/features/job-posts/detail-page'

export const Route = createFileRoute('/_authenticated/job-posts/$id')({
  component: function JobPostDetailRoute() {
    const { id } = Route.useParams()
    return <JobPostDetailPage id={id} />
  },
})
