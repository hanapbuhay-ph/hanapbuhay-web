import { createFileRoute } from '@tanstack/react-router'
import { PlatformSettingsIndexPage } from '@/features/platform-settings/index-page'

export const Route = createFileRoute('/_authenticated/platform-settings/')({
  component: PlatformSettingsIndexPage,
})
