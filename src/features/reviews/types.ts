export interface Review {
  id: number
  booking: { id: number; booking_code: string }
  rated_by: { id: number; name: string; profile_photo_url?: string | null }
  rated_user: { id: number; name: string; profile_photo_url?: string | null }
  score: number // 1–5
  comment: string | null
  created_at: string
}

export interface ReviewRecipient {
  id: number
  name: string
  email: string
  role: 'client' | 'worker'
  barangay: string | null
  profile_photo_url?: string | null
  is_active: boolean
  reviews_received_count: number
  average_rating: number
}

export type ScoreFilter = 1 | 2 | 3 | 4 | 5 | 'all'
export type DirectionFilter = 'client_to_worker' | 'worker_to_client' | 'all'

export type ReviewStatus = 'visible' | 'flagged' | 'removed'

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  visible: 'Visible',
  flagged: 'Flagged',
  removed: 'Removed',
}

export interface ReviewPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}
