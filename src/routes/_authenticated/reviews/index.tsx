import { createFileRoute } from '@tanstack/react-router'
import { ReviewsListPage } from '@/features/reviews/list-page'

export const Route = createFileRoute('/_authenticated/reviews/')({
  component: ReviewsListPage,
})
