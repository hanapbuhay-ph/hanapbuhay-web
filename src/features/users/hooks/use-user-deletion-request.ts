// The real API does not have a per-user deletion request endpoint.
// Deletion status is indicated by deletion_requested_at on the User object
// returned by GET /admin/users/:id.
// This hook is kept as a thin compatibility shim — it reads from the user object
// passed in rather than making a separate API call.

import { type User } from '../types'

interface UseUserDeletionRequestResult {
  hasPendingDeletion: boolean
  requestedAt: string | null
}

export function useUserDeletionRequest(user: User | null): UseUserDeletionRequestResult {
  return {
    hasPendingDeletion: user?.deletion_requested_at != null,
    requestedAt: user?.deletion_requested_at ?? null,
  }
}
