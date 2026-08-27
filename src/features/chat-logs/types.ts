export type SenderRole = 'client' | 'worker'

export interface ChatMessage {
  id: string
  sender_name: string
  sender_role: SenderRole
  message: string
  sent_at: string
  is_flagged: boolean
}

export interface ChatLog {
  id: string
  booking_id: string
  booking_code: string
  client_name: string
  worker_name: string
  messages: ChatMessage[]
}
