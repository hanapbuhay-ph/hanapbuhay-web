import { type UserRole } from '@/features/users/types'

export type ReviewStatus = 'visible' | 'flagged' | 'removed'

export interface Review {
  id: string
  booking_id: string
  booking_code: string
  reviewer_name: string
  reviewer_role: UserRole
  reviewed_name: string
  reviewed_role: UserRole
  rating: number // 1–5
  comment: string
  status: ReviewStatus
  is_flagged: boolean
  flagged_reason: string | null
  created_at: string
  flagged_at: string | null
  flagged_by: string | null
}

export type ReviewStatusFilter = ReviewStatus | 'all'

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  visible: 'Visible',
  flagged: 'Flagged',
  removed: 'Removed',
}
