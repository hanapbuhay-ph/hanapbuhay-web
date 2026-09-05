import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface UseServiceCategoryActionResult {
  isSubmitting: boolean
  add: (payload: { name: string; icon: string }, onSuccess: () => void) => Promise<void>
}

export function useServiceCategoryAction(): UseServiceCategoryActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return {
    isSubmitting,

    add: async ({ name, icon }, onSuccess) => {
      setIsSubmitting(true)
      try {
        await api.post('/admin/settings', { action: 'add_category', name, icon })
        toast.success('Service category added.')
        onSuccess()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add category.')
      } finally {
        setIsSubmitting(false)
      }
    },
  }
}
