import { createFileRoute } from '@tanstack/react-router'
import { NotificationsListPage } from '@/features/notifications/list-page'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsListPage,
})
