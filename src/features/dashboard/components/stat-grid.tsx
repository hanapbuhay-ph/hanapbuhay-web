import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type DashboardStats } from '../hooks/use-dashboard'
import { StatCard, StatCardSkeleton } from './stat-card'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatGridProps {
  data: DashboardStats | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

// ── Card definitions ──────────────────────────────────────────────────────────

type CardDef = {
  label: string
  key: keyof DashboardStats
  featured?: boolean
  contextLabel: string
}

const CARD_DEFS: CardDef[] = [
  {
    label: 'Active Bookings',
    key: 'active_bookings',
    featured: true,
    contextLabel: 'Current active bookings',
  },
  {
    label: 'Total Users',
    key: 'total_users',
    contextLabel: 'All registered users',
  },
  {
    label: 'Total Workers',
    key: 'total_workers',
    contextLabel: 'All registered workers',
  },
  {
    label: 'Total Job Posts',
    key: 'total_active_job_posts',
    contextLabel: 'Currently active posts',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function StatGrid({ data, isLoading, error, onRetry }: StatGridProps) {
  // Loading state — 7 skeleton cards
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
        <AlertTriangle className='h-8 w-8 text-destructive' />
        <p className='text-sm font-semibold text-foreground'>
          Failed to load dashboard data
        </p>
        <p className='max-w-xs text-xs text-muted-foreground'>
          {error ?? 'An unexpected error occurred. Please try again.'}
        </p>
        <Button
          variant='outline'
          size='sm'
          onClick={onRetry}
          className='mt-1 border-border text-primary hover:bg-primary/5'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Retry
        </Button>
      </div>
    )
  }

  // Loaded state
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.45fr_repeat(3,minmax(0,1fr))]'>
      {CARD_DEFS.map((def) => {
        const value = data[def.key] as number
        const sparklineData =
          def.key === 'active_bookings'
            ? (data.activity_trend ?? []).map((point) => point.bookings)
            : def.key === 'total_active_job_posts'
              ? (data.activity_trend ?? []).map((point) => point.active_jobs)
              : []
        return (
          <StatCard
            key={def.key}
            label={def.label}
            value={value}
            featured={def.featured}
            className='h-full'
            contextLabel={def.contextLabel}
            sparklineData={sparklineData}
          />
        )
      })}
    </div>
  )
}
