import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Hash,
  User,
  UserX,
  Flag,
  FileText,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  MessageSquareText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DismissDialog } from './components/dismiss-dialog'
import { EvidenceGrid } from './components/evidence-grid'
import { ReportStatusBadge } from './components/report-status-badge'
import { ResolveDialog } from './components/resolve-dialog'
import { useReport } from './hooks/use-report'
import { useReportAction } from './hooks/use-report-action'
import {
  REASON_LABELS,
  RESOLUTION_ACTION_LABELS,
  type ResolutionAction,
} from './types'

interface ReportDetailPageProps {
  id: string
}

export function ReportDetailPage({ id }: ReportDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useReport(id)
  const { isSubmitting, resolve, dismiss } = useReportAction()
  const [showResolve, setShowResolve] = useState(false)
  const [showDismiss, setShowDismiss] = useState(false)

  const isActionable = data?.status === 'under_review'

  function handleResolveConfirm(
    resolutionAction: ResolutionAction,
    adminRemarks: string
  ) {
    if (!data) return
    resolve(
      data.id,
      { resolution_action: resolutionAction, admin_remarks: adminRemarks },
      () => {
        setShowResolve(false)
        refetch()
      }
    )
  }

  function handleDismissConfirm(adminRemarks: string) {
    if (!data) return
    dismiss(data.id, { admin_remarks: adminRemarks }, () => {
      setShowDismiss(false)
      refetch()
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back + title */}
        <div className='mb-6 flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate({ to: '/reports' })}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Report Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              Review evidence and take action.
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
              Failed to load report
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
            {/* Report info card */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <CardTitle className='font-mono text-lg text-foreground'>
                    {data.booking_code}
                  </CardTitle>
                  <ReportStatusBadge status={data.status} />
                </div>
              </CardHeader>

              <CardContent className='flex flex-col gap-2'>
                <InfoRow
                  icon={User}
                  label={`Reported by: ${data.filed_by.name} (${data.filed_by.role})`}
                />
                <InfoRow
                  icon={UserX}
                  label={`Reported user: ${data.reported_user.name} (${data.reported_user.role})`}
                />
                <InfoRow
                  icon={Flag}
                  label={`Reason: ${REASON_LABELS[data.reason] ?? data.reason}`}
                />
                <InfoRow
                  icon={FileText}
                  label={`Description: ${data.description}`}
                />
                <InfoRow
                  icon={Clock}
                  label={`Submitted: ${format(new Date(data.created_at), 'MMMM d, yyyy · h:mm a')}`}
                />
                <InfoRow icon={Hash} label={`Report ID: ${data.id}`} />

                {/* Resolution info — shown on resolved/dismissed */}
                {data.resolution_action && (
                  <InfoRow
                    icon={ShieldAlert}
                    label={`Action taken: ${RESOLUTION_ACTION_LABELS[data.resolution_action]}`}
                  />
                )}
                {data.admin_remarks && (
                  <InfoRow
                    icon={FileText}
                    label={`Admin remarks: ${data.admin_remarks}`}
                  />
                )}

                {/* View Chat Log — links to the conversation for this booking */}
                {data.booking_id && (
                  <div className='mt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        navigate({
                          to: '/chat-logs/$id',
                          params: { id: String(data.booking_id) },
                          search: { from: `/reports/${data.id}` },
                        })
                      }
                      className='border-border text-primary hover:bg-primary/5'
                    >
                      <MessageSquareText className='h-4 w-4' />
                      View Chat Log
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence card */}
            <Card
              className='rounded-2xl border-border bg-card'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <CardHeader className='pb-3'>
                <CardTitle className='text-base text-foreground'>
                  Evidence ({data.evidence_urls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceGrid urls={data.evidence_urls} />
              </CardContent>
            </Card>

            {/* Actions — only for under_review */}
            {isActionable && (
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Button
                  onClick={() => setShowResolve(true)}
                  disabled={isSubmitting}
                  className='bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                >
                  <CheckCircle2 className='h-4 w-4' />
                  Resolve
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowDismiss(true)}
                  disabled={isSubmitting}
                  className='border-border text-muted-foreground hover:bg-muted/50'
                >
                  <XCircle className='h-4 w-4' />
                  Dismiss
                </Button>
              </div>
            )}

            {/* Resolution History — removed: not returned by real API */}
          </div>
        )}
      </Main>

      {/* Dialogs */}
      {data && (
        <>
          <ResolveDialog
            open={showResolve}
            bookingCode={data.booking_code}
            isSubmitting={isSubmitting}
            onConfirm={handleResolveConfirm}
            onCancel={() => setShowResolve(false)}
          />
          <DismissDialog
            open={showDismiss}
            bookingCode={data.booking_code}
            isSubmitting={isSubmitting}
            onConfirm={handleDismissConfirm}
            onCancel={() => setShowDismiss(false)}
          />
        </>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className='flex items-start gap-2 text-sm text-muted-foreground'>
      <Icon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
      <span>{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader>
          <div className='flex items-start justify-between gap-2'>
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-5 w-20 rounded-full' />
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-4 w-full max-w-sm' />
          ))}
        </CardContent>
      </Card>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className='aspect-[4/3] w-full rounded-2xl' />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
