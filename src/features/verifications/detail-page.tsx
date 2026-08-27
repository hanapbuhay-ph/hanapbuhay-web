import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ApproveDialog } from './components/approve-dialog'
import { ChangeTrustTierDialog } from './components/change-trust-tier-dialog'
import { DocumentGrid } from './components/document-grid'
import { RejectDialog } from './components/reject-dialog'
import { ResubmissionDialog } from './components/resubmission-dialog'
import { StatusBadge } from './components/status-badge'
import { TrustTierBadge } from './components/trust-tier-badge'
import { VerificationHistory } from './components/verification-history'
import { useVerification } from './hooks/use-verification'
import { useVerificationAction } from './hooks/use-verification-action'
import { type TrustTier } from './types'

interface VerificationDetailPageProps {
  id: string
}

export function VerificationDetailPage({ id }: VerificationDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useVerification(id)
  const {
    isSubmitting,
    approve,
    reject,
    requestResubmission,
    changeTrustTier,
  } = useVerificationAction()

  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showResubmission, setShowResubmission] = useState(false)
  const [showTrustTier, setShowTrustTier] = useState(false)

  // Local trust tier — updates in place after a successful change
  const [localTrustTier, setLocalTrustTier] = useState<TrustTier | undefined>(
    undefined
  )
  const currentTier = localTrustTier ?? data?.trust_tier

  function goBack() {
    navigate({ to: '/verifications' })
  }

  function handleApproveConfirm() {
    if (!data) return
    approve(data.id, () => {
      setShowApprove(false)
      goBack()
    })
  }

  function handleRejectConfirm(remarks: string) {
    if (!data) return
    reject(data.id, remarks, () => {
      setShowReject(false)
      goBack()
    })
  }

  function handleResubmissionConfirm(remarks: string) {
    if (!data) return
    requestResubmission(data.id, remarks, () => {
      setShowResubmission(false)
      goBack()
    })
  }

  function handleTrustTierConfirm(tier: TrustTier, remarks: string) {
    if (!data) return
    changeTrustTier(data.id, tier, remarks, (updated) => {
      setLocalTrustTier(updated)
      setShowTrustTier(false)
    })
  }

  const isPending = data?.verification_status === 'pending'

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back button + title */}
        <div className='mb-6 flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={goBack}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Verification Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              Review worker documents and take action.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <DetailSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
            <p className='text-sm font-semibold text-foreground'>
              Failed to load verification
            </p>
            <p className='text-xs text-muted-foreground'>{error}</p>
            <Button
              size='sm'
              variant='outline'
              onClick={refetch}
              className='mt-1 border-border text-primary hover:bg-primary/5'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Retry
            </Button>
          </div>
        )}

        {/* Data */}
        {!isLoading && !error && data && (
          <div className='flex flex-col gap-5'>
            {/* ── Worker info card ──────────────────────────────────── */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <CardTitle className='text-lg text-foreground'>
                    {data.user.name}
                  </CardTitle>
                  <StatusBadge status={data.verification_status} />
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                <InfoRow icon={Mail} label={data.user.email} />
                <InfoRow icon={MapPin} label={data.user.barangay} />
                <InfoRow
                  icon={Calendar}
                  label={`Submitted ${format(new Date(data.submitted_at), 'MMMM d, yyyy · h:mm a')}`}
                />

                {/* ── Trust Tier row (Feature 3) ─────────────────── */}
                <div className='mt-1 flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 shrink-0 text-primary' />
                  <span className='text-sm text-muted-foreground'>
                    Trust Tier:
                  </span>
                  {currentTier ? (
                    <TrustTierBadge tier={currentTier} />
                  ) : (
                    <span className='text-xs text-muted-foreground'>
                      Not set
                    </span>
                  )}
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => setShowTrustTier(true)}
                    disabled={isSubmitting}
                    className='h-6 px-2 text-xs text-primary hover:bg-primary/10'
                  >
                    <Pencil className='h-3 w-3' />
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── Documents card ────────────────────────────────────── */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <CardTitle className='text-base text-foreground'>
                  Submitted Documents ({data.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentGrid documents={data.documents} />
              </CardContent>
            </Card>

            {/* ── Verification History (Feature 2) ─────────────────── */}
            <VerificationHistory history={data.history} />

            {/* ── Action buttons — only for pending (Features 1 + existing) */}
            {isPending && (
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Button
                  onClick={() => setShowApprove(true)}
                  disabled={isSubmitting}
                  className='bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                >
                  <CheckCircle2 className='h-4 w-4' />
                  Approve
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowReject(true)}
                  disabled={isSubmitting}
                  className='border-destructive text-destructive hover:bg-destructive/5'
                >
                  <XCircle className='h-4 w-4' />
                  Reject
                </Button>
                {/* Feature 1 — Request Resubmission */}
                <Button
                  variant='outline'
                  onClick={() => setShowResubmission(true)}
                  disabled={isSubmitting}
                  className='border-amber-400 text-amber-600 hover:bg-amber-50'
                >
                  <RotateCcw className='h-4 w-4' />
                  Request Resubmission
                </Button>
              </div>
            )}
          </div>
        )}
      </Main>

      {/* Dialogs */}
      {data && (
        <>
          <ApproveDialog
            open={showApprove}
            workerName={data.user.name}
            isSubmitting={isSubmitting}
            onConfirm={handleApproveConfirm}
            onCancel={() => setShowApprove(false)}
          />
          <RejectDialog
            open={showReject}
            workerName={data.user.name}
            isSubmitting={isSubmitting}
            onConfirm={handleRejectConfirm}
            onCancel={() => setShowReject(false)}
          />
          <ResubmissionDialog
            open={showResubmission}
            workerName={data.user.name}
            isSubmitting={isSubmitting}
            onConfirm={handleResubmissionConfirm}
            onCancel={() => setShowResubmission(false)}
          />
          {/* Trust tier dialog — always available regardless of status */}
          <ChangeTrustTierDialog
            open={showTrustTier}
            workerName={data.user.name}
            currentTier={currentTier ?? 'verified'}
            isSubmitting={isSubmitting}
            onConfirm={handleTrustTierConfirm}
            onCancel={() => setShowTrustTier(false)}
          />
        </>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      <Icon className='h-4 w-4 shrink-0 text-primary' />
      <span>{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-56' />
          <Skeleton className='h-4 w-36' />
        </CardContent>
      </Card>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader>
          <Skeleton className='h-5 w-36' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex flex-col gap-1.5'>
                <Skeleton className='aspect-[4/3] w-full rounded-2xl' />
                <Skeleton className='h-3 w-20' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className='h-14 w-full rounded-2xl' />
    </div>
  )
}
