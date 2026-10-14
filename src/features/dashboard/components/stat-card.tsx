import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string
  value: number
  featured?: boolean
  className?: string
  contextLabel: string
  sparklineData?: number[]
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  featured = false,
  className,
  contextLabel,
  sparklineData = [],
}: StatCardProps) {
  return (
    <Card
      className={[
        'h-full rounded-lg border border-border bg-card transition-colors duration-200',
        featured ? 'border-primary/40 bg-primary/[0.03]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardContent className='flex h-full flex-col justify-between p-4 sm:p-5'>
        <div className='flex flex-col gap-2'>
          <span className='text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>
            {label}
          </span>
          <span
            className={`leading-none font-bold tracking-tight text-foreground tabular-nums ${featured ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}
          >
            {value.toLocaleString()}
          </span>
        </div>
        <div className='mt-5 flex items-end justify-between gap-4 border-t border-border/80 pt-3'>
          <span className='text-xs text-muted-foreground'>{contextLabel}</span>
          {sparklineData.length > 1 && (
            <div
              className='flex h-7 items-end gap-0.5'
              aria-label={`${label} trend over the last 7 days`}
            >
              {sparklineData.map((point, index) => {
                const maximum = Math.max(...sparklineData, 1)
                const height = Math.max(18, Math.round((point / maximum) * 100))
                return (
                  <span
                    key={`${point}-${index}`}
                    className='w-1.5 rounded-sm bg-primary/70'
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── StatCardSkeleton ──────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <Card className='rounded-lg border border-border bg-card'>
      <CardContent className='flex items-center justify-between p-4 sm:p-5'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-3.5 w-24' />
          <Skeleton className='h-8 w-16' />
        </div>
        <Skeleton className='h-7 w-12 rounded-sm' />
      </CardContent>
    </Card>
  )
}
