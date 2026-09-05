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
  name: string
  role: string
  trust_tier?: string
}

export interface Report {
  id: number
  booking_id: number
  booking_code: string
  filed_by: ReportParty
  reported_user: ReportParty
  reason: ReportReason
  description?: string
  status: ReportStatus
  evidence_urls: string[]
  created_at: string
  // Present on resolved/dismissed records
  resolution_action?: ResolutionAction
  admin_remarks?: string
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
