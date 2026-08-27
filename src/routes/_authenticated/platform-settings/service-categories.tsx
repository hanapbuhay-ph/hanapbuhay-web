import { createFileRoute } from '@tanstack/react-router'
import { ServiceCategoriesPage } from '@/features/platform-settings/service-categories-page'

export const Route = createFileRoute(
  '/_authenticated/platform-settings/service-categories'
)({
  component: ServiceCategoriesPage,
})
