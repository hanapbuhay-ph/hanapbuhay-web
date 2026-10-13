import { useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export function useAuditLogAction(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function deleteLog(id: number) {
    setIsSubmitting(true)
    try {
      await api.delete(`/admin/audit-logs/${id}`)
      toast.success('Audit log deleted.')
      onSuccess()
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : 'Unable to delete audit log.'
      toast.error(message)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteAllLogs() {
    setIsSubmitting(true)
    try {
      const response = await api.delete<{ data?: { deleted_count?: number } }>(
        '/admin/audit-logs'
      )
      toast.success(
        `${response.data.data?.deleted_count ?? 0} audit and security logs deleted.`
      )
      onSuccess()
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : 'Unable to delete audit logs.'
      toast.error(message)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return { deleteLog, deleteAllLogs, isSubmitting }
}
