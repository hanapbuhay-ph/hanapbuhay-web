export type SenderRole = 'client' | 'worker'

export interface ChatMessage {
  id: string
  booking_code?: string
  sender_id: number
  sender_name: string
  sender_profile_photo_url?: string | null
  content: string
  attachment_url: string | null
  is_read: boolean
  created_at: string
  sender_role?: SenderRole
  is_flagged?: boolean
}

export interface Conversation {
  conversation_id: string
  client: {
    id: number
    name: string
    profile_photo_url: string | null
  }
  worker: {
    id: number
    name: string
    profile_photo_url: string | null
  }
  last_message: string | null
  last_message_at: string | null
  messages_count: number
  bookings_count: number
  unread_count: number
}

export interface ThreadResponse {
  conversation: {
    client: { id: number; name: string; profile_photo_url: string | null }
    worker: { id: number; name: string; profile_photo_url: string | null }
    bookings_count: number
  }
  messages: ChatMessage[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ChatPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}
