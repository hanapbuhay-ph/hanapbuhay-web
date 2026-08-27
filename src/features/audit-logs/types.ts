export type AuditAction =
  | 'approved_worker_verification'
  | 'rejected_worker_verification'
  | 'suspended_user'
  | 'reactivated_user'
  | 'resolved_report'
  | 'force_cancelled_booking'
  | 'updated_trust_tier'

export interface AuditLog {
  id: string
  admin_name: string
  action: AuditAction | string // string fallback for unknown future actions
  target_type: string
  target_id: number | string
  details: Record<string, string | number>
  created_at: string
}

export type AuditActionFilter = AuditAction | 'all'

export const ACTION_LABELS: Record<AuditAction, string> = {
  approved_worker_verification: 'Approved Worker Verification',
  rejected_worker_verification: 'Rejected Worker Verification',
  suspended_user: 'Suspended User',
  reactivated_user: 'Reactivated User',
  resolved_report: 'Resolved Report',
  force_cancelled_booking: 'Force Cancelled Booking',
  updated_trust_tier: 'Updated Trust Tier',
}

export const ALL_ACTIONS = Object.keys(ACTION_LABELS) as AuditAction[]
