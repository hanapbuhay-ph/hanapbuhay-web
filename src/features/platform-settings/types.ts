// ── Service Categories ────────────────────────────────────────────────────────
// Shape from GET /api/admin/settings → service_categories[]
// and POST /api/admin/settings { action: 'add_category' }

export interface ServiceCategory {
  id: number
  name: string
  icon: string
  is_active?: boolean
  description?: string
}

export interface ServiceCategoryPayload {
  name: string
  description?: string
  is_active: boolean
  icon?: string
}

// ── Report Reasons ────────────────────────────────────────────────────────────
// Admin-maintained master list of report reasons users can select when filing a report.

export interface ReportReason {
  id?: number
  code: string
  label: string
  description?: string
  is_active?: boolean
  audience: 'client' | 'worker'
}

export interface ReportReasonPayload {
  code?: string
  label: string
  description?: string
  is_active: boolean
  audience: 'client' | 'worker'
}

// ── Notification Templates ────────────────────────────────────────────────────
// The real API currently returns a record of template keys to bodies.
// The hook normalises that into this display shape.

export type NotificationChannel = 'push' | 'email' | 'sms'

export interface NotificationTemplate {
  id?: number
  key: string
  body: string
  title?: string
  channel?: NotificationChannel
  subject?: string | null
  is_active?: boolean
  variables?: string[]
  last_updated_at?: string
}

export interface NotificationTemplatePayload {
  title: string
  channel: NotificationChannel
  subject: string | null
  body: string
  is_active: boolean
  last_updated_at?: string
}

// ── Announcements ──────────────────────────────────────────────────────────────
// Current API contract includes a single active announcement object and
// announcement payloads for create/edit flows.

export type AnnouncementStatus = 'draft' | 'published' | 'archived'
export type AnnouncementTargetAudience = 'all' | 'clients' | 'workers'

export interface Announcement {
  id: number
  title: string
  body: string
  target_audience: AnnouncementTargetAudience
  status: AnnouncementStatus
  published_at: string | null
  expires_at: string | null
  created_at: string
}

export interface AnnouncementPayload {
  title: string
  body: string
  target_audience: AnnouncementTargetAudience
  status: AnnouncementStatus
  published_at: string | null
  expires_at: string | null
  created_at: string
}

export interface ActiveAnnouncement {
  id: number
  title: string
  body: string
  expires_at: string | null
  posted_at?: string
}

// ── Settings response ─────────────────────────────────────────────────────────

export interface PlatformSettings {
  service_categories: ServiceCategory[]
  report_reasons: ReportReason[]
  notification_templates: NotificationTemplate[]
  active_announcement: ActiveAnnouncement | null
}
