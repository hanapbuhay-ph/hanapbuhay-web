export interface AuditLog {
  id: number
  admin: { id: number | null; name: string; email: string | null }
  category: 'admin_activity' | 'security'
  outcome: 'success' | 'failure' | null
  action: string
  target_type: string | null
  target_id: number | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type AuditActionFilter = string | 'all'

export interface AuditPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const ACTION_LABELS: Record<string, string> = {
  login: 'Login',
  google_login: 'Google Login',
  google_login_otp_challenge: 'Google Login OTP Challenge',
  login_otp_challenge: 'Login OTP Challenge',
  login_otp_verification: 'Login OTP Verification',
  password_change: 'Password Change',
  password_reset: 'Password Reset',
  password_reset_otp_verified: 'Password Reset OTP Verification',
  user_role_changed: 'User Role Changed',
  user_password_changed_by_admin: 'User Password Changed by Admin',
  user_suspended: 'User Suspended',
  user_reactivated: 'User Reactivated',
  user_deleted_by_admin: 'User Deleted by Admin',
  protected_account_change_denied: 'Protected Account Change Denied',
  protected_account_status_change_denied:
    'Protected Account Status Change Denied',
  protected_account_deletion_denied: 'Protected Account Deletion Denied',
  create_user: 'Created User',
  update_user: 'Updated User',
  delete_user: 'Deleted User',
  user_suspend: 'Suspended User',
  user_reactivate: 'Reactivated User',
  create_booking_for_client: 'Created Booking for Client',
  reschedule_booking: 'Rescheduled Booking',
  review_verification: 'Reviewed Worker Verification',
  resolve_report: 'Resolved Report',
  process_account_deletion: 'Processed Account Deletion',
  delete_announcement: 'Deleted Announcement',
  create_announcement: 'Created Announcement',
  update_announcement: 'Updated Announcement',
  create_job_post: 'Created Job Post',
  update_job_post: 'Updated Job Post',
  create_report_reason: 'Created Report Reason',
  update_report_reason: 'Updated Report Reason',
  delete_report_reason: 'Deleted Report Reason',
  delete_category: 'Deleted Service Category',
  approve_verification: 'Approved Worker Verification',
  reject_verification: 'Rejected Worker Verification',
  approved_worker_verification: 'Approved Worker Verification',
  rejected_worker_verification: 'Rejected Worker Verification',
  request_resubmission: 'Requested Resubmission',
  update_trust_tier: 'Updated Trust Tier',
  suspend_user: 'Suspended User',
  reactivate_user: 'Reactivated User',
  process_account_deletion: 'Processed Account Deletion',
  process_deletion: 'Processed Account Deletion',
  resolve_report: 'Resolved Report',
  force_cancel_booking: 'Force Cancelled Booking',
  delete_job_post: 'Deleted Job Post',
  delete_rating: 'Deleted Rating',
  create_category: 'Created Service Category',
  update_category: 'Updated Service Category',
  post_announcement: 'Posted Announcement',
  user_suspend: 'Suspended User',
  user_reactivate: 'Reactivated User',
}

export const ALL_ACTIONS = Object.keys(ACTION_LABELS)
