export interface Review {
  id: number
  booking_code: string
  rated_by_name: string
  rated_user_name: string
  score: number // 1–5
  comment: string | null
  created_at: string
}

export type ScoreFilter = 1 | 2 | 3 | 4 | 5 | 'all'
export type DirectionFilter = 'client_to_worker' | 'worker_to_client' | 'all'
