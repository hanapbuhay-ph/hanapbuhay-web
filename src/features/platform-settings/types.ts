// ── Service Categories ────────────────────────────────────────────────────────
// Shape from GET /api/admin/settings → service_categories[]
// and POST /api/admin/settings { action: 'add_category' }

export interface ServiceCategory {
  id: number
  name: string
  icon: string
}

// ── Report Reasons ────────────────────────────────────────────────────────────
// Read-only from GET /api/admin/settings → report_reasons[]
// No mutation actions exist in the real API (K17).

export interface ReportReason {
  code: string
  label: string
}

// ── Notification Templates ────────────────────────────────────────────────────
// Read-only from GET /api/admin/settings → notification_templates[]
// No mutation actions exist in the real API (K17).

export interface NotificationTemplate {
  key: string
  body: string
}

// ── Announcement ──────────────────────────────────────────────────────────────
// active_announcement from GET /api/admin/settings is a single object (or null).
// POST /api/admin/settings { action: 'post_announcement' } creates a new one.

export interface ActiveAnnouncement {
  title: string
  body: string
  expires_at: string | null
}

// ── Settings response ─────────────────────────────────────────────────────────

export interface PlatformSettings {
  service_categories: ServiceCategory[]
  report_reasons: ReportReason[]
  notification_templates: NotificationTemplate[]
  active_announcement: ActiveAnnouncement | null
}
