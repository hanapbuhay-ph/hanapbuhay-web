import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type TrustTier, type Verification } from '../types'

interface UseVerificationActionResult {
  isSubmitting: boolean
  approve: (id: number | string, onSuccess: () => void) => Promise<void>
  reject: (
    id: number | string,
    remarks: string,
    onSuccess: () => void
  ) => Promise<void>
  requestResubmission: (
    id: number | string,
    remarks: string,
    onSuccess: () => void
  ) => Promise<void>
  changeTrustTier: (
    id: number | string,
    tier: TrustTier,
    remarks: string,
    onSuccess: (tier: TrustTier) => void
  ) => Promise<void>
}

/**
 * json-server uses full-replacement semantics on PUT.
 * We must fetch the current record first, merge our changes
 * into it, then PUT the complete object back.
 */
async function mergedPut(
  id: number | string,
  changes: Partial<Verification> & Record<string, unknown>
): Promise<void> {
  const current = await api.get<Verification>(`/verifications/${id}`)
  const merged = { ...current.data, ...changes }
  await api.put(`/verifications/${id}`, merged)
}

export function useVerificationAction(): UseVerificationActionResult {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function runAction(
    action: () => Promise<void>,
    successMessage: string,
    onSuccess: () => void
  ): Promise<void> {
    setIsSubmitting(true)
    try {
      await action()
      toast.success(successMessage)
      onSuccess()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,

    approve: (id, onSuccess) =>
      runAction(
        () => mergedPut(id, { verification_status: 'approved' }),
        'Worker verification approved.',
        onSuccess
      ),

    reject: (id, remarks, onSuccess) =>
      runAction(
        () => mergedPut(id, { verification_status: 'rejected', remarks }),
        'Worker verification rejected.',
        onSuccess
      ),

    requestResubmission: (id, remarks, onSuccess) =>
      runAction(
        () =>
          mergedPut(id, {
            verification_status: 'resubmission_requested',
            remarks,
          }),
        'Resubmission request sent.',
        onSuccess
      ),

    changeTrustTier: (id, tier, remarks, onSuccess) =>
      runAction(
        () => mergedPut(id, { trust_tier: tier, remarks }),
        'Trust tier updated.',
        () => onSuccess(tier)
      ),
  }
}
