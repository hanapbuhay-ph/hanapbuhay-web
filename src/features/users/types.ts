export type UserRole = 'client' | 'worker' | 'admin' | 'super_admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  barangay: string | null
  barangay_id?: number
  worker_profile_id?: number | null
  is_active: boolean
  pending_admin_action?: {
    id: number
    action: 'delete' | 'suspend'
    reason: string
    scheduled_for: string
  } | null
  created_at: string
  profile_photo_url?: string | null
  // Present on detail (GET /admin/users/:id), not in list
  mobile_number?: string
  profile_photo_path?: string | null
  is_google_account?: boolean
  email_verified_at?: string | null
  updated_at?: string
  last_seen_at?: string | null
  deletion_requested_at?: string | null
  two_factor_enabled?: boolean
  notification_preferences?: {
    booking_updates: boolean
    messages: boolean
    promotions: boolean
    push: boolean
    email: boolean
  }
  worker_profile?: {
    bio: string | null
    verification_status: string
    trust_tier: string | null
    availability_status: string
    average_rating: number
    total_reviews: number
    completed_jobs: number
    verification_remarks: string | null
    verified_at: string | null
    verified_by: { id: number; name: string } | null
    created_at: string | null
    updated_at: string | null
    service_categories: { id: number; name: string }[]
    job_posts: {
      id: number
      title: string
      description: string
      service_category: string | null
      rate_amount: number
      rate_type: string
      rate_display: string
      is_available: boolean
      is_active: boolean
      deleted_at: string | null
      created_at: string | null
      images: { image_url: string | null; thumbnail_url: string | null }[]
    }[]
  }
  activity?: {
    bookings: {
      total: number
      by_status: Record<string, number>
      pagination: ActivityPagination
      recent: {
        id: number
        booking_code: string
        status: string
        scheduled_at: string | null
        service_category: string | null
        other_party: { id: number | null; name: string | null }
      }[]
    }
    reviews_received_count: number
    reviews_given_count: number
    reviews_received_pagination: ActivityPagination
    reviews_given_pagination: ActivityPagination
    recent_reviews_received: {
      id: number
      booking_code: string | null
      from: string | null
      score: number
      comment: string | null
      created_at: string | null
    }[]
    recent_reviews_given: {
      id: number
      booking_code: string | null
      to: string | null
      score: number
      comment: string | null
      created_at: string | null
    }[]
  }
}

export interface ActivityPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ActivityPage<T> {
  items: T[]
  pagination: ActivityPagination
}

export type RoleFilter = UserRole | 'all'
export type StatusFilter = 'active' | 'suspended' | 'all'
export type DeletionRequestStatus = 'pending' | 'approved' | 'denied'

export interface UserPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

// ── Deletion Requests ─────────────────────────────────────────────────────────
// Real API returns users (not a separate DeletionRequest object).
// GET /admin/deletion-requests → { data: { users: DeletionUser[], pagination } }

export interface DeletionUser {
  id: number
  name: string
  email: string
  role: UserRole
  barangay: string | null
  deletion_requested_at: string
  created_at: string
}
