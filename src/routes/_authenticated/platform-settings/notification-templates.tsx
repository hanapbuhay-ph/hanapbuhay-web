import { createFileRoute } from '@tanstack/react-router'
import { NotificationTemplatesPage } from '@/features/platform-settings/notification-templates-page'

export const Route = createFileRoute(
  '/_authenticated/platform-settings/notification-templates'
)({
  component: NotificationTemplatesPage,
})
