export type AdminNotification = {
  id: number
  type: string
  title: string
  body: string
  data: { url?: string } | null
  is_read: boolean
  created_at: string
}

export type AdminNotificationPage = {
  notifications: AdminNotification[]
  unread_count: number
  pagination: {
    next_cursor: string | null
    has_more: boolean
  }
}
