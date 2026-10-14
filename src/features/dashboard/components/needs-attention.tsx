import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Flag,
  Star,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type NeedsAttentionData } from '../hooks/use-needs-attention'

// ── Row definitions ───────────────────────────────────────────────────────────

interface RowDef {
  key: keyof NeedsAttentionData
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const ROWS: RowDef[] = [
  {
    key: 'pendingVerifications',
    label: 'Pending Verifications',
    icon: ShieldAlert,
    href: '/verifications',
  },
  {
    key: 'resubmissionRequested',
    label: 'Resubmission Requested',
    icon: RefreshCw,
    href: '/verifications',
  },
  {
    key: 'underReviewReports',
    label: 'Under Review Reports',
    icon: Flag,
    href: '/reports',
  },
  {
    key: 'flaggedReviews',
    label: 'Flagged Reviews',
    icon: Star,
    href: '/reviews',
  },
  {
    key: 'pendingDeletions',
    label: 'Pending Deletion Requests',
    icon: Trash2,
    href: '/users',
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface NeedsAttentionProps {
  data: NeedsAttentionData
  isLoading: boolean
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function NeedsAttentionSkeleton() {
  return (
    <Card
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardHeader className='pb-3'>
        <Skeleton className='h-5 w-36' />
      </CardHeader>
      <CardContent className='space-y-3 pb-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-8 w-8 rounded-lg' />
              <Skeleton className='h-4 w-44' />
            </div>
            <Skeleton className='h-7 w-14 rounded-md' />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function NeedsAttention({ data, isLoading }: NeedsAttentionProps) {
  if (isLoading) return <NeedsAttentionSkeleton />

  const allZero = ROWS.every((r) => {
    const v = data[r.key]
    return v === 0 || v === null
  })

  return (
    <Card
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold text-foreground'>
          Needs Attention
        </CardTitle>
      </CardHeader>

      <CardContent className='pb-4'>
        {/* All-clear empty state */}
        {allZero ? (
          <div className='flex flex-col items-center justify-center gap-2 py-6 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <CheckCircle2 className='h-6 w-6 text-primary' />
            </div>
            <p className='text-sm font-medium text-foreground'>All caught up!</p>
            <p className='max-w-xs text-xs text-muted-foreground'>
              Nothing needs your attention right now.
            </p>
          </div>
        ) : (
          <ul className='divide-y divide-border'>
            {ROWS.map(({ key, label, icon: Icon, href }) => {
              const count = data[key]
              const hasItems = count !== null && count > 0
              const failed = count === null

              return (
                <li
                  key={key}
                  className={[
                    'flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0',
                    !hasItems ? 'opacity-50' : '',
                  ]
                    .join(' ')
                    .trim()}
                >
                  {/* Icon + label */}
                  <div className='flex min-w-0 items-center gap-3'>
                    <div
                      className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        hasItems
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      <Icon className='h-4 w-4' aria-hidden />
                    </div>
                    <span className='truncate text-sm font-medium text-foreground'>
                      {label}
                    </span>
                  </div>

                  {/* Count + Review link */}
                  <div className='flex shrink-0 items-center gap-3'>
                    <span
                      className={[
                        'min-w-[1.75rem] text-right text-lg font-bold leading-none',
                        failed
                          ? 'text-muted-foreground'
                          : hasItems
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {failed ? '—' : count}
                    </span>

                    {hasItems && (
                      <Link
                        to={href as '/verifications' | '/reports' | '/reviews' | '/users'}
                        className='inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5'
                        aria-label={`Review ${label}`}
                      >
                        Review
                        <ArrowRight className='h-3 w-3' />
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
