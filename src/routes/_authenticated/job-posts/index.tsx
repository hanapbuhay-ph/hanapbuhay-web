import { createFileRoute } from '@tanstack/react-router'
import { JobPostsListPage } from '@/features/job-posts/list-page'

export const Route = createFileRoute('/_authenticated/job-posts/')({
  component: JobPostsListPage,
})
