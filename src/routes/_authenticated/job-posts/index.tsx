import { createFileRoute } from '@tanstack/react-router'
import { JobPostsListPage } from '@/features/job-posts/list-page'
import { validateJobPostsSearch } from '@/features/job-posts/route-search'

export const Route = createFileRoute('/_authenticated/job-posts/')({
  validateSearch: validateJobPostsSearch,
  component: function JobPostsListRoute() {
    const search = Route.useSearch()
    return <JobPostsListPage search={search} />
  },
})
