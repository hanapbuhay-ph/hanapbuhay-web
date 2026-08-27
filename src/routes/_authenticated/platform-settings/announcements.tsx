import { createFileRoute } from '@tanstack/react-router'
import { AnnouncementsPage } from '@/features/platform-settings/announcements-page'

export const Route = createFileRoute(
  '/_authenticated/platform-settings/announcements'
)({
  component: AnnouncementsPage,
})
