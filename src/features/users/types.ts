export type UserRole = 'client' | 'worker' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  barangay: string
  is_active: boolean
  created_at: string
  // Optional — present on detail, not guaranteed in list
  mobile_number?: string
  is_google_account?: boolean
}

export type RoleFilter = UserRole | 'all'
export type StatusFilter = 'active' | 'suspended' | 'all'

// ── Deletion Requests ─────────────────────────────────────────────────────────

export type DeletionRequestStatus = 'pending' | 'approved' | 'denied'

export interface DeletionRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_role: UserRole
  reason: string
  status: DeletionRequestStatus
  requested_at: string
  processed_at: string | null
  admin_remarks: string | null
}
