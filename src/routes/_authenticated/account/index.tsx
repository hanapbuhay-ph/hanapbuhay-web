import { createFileRoute } from '@tanstack/react-router'
import { AccountProfile } from '@/features/account/profile'

export const Route = createFileRoute('/_authenticated/account/')({
  component: AccountProfile,
})
