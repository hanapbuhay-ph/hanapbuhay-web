import { createFileRoute } from '@tanstack/react-router'
import { AccountLoginActivity } from '@/features/account/login-activity'

export const Route = createFileRoute(
  '/_authenticated/account/login-activity'
)({
  component: AccountLoginActivity,
})
