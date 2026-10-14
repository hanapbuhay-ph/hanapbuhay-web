import { useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface UseJobPostActionResult {
  isSubmitting: boolean
  deletePost: (
    id: number,
    reason: string,
    onSuccess: () => void
  ) => Promise<void>
  deletePosts: (
    ids: number[],
    reason: string,
    onSuccess: () => void
  ) => Promise<void>
}

export function useJobPostAction(): UseJobPostActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function deletePost(id: number, reason: string, onSuccess: () => void) {
    setIsSubmitting(true)
    try {
      await api.delete(`/admin/posts/${id}`, { data: { reason } })
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

  async function deletePosts(
    ids: number[],
    reason: string,
    onSuccess: () => void
  ) {
    setIsSubmitting(true)
    try {
      await api.delete('/admin/posts/bulk', {
        data: { post_ids: ids, reason },
      })
      toast.success(
        `${ids.length} job post${ids.length === 1 ? '' : 's'} permanently deleted.`
      )
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

  return { isSubmitting, deletePost, deletePosts }
}
