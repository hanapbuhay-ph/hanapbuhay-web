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

export type ReportHistoryAction =
  | 'report_filed'
  | 'report_resolved'
  | 'report_dismissed'
  | 'resolution_updated'

export interface ReportHistoryEntry {
  id: string
  action: ReportHistoryAction
  status: ReportStatus
  remarks: string | null
  changed_at: string
  changed_by: string
}

export const HISTORY_ACTION_LABELS: Record<ReportHistoryAction, string> = {
  report_filed: 'Report Filed',
  report_resolved: 'Report Resolved',
  report_dismissed: 'Report Dismissed',
  resolution_updated: 'Resolution Updated',
}

export interface Report {
  id: string
  booking_id: string
  booking_code: string
  reported_by: string
  reported_user: string
  reason: ReportReason
  description: string
  status: ReportStatus
  evidence_urls: string[]
  created_at: string
  // Present on resolved/dismissed records
  resolution_action?: ResolutionAction
  admin_remarks?: string
  // Audit trail — may be absent on older records
  history?: ReportHistoryEntry[]
}

export type ReportStatusFilter = ReportStatus | 'all'

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
