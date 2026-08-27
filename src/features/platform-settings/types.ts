// ── Service Categories ────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
}

export type ServiceCategoryPayload = Pick<
  ServiceCategory,
  'name' | 'description' | 'is_active'
>

// ── Report Reasons ────────────────────────────────────────────────────────────
//
// The 'code' field is read-only — it is set at creation and never changed by
// the admin panel. Only label, description, and is_active can be edited.

export interface ReportReason {
  id: number
  code: string
  label: string
  description: string
  is_active: boolean
}

export type ReportReasonPayload = Pick<
  ReportReason,
  'label' | 'description' | 'is_active'
>

// ── Notification Templates ────────────────────────────────────────────────────
//
// The 'key' field is read-only — it is a system identifier set at creation and
// never changed by the admin panel. Admins can only edit content and toggle
// active status.
//
// When the real API is ready, template body changes are sent to
// /api/admin/notification-templates/:id. The mobile app reads active templates
// to generate push/email/sms notifications. Deactivating a template suppresses
// that notification type platform-wide.

export type NotificationChannel = 'push' | 'email' | 'sms'

export interface NotificationTemplate {
  id: number
  key: string
  title: string
  channel: NotificationChannel
  subject: string | null
  body: string
  variables: string[]
  is_active: boolean
  last_updated_at: string
}

export type NotificationTemplatePayload = Pick<
  NotificationTemplate,
  'title' | 'channel' | 'subject' | 'body' | 'is_active' | 'last_updated_at'
>

// ── Announcements ─────────────────────────────────────────────────────────────
//
// Announcements are never deleted — archiving is the correct lifecycle action.
//
// When the real API is ready, published announcements are pushed to all target
// users via /api/admin/announcements. The mobile app displays active
// (published, not expired) announcements in the notification center.

export type AnnouncementTargetAudience = 'all' | 'clients' | 'workers'
export type AnnouncementStatus = 'draft' | 'published' | 'archived'

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

export type AnnouncementPayload = Pick<
  Announcement,
  | 'title'
  | 'body'
  | 'target_audience'
  | 'status'
  | 'published_at'
  | 'expires_at'
  | 'created_at'
>
