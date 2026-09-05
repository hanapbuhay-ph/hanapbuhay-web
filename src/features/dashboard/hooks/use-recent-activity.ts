// MISMATCH NOTE: The mock used GET /audit_logs and returned AuditLog[] (with
// admin_name, action, target_type, target_id, details fields).
// The real API returns recent_activity inside GET /admin/dashboard as:
//   { type: string, description: string, created_at: string }
// This hook now simply re-exports the type; data is sourced from useDashboard().

export interface RecentActivityItem {
  type: string
  description: string
  created_at: string
}
