export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'declined'

/** Statuses where the admin Force Cancel action is allowed */
export const CANCELLABLE_STATUSES: BookingStatus[] = [
  'pending',
  'accepted',
  'active',
]

export interface Booking {
  id: string
  booking_code: string
  status: BookingStatus
  client: string
  worker: string
  service_category: string
  scheduled_at: string
  created_at: string
  // Optional — present on detail, not guaranteed in list
  notes?: string
}

export type BookingStatusFilter = BookingStatus | 'all'
