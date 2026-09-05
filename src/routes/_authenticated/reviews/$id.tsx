import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reviews/$id')({
  beforeLoad: () => {
    throw redirect({ to: '/reviews' })
  },
  component: () => null,
})
