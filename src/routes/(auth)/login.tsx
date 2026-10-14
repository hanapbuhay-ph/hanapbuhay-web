import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/login'
import { getToken } from '@/lib/auth'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  // If already authenticated, skip the login page
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/' })
    }
  },
  validateSearch: searchSchema,
  component: LoginPage,
})
