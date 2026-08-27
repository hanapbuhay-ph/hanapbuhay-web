import { createFileRoute } from '@tanstack/react-router'
import { VerificationDetailPage } from '@/features/verifications/detail-page'

export const Route = createFileRoute('/_authenticated/verifications/$id')({
  component: function VerificationDetailRoute() {
    const { id } = Route.useParams()
    return <VerificationDetailPage id={id} />
  },
})
