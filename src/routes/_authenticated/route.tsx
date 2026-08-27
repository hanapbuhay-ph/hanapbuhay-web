import { createFileRoute, redirect } from '@tanstack/react-router'
import { getToken } from '@/lib/auth'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: ({ location }) => {
    if (!getToken()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
