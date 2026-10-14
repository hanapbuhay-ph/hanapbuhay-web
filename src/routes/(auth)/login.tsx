import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getToken } from '@/lib/auth'
import { LoginPage } from '@/features/auth/login'

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
