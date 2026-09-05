import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface PostAnnouncementPayload {
  title: string
  body: string
  expires_at: string | null
}

interface UseAnnouncementActionResult {
  isSubmitting: boolean
  post: (payload: PostAnnouncementPayload, onSuccess: () => void) => Promise<void>
}

export function useAnnouncementAction(): UseAnnouncementActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    post: async ({ title, body, expires_at }, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.post('/admin/settings', {
          action: 'post_announcement',
          title,
          body,
          expires_at,
        })
        toast.success('Announcement posted.')
        onSuccess()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to post announcement.'
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
