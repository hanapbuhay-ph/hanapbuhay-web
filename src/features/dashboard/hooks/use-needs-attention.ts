// MISMATCH NOTE: The mock made 5 separate GET calls to /verifications, /reports,
// /reviews, /deletion_requests. The real API provides pending_verifications and
// open_disputes directly in GET /admin/dashboard. Other counts (resubmission,
// flagged reviews, pending deletions) are not in the dashboard endpoint — they
// are set to null until dedicated endpoints are wired up.

import { type DashboardStats } from './use-dashboard'

export interface NeedsAttentionData {
  pendingVerifications: number | null
  resubmissionRequested: number | null
  underReviewReports: number | null
  flaggedReviews: number | null
  pendingDeletions: number | null
}

export function deriveNeedsAttention(stats: DashboardStats | null): NeedsAttentionData {
  return {
    pendingVerifications: stats?.pending_verifications ?? null,
    resubmissionRequested: null, // not in dashboard endpoint
    underReviewReports: stats?.open_disputes ?? null,
    flaggedReviews: null,        // not in dashboard endpoint
    pendingDeletions: null,      // not in dashboard endpoint
  }
}
