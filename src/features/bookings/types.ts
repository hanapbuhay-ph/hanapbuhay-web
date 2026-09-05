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
  id: number
  booking_code: string
  status: BookingStatus
  client: { id: number; name: string }
  worker: { id: number; name: string }
  service_category: { name: string }
  scheduled_at: string
  created_at: string
  // Present on detail only
  notes?: string | null
  started_at?: string | null
  completed_at?: string | null
  cancelled_by?: string | null
  cancellation_reason?: string | null
  updated_at?: string
}

export type BookingStatusFilter = BookingStatus | 'all'
