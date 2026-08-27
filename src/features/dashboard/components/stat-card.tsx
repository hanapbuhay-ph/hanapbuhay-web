import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatVariant = 'default' | 'alert-green' | 'alert-red'

export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant?: StatVariant
}

// ── Variant maps ──────────────────────────────────────────────────────────────

const borderColor: Record<StatVariant, string> = {
  default: 'border-l-border',
  'alert-green': 'border-l-primary',
  'alert-red': 'border-l-destructive',
}

const valueColor: Record<StatVariant, string> = {
  default: 'text-foreground',
  'alert-green': 'text-primary',
  'alert-red': 'text-destructive',
}

const iconBg: Record<StatVariant, string> = {
  default: 'bg-primary/10 text-primary',
  'alert-green': 'bg-primary/10 text-primary',
  'alert-red': 'bg-destructive/10 text-destructive',
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card
      className={[
        'rounded-2xl border border-l-4 border-border bg-card',
        borderColor[variant],
      ].join(' ')}
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardContent className='flex items-center justify-between p-5'>
        <div className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-muted-foreground'>
            {label}
          </span>
          <span
            className={[
              'text-[32px] leading-none font-bold',
              valueColor[variant],
            ].join(' ')}
          >
            {value.toLocaleString()}
          </span>
        </div>
        <div
          className={[
            'flex h-11 w-11 items-center justify-center rounded-xl',
            iconBg[variant],
          ].join(' ')}
        >
          <Icon className='h-5 w-5' aria-hidden='true' />
        </div>
      </CardContent>
    </Card>
  )
}

// ── StatCardSkeleton ──────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <Card
      className='rounded-2xl border border-l-4 border-border border-l-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardContent className='flex items-center justify-between p-5'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-8 w-16' />
        </div>
        <Skeleton className='h-11 w-11 rounded-xl' />
      </CardContent>
    </Card>
  )
}
