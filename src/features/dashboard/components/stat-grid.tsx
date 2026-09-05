import {
  Users,
  UserCheck,
  HardHat,
  ShieldAlert,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
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
  icon: React.ComponentType<{ className?: string }>
  variant: (val: number) => StatVariant
}

const CARD_DEFS: CardDef[] = [
  {
    label: 'Total Users',
    key: 'total_users',
    icon: Users,
    variant: () => 'default',
  },
  {
    label: 'Total Clients',
    key: 'total_clients',
    icon: UserCheck,
    variant: () => 'default',
  },
  {
    label: 'Total Workers',
    key: 'total_workers',
    icon: HardHat,
    variant: () => 'default',
  },
  {
    label: 'Pending Verifications',
    key: 'pending_verifications',
    icon: ShieldAlert,
    variant: (v) => (v > 0 ? 'alert-green' : 'default'),
  },
  {
    label: 'Active Bookings',
    key: 'active_bookings',
    icon: CalendarCheck,
    variant: () => 'default',
  },
  {
    label: 'Open Disputes',
    key: 'open_disputes',
    icon: AlertTriangle,
    variant: (v) => (v > 0 ? 'alert-red' : 'default'),
  },
  {
    label: 'Completed Today',
    key: 'completed_bookings_today',
    icon: CheckCircle2,
    variant: () => 'default',
  },
  {
    label: 'Active Job Posts',
    key: 'total_active_job_posts',
    icon: CheckCircle2,
    variant: () => 'default',
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
          />
        )
      })}
    </div>
  )
}
