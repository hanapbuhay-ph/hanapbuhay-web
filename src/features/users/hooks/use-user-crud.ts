import { useState } from 'react'
import { AxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { User } from '../types'

export interface UserInput {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  mobile_number?: string
  role: User['role']
  barangay_id?: number
}

interface UserCrudResponse {
  data?: { data?: { email_sent?: boolean } }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const validationErrors = error.response?.data?.errors as
      | Record<string, string[]>
      | undefined
    const firstError =
      validationErrors && Object.values(validationErrors)[0]?.[0]
    return firstError ?? error.response?.data?.message ?? error.message
  }

  return error instanceof Error
    ? error.message
    : 'Request failed. Please try again.'
}

export function useUserCrud(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  async function createUser(input: UserInput) {
    await submit(
      () => api.post('/admin/users', input),
      'User created successfully.'
    )
  }

  async function updateUser(id: number, input: UserInput) {
    await submit(
      () => api.patch(`/admin/users/${id}`, input),
      'User updated successfully.'
    )
  }

  async function deleteUser(id: number, reason: string) {
    await submit(
      () => api.delete(`/admin/users/${id}`, { data: { reason } }),
      'User deletion scheduled. The account will be deleted after 24 hours.'
    )
  }

  async function submit(
    request: () => Promise<UserCrudResponse>,
    successMessage: string
  ) {
    setIsSubmitting(true)
    try {
      const response = await request()
      const emailSent = response.data?.data?.email_sent
      if (emailSent === false) {
        toast.error(
          `${successMessage} The email could not be sent; check the API mail configuration.`
        )
      } else {
        toast.success(successMessage)
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error))
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, createUser, updateUser, deleteUser }
}
