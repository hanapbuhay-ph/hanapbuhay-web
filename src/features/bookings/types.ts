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
  client: {
    id: number
    name: string
    email?: string | null
    mobile_number?: string | null
    barangay?: string | null
  }
  worker: {
    id: number
    name: string
    email?: string | null
    mobile_number?: string | null
    barangay?: string | null
  }
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
  job_post?: {
    id: number
    title: string
    description: string
    rate_amount: number
    rate_type: string
  } | null
  messages_count?: number
  reports_count?: number
  tracking_points_count?: number
}

export type BookingStatusFilter = BookingStatus | 'all'

export interface BookingPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}
