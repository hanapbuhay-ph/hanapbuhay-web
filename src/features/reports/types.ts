export type ReportStatus = 'under_review' | 'resolved' | 'dismissed'

export type ReportReason =
  | 'no_show'
  | 'unsatisfactory_work'
  | 'misconduct'
  | 'non_payment'
  | 'unsafe_environment'
  | 'abusive_behavior'
  | 'false_information'
  | 'other'

export type ResolutionAction =
  | 'warning_issued'
  | 'account_suspended'
  | 'verification_revoked'
  | 'no_action'

export interface ReportParty {
  id: number
  name: string
}

export interface AdminReportSubmitter {
  id: number
  name: string
}

export interface Report {
  id: number
  booking: { id: number; booking_code: string }
  reporter: ReportParty
  reported_user: ReportParty
  submitted_by_admin?: AdminReportSubmitter | null
  reason: ReportReason
  description?: string
  status: ReportStatus
  evidence_urls: string[]
  created_at: string
  resolution_action?: ResolutionAction
  admin_notes?: string
  admin_remarks?: string
  resolved_by?: string | null
  resolved_at?: string | null
}

export type ReportStatusFilter = ReportStatus | 'all'

export type ReportReasonFilter = ReportReason | 'all'

export interface ReportPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ReportHistoryEntry {
  id: number
  action: string
  status: ReportStatus
  changed_at: string
  changed_by: string
  remarks?: string | null
}

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  under_review: 'Marked Under Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

export const REASON_LABELS: Record<ReportReason, string> = {
  no_show: 'No Show',
  unsatisfactory_work: 'Unsatisfactory Work',
  misconduct: 'Misconduct',
  non_payment: 'Non-Payment',
  unsafe_environment: 'Unsafe Environment',
  abusive_behavior: 'Abusive Behavior',
  false_information: 'False Information',
  other: 'Other',
}

export const RESOLUTION_ACTION_LABELS: Record<ResolutionAction, string> = {
  warning_issued: 'Warning Issued',
  account_suspended: 'Account Suspended',
  verification_revoked: 'Verification Revoked',
  no_action: 'No Action',
}
