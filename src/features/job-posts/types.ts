export interface JobPost {
  id: number
  title: string
  rate_display: string
  is_active: boolean
  is_available: boolean
  deleted_at: string | null
  category: { id: number; name: string }
  worker: {
    id: number
    name: string
    barangay: string | null
    verification_status: string | null
  }
  created_at: string
}

export interface JobPostDetail extends JobPost {
  description: string
  rate_amount: number
  rate_type: string
  bookings_count: number
  images: {
    id: number
    image_url: string
    thumbnail_url: string | null
    display_order: number
  }[]
  worker: JobPost['worker'] & {
    email: string | null
    mobile_number: string | null
    profile_photo_url: string | null
    average_rating: number
    total_reviews: number
  }
}

export type JobPostStatusFilter = 'all' | 'active' | 'inactive'
export type JobPostVerificationFilter = 'all' | 'verified' | 'unverified'

export interface JobPostPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}
