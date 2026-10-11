import { createFileRoute } from '@tanstack/react-router'
import { JobPostDetailPage } from '@/features/job-posts/detail-page'
import { validateJobPostsSearch } from '@/features/job-posts/route-search'

export const Route = createFileRoute('/_authenticated/job-posts/$id')({
  validateSearch: validateJobPostsSearch,
  component: function JobPostDetailRoute() {
    const { id } = Route.useParams()
    const search = Route.useSearch()
    return <JobPostDetailPage id={id} returnSearch={search} />
  },
})
