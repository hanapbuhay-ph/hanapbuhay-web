import { createFileRoute } from '@tanstack/react-router'
import { BookingsListPage } from '@/features/bookings/list-page'

export const Route = createFileRoute('/_authenticated/bookings/')({
  component: BookingsListPage,
})
