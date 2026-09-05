export interface JobPost {
  id: number
  title: string
  rate_display: string
  is_active: boolean
  is_available: boolean
  deleted_at: string | null
  category: { id: number; name: string }
  worker: { id: number; name: string }
  created_at: string
}
