import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface ServiceCategoryPayload {
  name: string
  icon?: string
  is_active?: boolean
}

interface UseServiceCategoryActionResult {
  isSubmitting: boolean
  add: (
    payload: ServiceCategoryPayload,
    onSuccess: () => void
  ) => Promise<void>
  update: (
    id: number,
    payload: ServiceCategoryPayload,
    onSuccess: () => void
  ) => Promise<void>
  remove: (id: number, onSuccess: () => void) => Promise<void>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = err.response as { data?: { message?: string } }
    if (response?.data?.message) {
      return response.data.message
    }
  }

  return err instanceof Error ? err.message : fallback
}

export function useServiceCategoryAction(): UseServiceCategoryActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    add: async ({ name, icon, is_active = true }, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.post('/admin/settings/categories', {
          name,
          icon: icon?.trim() || null,
          is_active,
        })
        toast.success('Service category added.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to add category.'))
      } finally {
        setIsSubmitting(false)
      }
    },

    update: async (id, { name, icon, is_active }, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.patch(`/admin/settings/categories/${id}`, {
          name,
          icon: icon?.trim() || null,
          is_active,
        })
        toast.success('Service category updated.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update category.'))
      } finally {
        setIsSubmitting(false)
      }
    },

    remove: async (id, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.delete(`/admin/settings/categories/${id}`)
        toast.success('Service category deleted.')
        onSuccess()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete category.'))
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
