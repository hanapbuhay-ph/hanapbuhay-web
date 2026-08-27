import { createFileRoute } from '@tanstack/react-router'
import { BookingDetailPage } from '@/features/bookings/detail-page'

export const Route = createFileRoute('/_authenticated/bookings/$id')({
  component: function BookingDetailRoute() {
    const { id } = Route.useParams()
    return <BookingDetailPage id={id} />
  },
})
