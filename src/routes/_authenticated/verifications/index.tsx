import { createFileRoute } from '@tanstack/react-router'
import { VerificationsListPage } from '@/features/verifications/list-page'

export const Route = createFileRoute('/_authenticated/verifications/')({
  component: VerificationsListPage,
})
