export type SenderRole = 'client' | 'worker'

export interface ChatMessage {
  id: string
  sender_id: number
  sender_name: string
  content: string
  attachment_url: string | null
  is_read: boolean
  created_at: string
  sender_role?: SenderRole
  is_flagged?: boolean
}

export interface Conversation {
  booking_id: number
  booking_code: string
  booking_status: string
  other_party: {
    id: number
    name: string
    profile_photo_url: string | null
  }
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export interface ThreadResponse {
  booking: {
    id: number
    booking_code: string
    status: string
  }
  messages: ChatMessage[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
