// When the real API is ready, POST/PUT/PATCH here maps to
// /api/admin/service-categories.
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type ServiceCategory, type ServiceCategoryPayload } from '../types'

interface UseServiceCategoryActionResult {
  isSubmitting: boolean
  add: (
    payload: ServiceCategoryPayload,
    onSuccess: (created: ServiceCategory) => void
  ) => Promise<void>
  edit: (
    id: number,
    payload: ServiceCategoryPayload,
    onSuccess: (updated: ServiceCategory) => void
  ) => Promise<void>
  toggle: (
    current: ServiceCategory,
    onSuccess: (updated: ServiceCategory) => void
  ) => Promise<void>
}

export function useServiceCategoryAction(): UseServiceCategoryActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function add(
    payload: ServiceCategoryPayload,
    onSuccess: (created: ServiceCategory) => void
  ) {
    setIsSubmitting(true)
    try {
      const res = await api.post<ServiceCategory>('/service_categories', payload)
      toast.success('Service category added.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function edit(
    id: number,
    payload: ServiceCategoryPayload,
    onSuccess: (updated: ServiceCategory) => void
  ) {
    setIsSubmitting(true)
    try {
      // Read-then-merge: fetch current record first to preserve all fields
      const current = await api.get<ServiceCategory>(`/service_categories/${id}`)
      const merged = { ...current.data, ...payload }
      const res = await api.put<ServiceCategory>(`/service_categories/${id}`, merged)
      toast.success('Service category updated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggle(
    current: ServiceCategory,
    onSuccess: (updated: ServiceCategory) => void
  ) {
    setIsSubmitting(true)
    const newValue = !current.is_active
    try {
      const res = await api.patch<ServiceCategory>(
        `/service_categories/${current.id}`,
        { is_active: newValue }
      )
      toast.success(newValue ? 'Category activated.' : 'Category deactivated.')
      onSuccess(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, add, edit, toggle }
}
