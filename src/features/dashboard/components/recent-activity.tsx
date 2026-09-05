// MISMATCH NOTE: Mock used AuditLog shape { id, admin_name, action, target_type,
// target_id, details, created_at }. Real API returns recent_activity items as
// { type: string, description: string, created_at: string } — no id field.
// The component now renders description directly instead of mapping action labels.

import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { Activity, ArrowRight, RefreshCw } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { type RecentActivityItem } from '../hooks/use-dashboard'

// ── Props ─────────────────────────────────────────────────────────────────────

interface RecentActivityProps {
  data: RecentActivityItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function RecentActivitySkeleton() {
  return (
    <Card
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardHeader className='pb-3'>
        <Skeleton className='h-5 w-36' />
      </CardHeader>
      <CardContent className='space-y-4 pb-2'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='flex items-start gap-3'>
            <Skeleton className='mt-0.5 h-7 w-7 shrink-0 rounded-full' />
            <div className='flex-1 space-y-1.5'>
              <Skeleton className='h-3.5 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className='pt-2'>
        <Skeleton className='h-4 w-28' />
      </CardFooter>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function RecentActivity({
  data,
  isLoading,
  error,
  onRetry,
}: RecentActivityProps) {
  if (isLoading) return <RecentActivitySkeleton />

  return (
    <Card
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold text-foreground'>
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className='pb-2'>
        {/* Error state */}
        {error && (
          <div className='flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            <span>{error}</span>
            <Button
              variant='link'
              size='sm'
              className='h-auto p-0 text-destructive underline'
              onClick={onRetry}
            >
              <RefreshCw className='mr-1 h-3 w-3' />
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!error && data.length === 0 && (
          <div className='flex flex-col items-center justify-center gap-2 py-6 text-center'>
            <Activity className='h-8 w-8 text-muted-foreground/50' />
            <p className='text-sm text-muted-foreground'>No recent activity.</p>
          </div>
        )}

        {/* Feed */}
        {!error && data.length > 0 && (
          <ul className='space-y-0 divide-y divide-border'>
            {data.map((entry, index) => (
              <li key={index} className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
                {/* Dot avatar */}
                <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                  <Activity className='h-3.5 w-3.5 text-primary' aria-hidden />
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>
                    {entry.description}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    <span>{relativeTime(entry.created_at)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {/* Footer link */}
      {!error && (
        <CardFooter className='border-t border-border pt-3'>
          <Link
            to='/audit-logs'
            className='inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline'
          >
            View full Audit Log
            <ArrowRight className='h-3 w-3' />
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
