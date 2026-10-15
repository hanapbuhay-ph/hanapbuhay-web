import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileWarning,
  LoaderCircle,
  RefreshCw,
  Star,
  Users,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

interface AnalyticsBreakdown {
  key: string
  count: number
}

interface AnalyticsTrendPoint {
  key: string
  label: string
  users: number
  bookings: number
  job_posts: number
  reports: number
  reviews: number
}

interface ReportAnalytics {
  period: {
    date_from: string
    date_to: string
    interval: 'day' | 'month'
  }
  summary: {
    users: number
    bookings: number
    job_posts: number
    reports: number
    reviews: number
    average_review_score: number
  }
  users_by_role: AnalyticsBreakdown[]
  bookings_by_status: AnalyticsBreakdown[]
  job_posts_by_category: AnalyticsBreakdown[]
  reports_by_status: AnalyticsBreakdown[]
  reports_by_reason: AnalyticsBreakdown[]
  verifications_by_status: AnalyticsBreakdown[]
  trend: AnalyticsTrendPoint[]
}

const EXPORTS = [
  {
    id: 'users',
    label: 'Users',
    description:
      'Account role, status, barangay, verification, and registration date.',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    description: 'Booking status, parties, category, and booking milestones.',
  },
  {
    id: 'job-posts',
    label: 'Job posts',
    description: 'Listing, worker, category, rate, availability, and status.',
  },
  {
    id: 'reports',
    label: 'User reports',
    description: 'Reason, status, parties, booking, and resolution metadata.',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Booking, reviewer, reviewed user, score, and date.',
  },
  {
    id: 'verifications',
    label: 'Worker verifications',
    description: 'Verification state, trust tier, rating, and completed jobs.',
  },
] as const

function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function thirtyDaysAgo(): string {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return localDateString(date)
}

export function ReportAnalyticsPage() {
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(() => localDateString(new Date()))
  const [exporting, setExporting] = useState<string | null>(null)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'report-analytics', dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get<{ data: ReportAnalytics }>(
        '/admin/report-analytics',
        { params: { date_from: dateFrom, date_to: dateTo } }
      )
      return response.data.data
    },
  })

  async function exportCsv(type: (typeof EXPORTS)[number]['id']) {
    setExporting(type)
    try {
      const response = await api.get<Blob>(
        `/admin/report-analytics/exports/${type}`,
        {
          params: { date_from: dateFrom, date_to: dateTo },
          responseType: 'blob',
        }
      )
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `hanapbuhay-${type}-${dateFrom}-${dateTo}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (exportError) {
      toast.error(
        exportError instanceof Error
          ? exportError.message
          : 'Unable to export this report.'
      )
    } finally {
      setExporting(null)
    }
  }

  const summary = data?.summary
  const stats = summary
    ? [
        { label: 'New users', value: summary.users, icon: Users },
        { label: 'Bookings', value: summary.bookings, icon: CalendarDays },
        {
          label: 'Job posts',
          value: summary.job_posts,
          icon: BriefcaseBusiness,
        },
        { label: 'User reports', value: summary.reports, icon: FileWarning },
        { label: 'Reviews', value: summary.reviews, icon: Star },
        {
          label: 'Average review score',
          value: `${summary.average_review_score.toFixed(2)} / 5`,
          icon: Activity,
        },
      ]
    : []

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Report Analytics
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Review platform activity and export operational datasets.
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <label className='grid gap-1 text-xs text-muted-foreground'>
              From
              <input
                aria-label='Report period from'
                type='date'
                value={dateFrom}
                max={dateTo}
                onChange={(event) => setDateFrom(event.target.value)}
                className='h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground'
              />
            </label>
            <label className='grid gap-1 text-xs text-muted-foreground'>
              To
              <input
                aria-label='Report period to'
                type='date'
                value={dateTo}
                min={dateFrom}
                max={localDateString(new Date())}
                onChange={(event) => setDateTo(event.target.value)}
                className='h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground'
              />
            </label>
          </div>
        </div>

        {isLoading && (
          <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
            <LoaderCircle className='size-4 animate-spin' />
            Loading analytics…
          </div>
        )}
        {!isLoading && error && (
          <div className='mb-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center'>
            <AlertTriangle className='size-7 text-destructive' />
            <div>
              <p className='font-medium text-foreground'>
                Unable to load analytics
              </p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {error instanceof Error ? error.message : 'The request failed.'}
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={() => void refetch()}>
              <RefreshCw className='size-4' /> Retry
            </Button>
          </div>
        )}
        {!isLoading && !error && data && (
          <>
            <div className='mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {stats.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {label}
                    </CardTitle>
                    <Icon className='size-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold tabular-nums'>
                      {value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className='mb-6'>
              <CardHeader>
                <CardTitle>Activity over time</CardTitle>
                <CardDescription>
                  New records created during the selected period
                  {data.period.interval === 'month'
                    ? ', grouped by month.'
                    : ', grouped by day.'}
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[320px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={data.trend}>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis dataKey='label' tickLine={false} axisLine={false} />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='users'
                      name='Users'
                      stroke='#2563eb'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='bookings'
                      name='Bookings'
                      stroke='#16a34a'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='job_posts'
                      name='Job posts'
                      stroke='#9333ea'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='reports'
                      name='Reports'
                      stroke='#dc2626'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='reviews'
                      name='Reviews'
                      stroke='#d97706'
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className='mb-8 grid gap-4 lg:grid-cols-2'>
              <BreakdownCard title='Users by role' items={data.users_by_role} />
              <BreakdownCard
                title='Bookings by status'
                items={data.bookings_by_status}
              />
              <BreakdownCard
                title='Job posts by service category'
                items={data.job_posts_by_category}
              />
              <BreakdownCard
                title='Reports by status'
                items={data.reports_by_status}
              />
              <BreakdownCard
                title='Reports by reason'
                items={data.reports_by_reason}
              />
              <BreakdownCard
                title='Worker verifications by status'
                items={data.verifications_by_status}
              />
            </div>

            <section aria-labelledby='analytics-exports-title'>
              <div className='mb-4'>
                <h2
                  id='analytics-exports-title'
                  className='text-lg font-semibold text-foreground'
                >
                  Export reports
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Download all matching records for the selected period as
                  spreadsheet-ready CSV files.
                </p>
              </div>
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {EXPORTS.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base'>{item.label}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={exporting !== null}
                        onClick={() => void exportCsv(item.id)}
                      >
                        {exporting === item.id ? (
                          <LoaderCircle className='size-4 animate-spin' />
                        ) : (
                          <Download className='size-4' />
                        )}
                        {exporting === item.id ? 'Preparing…' : 'Export CSV'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </Main>
    </>
  )
}

function BreakdownCard({
  title,
  items,
}: {
  title: string
  items: AnalyticsBreakdown[]
}) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No data for this period.
          </p>
        ) : (
          <ul className='space-y-3'>
            {items.map(({ key, count }) => (
              <li key={key} className='flex items-center gap-3 text-sm'>
                <span className='w-36 shrink-0 truncate text-muted-foreground capitalize'>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className='h-2 flex-1 overflow-hidden rounded-full bg-muted'>
                  <span
                    className='block h-full rounded-full bg-primary'
                    style={{
                      width: `${Math.max((count / max) * 100, count ? 2 : 0)}%`,
                    }}
                  />
                </span>
                <span className='w-10 text-right font-medium tabular-nums'>
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
