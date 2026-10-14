// Real API:
//   POST /admin/verifications/{workerProfileId}/review  → K3
//     body: { action: 'approve'|'reject'|'request_resubmission', admin_notes }
//   POST /admin/workers/{workerProfileId}/trust-tier    → K4
//     body: { trust_tier, remarks }
// The id passed to these actions is worker_profile_id, not the record id.

import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { type TrustTier } from '../types'

interface UseVerificationActionResult {
  isSubmitting: boolean
  approve: (workerProfileId: number | string, onSuccess: () => void) => Promise<void>
  reject: (
    workerProfileId: number | string,
    remarks: string,
    onSuccess: () => void
  ) => Promise<void>
  requestResubmission: (
    workerProfileId: number | string,
    remarks: string,
    onSuccess: () => void
  ) => Promise<void>
  changeTrustTier: (
    workerProfileId: number | string,
    tier: TrustTier,
    remarks: string,
    onSuccess: (tier: TrustTier) => void
  ) => Promise<void>
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
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Action failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,

    approve: (workerProfileId, onSuccess) =>
      runAction(
        () =>
          api.post(`/admin/verifications/${workerProfileId}/review`, {
            action: 'approve',
            admin_notes: 'Documents verified successfully.',
          }),
        'Worker verification approved.',
        onSuccess
      ),

    reject: (workerProfileId, remarks, onSuccess) =>
      runAction(
        () =>
          api.post(`/admin/verifications/${workerProfileId}/review`, {
            action: 'reject',
            admin_notes: remarks,
          }),
        'Worker verification rejected.',
        onSuccess
      ),

    requestResubmission: (workerProfileId, remarks, onSuccess) =>
      runAction(
        () =>
          api.post(`/admin/verifications/${workerProfileId}/review`, {
            action: 'request_resubmission',
            admin_notes: remarks,
          }),
        'Resubmission request sent.',
        onSuccess
      ),

    changeTrustTier: (workerProfileId, tier, remarks, onSuccess) =>
      runAction(
        () =>
          api.post(`/admin/workers/${workerProfileId}/trust-tier`, {
            trust_tier: tier,
            remarks,
          }),
        'Trust tier updated.',
        () => onSuccess(tier)
      ),
  }
}
