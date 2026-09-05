export type UserRole = 'client' | 'worker' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  barangay: string | null
  barangay_id?: number
  is_active: boolean
  created_at: string
  // Present on detail (GET /admin/users/:id), not in list
  mobile_number?: string
  profile_photo_path?: string | null
  is_google_account?: boolean
  email_verified_at?: string | null
  updated_at?: string
  deletion_requested_at?: string | null
  worker_profile?: {
    verification_status: string
    average_rating: number
    total_reviews: number
  }
}

export type RoleFilter = UserRole | 'all'
export type StatusFilter = 'active' | 'suspended' | 'all'

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
