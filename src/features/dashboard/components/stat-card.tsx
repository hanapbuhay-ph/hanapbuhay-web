import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatVariant =
  | 'default'
  | 'blue'
  | 'violet'
  | 'orange'
  | 'alert-green'
  | 'alert-red'

export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant?: StatVariant
  featured?: boolean
  className?: string
  trendLabel?: string
  trendTone?: 'positive' | 'warning' | 'danger' | 'neutral'
}

// ── Variant maps ──────────────────────────────────────────────────────────────

const iconBg: Record<StatVariant, string> = {
  default: 'bg-primary/10 text-primary',
  blue: 'bg-primary/10 text-primary',
  violet: 'bg-primary/10 text-primary',
  orange: 'bg-primary/10 text-primary',
  'alert-green': 'bg-primary/10 text-primary',
  'alert-red': 'bg-destructive/10 text-destructive',
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  featured = false,
  className,
  trendLabel,
  trendTone = 'neutral',
}: StatCardProps) {
  const trendConfig: Record<
    NonNullable<StatCardProps['trendTone']>,
    { icon: string; tone: string }
  > = {
    positive: { icon: '▲', tone: 'text-emerald-600 dark:text-emerald-400' },
    warning: { icon: '●', tone: 'text-amber-600 dark:text-amber-400' },
    danger: { icon: '▼', tone: 'text-rose-600 dark:text-rose-400' },
    neutral: { icon: '•', tone: 'text-muted-foreground' },
  }

  const trend = trendConfig[trendTone]

  return (
    <Card
      className={[
        'h-full rounded-2xl border border-border bg-card transition-all duration-200',
        featured ? 'ring-1 ring-primary/10' : '',
        'shadow-[0_2px_12px_rgba(52,168,53,0.08)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardContent className='flex h-full flex-col justify-between p-4 sm:p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <span className='text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>
              {label}
            </span>
            <span className='text-[28px] leading-none font-bold text-foreground sm:text-[32px]'>
              {value.toLocaleString()}
            </span>
          </div>

          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              iconBg[variant],
            ].join(' ')}
          >
            <Icon className='h-4 w-4' aria-hidden='true' />
          </div>
        </div>

        {trendLabel && (
          <div className='mt-4 flex items-center justify-between gap-3 border-t border-border/80 pt-3'>
            <div className='flex items-center gap-1.5 text-xs font-medium'>
              <span className={trend.tone}>{trend.icon}</span>
              <span className={trend.tone}>{trendLabel}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── StatCardSkeleton ──────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <Card
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      <CardContent className='flex items-center justify-between p-4 sm:p-5'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-3.5 w-24' />
          <Skeleton className='h-8 w-16' />
        </div>
        <Skeleton className='h-11 w-11 rounded-xl' />
      </CardContent>
    </Card>
  )
}
