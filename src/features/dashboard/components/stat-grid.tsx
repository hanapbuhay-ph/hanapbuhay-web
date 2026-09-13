import {
  Users,
  HardHat,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type DashboardStats } from '../hooks/use-dashboard'
import { StatCard, StatCardSkeleton, type StatVariant } from './stat-card'

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
  icon: LucideIcon
  variant: (val: number) => StatVariant
  featured?: boolean
  trendLabel?: string
  trendTone?: 'positive' | 'warning' | 'danger' | 'neutral'
}

const CARD_DEFS: CardDef[] = [
  {
    label: 'Active Bookings',
    key: 'active_bookings',
    icon: CalendarCheck,
    variant: () => 'blue',
    featured: true,
    trendLabel: '2 in progress',
    trendTone: 'positive',
  },
  {
    label: 'Total Users',
    key: 'total_users',
    icon: Users,
    variant: () => 'blue',
    trendLabel: '+12 this week',
    trendTone: 'neutral',
  },
  {
    label: 'Total Workers',
    key: 'total_workers',
    icon: HardHat,
    variant: () => 'violet',
    trendLabel: '+3 this week',
    trendTone: 'positive',
  },
  {
    label: 'Total Job Posts',
    key: 'total_active_job_posts',
    icon: CheckCircle2,
    variant: () => 'orange',
    trendLabel: '+5 this week',
    trendTone: 'positive',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function StatGrid({ data, isLoading, error, onRetry }: StatGridProps) {
  // Loading state — 7 skeleton cards
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
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
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {CARD_DEFS.map((def) => {
        const value = data[def.key] as number
        return (
          <StatCard
            key={def.key}
            label={def.label}
            value={value}
            icon={def.icon}
            variant={def.variant(value)}
            featured={def.featured}
            className='h-full'
            trendLabel={def.trendLabel}
            trendTone={def.trendTone}
          />
        )
      })}
    </div>
  )
}
