import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'

interface UseJobPostActionResult {
  isSubmitting: boolean
  deletePost: (id: number, onSuccess: () => void) => Promise<void>
}

export function useJobPostAction(): UseJobPostActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function deletePost(id: number, onSuccess: () => void) {
    setIsSubmitting(true)
    try {
      await api.delete(`/admin/posts/${id}`)
      toast.success('Job post permanently deleted.')
      onSuccess()
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, deletePost }
}
