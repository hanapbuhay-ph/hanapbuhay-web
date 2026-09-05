export type VerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resubmission_requested'

export type TrustTier = 'verified' | 'trusted' | 'flagged' | 'revoked'

export type DocumentType =
  | 'government_id'
  | 'barangay_certificate'
  | 'selfie_with_id'
  | 'skill_certificate'

export interface VerificationDocument {
  id: number
  type: DocumentType
  file_url: string
  status: string
}

export interface VerificationUser {
  id: number
  name: string
  email: string
  mobile_number?: string // present in real API (K2), absent in mock
  barangay: string
}

export interface VerificationHistoryEntry {
  id: number
  status: VerificationStatus | string
  remarks: string | null
  changed_at: string
  changed_by: string
}

export interface Verification {
  id: number | string
  worker_profile_id: number
  user: VerificationUser
  verification_status: VerificationStatus
  trust_tier?: TrustTier
  submitted_at: string
  documents: VerificationDocument[]
  history?: VerificationHistoryEntry[]
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  government_id: 'Government ID',
  barangay_certificate: 'Barangay Certificate',
  selfie_with_id: 'Selfie with ID',
  skill_certificate: 'Skill Certificate',
}

export const TRUST_TIER_LABELS: Record<TrustTier, string> = {
  verified: 'Verified',
  trusted: 'Trusted',
  flagged: 'Flagged',
  revoked: 'Revoked',
}

export const ALL_TRUST_TIERS: TrustTier[] = [
  'verified',
  'trusted',
  'flagged',
  'revoked',
]
