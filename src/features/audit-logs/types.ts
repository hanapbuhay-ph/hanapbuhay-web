export interface AuditLog {
  id: number
  admin: { id: number; name: string }
  action: string
  target_type: string
  target_id: number
  details: Record<string, string | number> | null
  ip_address: string | null
  created_at: string
}

export type AuditActionFilter = string | 'all'

export const ACTION_LABELS: Record<string, string> = {
  approved_worker_verification:  'Approved Worker Verification',
  rejected_worker_verification:  'Rejected Worker Verification',
  request_resubmission:          'Requested Resubmission',
  update_trust_tier:             'Updated Trust Tier',
  suspend_user:                  'Suspended User',
  reactivate_user:               'Reactivated User',
  process_deletion:              'Processed Account Deletion',
  resolve_report:                'Resolved Report',
  force_cancel_booking:          'Force Cancelled Booking',
  delete_job_post:               'Deleted Job Post',
  delete_rating:                 'Deleted Rating',
  create_category:               'Created Service Category',
  update_category:               'Updated Service Category',
  post_announcement:             'Posted Announcement',
}

export const ALL_ACTIONS = Object.keys(ACTION_LABELS)
