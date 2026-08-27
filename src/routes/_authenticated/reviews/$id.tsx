import { createFileRoute } from '@tanstack/react-router'
import { ReviewDetailPage } from '@/features/reviews/detail-page'

export const Route = createFileRoute('/_authenticated/reviews/$id')({
  component: function ReviewDetailRoute() {
    const { id } = Route.useParams()
    return <ReviewDetailPage id={id} />
  },
})
