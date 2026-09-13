import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Flag,
  FolderOpen,
  Megaphone,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BookingStatusBadge } from '../bookings/components/booking-status-badge'
import { useBookings } from '../bookings/hooks/use-bookings'
import { useJobPosts } from '../job-posts/hooks/use-job-posts'
import { useVerifications } from '../verifications/hooks/use-verifications'
import { AnalyticsChart, type ChartSeries } from './components/analytics-chart'
import { RecentActivity } from './components/recent-activity'
import { StatGrid } from './components/stat-grid'
import { useDashboard } from './hooks/use-dashboard'

export function Dashboard() {
  const [activityFilter, setActivityFilter] = useState<ChartSeries>('all')
  const { data, recentActivity, isLoading, error, refetch } = useDashboard()
  const {
    data: recentBookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useBookings()
  const { data: pendingVerifications = [], isLoading: verificationsLoading } =
    useVerifications('pending')
  const { data: activeJobPosts = [] } = useJobPosts(
    null,
    null,
    'active',
    'all',
    '',
    1
  )
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const lastUpdatedLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())

  const completedBookingsToday = data?.completed_bookings_today
  const completedBookingsYesterday = data?.completed_bookings_yesterday
  const hasCompletedBookingsComparison =
    Number.isFinite(completedBookingsToday) &&
    Number.isFinite(completedBookingsYesterday)
  const completedBookingsDelta = hasCompletedBookingsComparison
    ? completedBookingsToday! - completedBookingsYesterday!
    : null
  const completedBookingsBadge =
    completedBookingsDelta === null
      ? 'Comparison unavailable'
      : completedBookingsDelta === 0
        ? 'Same as yesterday'
        : `${completedBookingsDelta > 0 ? '+' : ''}${completedBookingsDelta} vs yesterday`

  const operationItems = data
    ? [
        {
          label: 'Pending Verifications',
          value: data.pending_verifications,
          badge: data.pending_verifications === 0 ? 'Healthy' : 'Need review',
          tone:
            data.pending_verifications === 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
        },
        {
          label: 'Open Disputes',
          value: data.open_disputes,
          badge: data.open_disputes === 0 ? 'Stable' : 'In review',
          tone:
            data.open_disputes === 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
        },
        {
          label: 'Completed Today',
          value: data.completed_bookings_today,
          badge: completedBookingsBadge,
          tone:
            completedBookingsDelta === null
              ? 'bg-muted text-muted-foreground'
              : completedBookingsDelta >= 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
        },
        {
          label: 'Total Clients',
          value: data.total_clients,
          badge: 'Active demand',
          tone: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
        },
      ]
    : []

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  const formatRelativeTime = (iso: string) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true })
    } catch {
      return iso
    }
  }

  const formatBookingDate = (iso: string) => {
    try {
      return format(new Date(iso), 'MMM d, yyyy • h:mm a')
    } catch {
      return iso
    }
  }

  const queueItems = pendingVerifications.slice(0, 3)
  const recentJobPosts = activeJobPosts.slice(0, 3)
  const recentBookingsPreview = recentBookings.slice(0, 3)
  const recentActivityPreview = recentActivity.slice(0, 6)

  const topServiceCategories = (() => {
    const entries = data?.top_service_categories ?? []
    const max = Math.max(...entries.map(({ count }) => count), 1)

    return entries.map((entry) => ({
      ...entry,
      percent: Math.round((entry.count / max) * 100),
    }))
  })()

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Admin Dashboard
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Platform overview for {todayLabel}.
            </p>
            <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <span>{todayLabel}</span>
              <span className='text-muted-foreground/60'>•</span>
              <span>Last updated {lastUpdatedLabel}</span>
            </div>
          </div>

          {!isLoading && data && (
            <div className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <span className='h-2 w-2 rounded-full bg-emerald-500' />
              System operating normally
            </div>
          )}
        </div>

        <StatGrid
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />

        {!isLoading && data && (
          <>
            <div className='mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]'>
              <Card className='rounded-xl border border-border bg-card'>
                <CardHeader className='pb-3'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <CardTitle className='text-base font-semibold text-foreground'>
                      Platform Activity
                    </CardTitle>
                    <div className='flex flex-wrap items-center gap-2'>
                      <div
                        aria-label='Filter platform activity'
                        className='flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1'
                        role='group'
                      >
                        {(
                          [
                            ['all', 'All'],
                            ['bookings', 'Bookings'],
                            ['verifications', 'Verifications'],
                            ['active_jobs', 'Active jobs'],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type='button'
                            aria-pressed={activityFilter === value}
                            onClick={() => setActivityFilter(value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                              activityFilter === value
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background hover:text-foreground'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='px-4 pb-4 sm:px-6 sm:pb-6'>
                  {data.activity_trend && data.activity_trend.length > 0 ? (
                    <div className='h-64 w-full'>
                      <AnalyticsChart
                        data={data.activity_trend}
                        series={activityFilter}
                      />
                    </div>
                  ) : (
                    <div className='flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center'>
                      <p className='text-sm text-muted-foreground'>
                        No platform activity data yet.
                      </p>
                    </div>
                  )}
                  <div className='mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-muted-foreground'>
                    <div className='flex flex-wrap gap-x-5 gap-y-2'>
                      {[
                        ['bg-primary', 'Bookings'],
                        ['bg-amber-500', 'Verifications'],
                        ['bg-slate-500', 'Active jobs'],
                      ].map(([color, label]) => (
                        <span
                          key={label}
                          className='inline-flex items-center gap-2'
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${color}`}
                          />
                          {label}
                        </span>
                      ))}
                    </div>
                    <span className='ml-auto'>Last 7 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card className='rounded-xl border border-border bg-card'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold text-foreground'>
                    Operational Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                    {operationItems.map((item) => (
                      <div
                        key={item.label}
                        className='rounded-xl border border-border bg-muted/20 p-3.5'
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <p className='text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase'>
                            {item.label}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${item.tone}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className='mt-3 text-2xl font-bold text-foreground'>
                          {item.value.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-3'>
              <div className='grid min-w-0 grid-cols-1 items-start gap-6 xl:col-span-2 xl:grid-cols-2'>
                <RecentActivity
                  data={recentActivityPreview}
                  isLoading={isLoading}
                  error={error}
                  onRetry={refetch}
                />

                <div className='space-y-6'>
                  <Card className='rounded-xl border border-border bg-card'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between gap-4'>
                        <CardTitle className='text-base font-semibold text-foreground'>
                          Verification Queue
                        </CardTitle>
                        <Link
                          to='/verifications'
                          className='inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline'
                        >
                          View all
                          <ArrowRight className='h-3 w-3' />
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {verificationsLoading && (
                        <p className='text-sm text-muted-foreground'>
                          Loading verifications…
                        </p>
                      )}

                      {!verificationsLoading &&
                        queueItems.map((verification) => (
                          <div
                            key={verification.id}
                            className='flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3'
                          >
                            <div className='flex min-w-0 items-center gap-3'>
                              <div className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                                {getInitials(
                                  verification.user?.name ?? 'Worker'
                                )}
                                {verification.user?.profile_photo_url && (
                                  <img
                                    src={verification.user.profile_photo_url}
                                    alt={`${verification.user.name} profile`}
                                    className='absolute inset-0 h-full w-full object-cover'
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none'
                                    }}
                                  />
                                )}
                              </div>
                              <div className='min-w-0'>
                                <p className='truncate text-sm font-medium text-foreground'>
                                  {verification.user?.name}
                                </p>
                                <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                                  {verification.user?.barangay ??
                                    'Unknown barangay'}{' '}
                                  • Submitted{' '}
                                  {formatRelativeTime(verification.updated_at)}
                                </p>
                              </div>
                            </div>
                            <Link
                              to='/verifications'
                              className='inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-primary uppercase transition-colors hover:bg-primary/5'
                            >
                              Review
                            </Link>
                          </div>
                        ))}

                      {!verificationsLoading && queueItems.length === 0 && (
                        <div className='flex min-h-[216px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center'>
                          <p className='text-sm text-muted-foreground'>
                            No pending verifications.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className='rounded-xl border border-border bg-card'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base font-semibold text-foreground'>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-3 sm:grid-cols-2'>
                      <Button asChild className='justify-between'>
                        <Link to='/verifications'>
                          Review Verifications
                          <ShieldCheck className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant='outline'
                        className='justify-between'
                      >
                        <Link to='/reports'>
                          View Reports
                          <Flag className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant='outline'
                        className='justify-between'
                      >
                        <Link to='/platform-settings/service-categories'>
                          Service Categories
                          <FolderOpen className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant='outline'
                        className='justify-between'
                      >
                        <Link to='/platform-settings/announcements'>
                          Announcements
                          <Megaphone className='h-4 w-4' />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className='xl:col-span-2'>
                  <Card className='rounded-xl border border-border bg-card'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between gap-4'>
                        <CardTitle className='text-base font-semibold text-foreground'>
                          Recent Job Posts
                        </CardTitle>
                        <Link
                          to='/job-posts'
                          className='inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline'
                        >
                          View all
                          <ArrowRight className='h-3 w-3' />
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {recentJobPosts.length === 0 && (
                        <div className='flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center'>
                          <p className='text-sm text-muted-foreground'>
                            No active job posts yet.
                          </p>
                        </div>
                      )}

                      {recentJobPosts.map((post) => (
                        <div
                          key={post.id}
                          className='flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3'
                        >
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-medium text-foreground'>
                              {post.title}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              {post.category?.name ?? 'General'} •{' '}
                              {post.worker?.barangay ?? 'Unknown barangay'}
                            </p>
                            <p className='mt-1 text-[11px] text-muted-foreground'>
                              {formatRelativeTime(post.created_at)}
                            </p>
                          </div>
                          <span className='inline-flex rounded-full border border-emerald-200 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-emerald-700 uppercase dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'>
                            Active
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className='space-y-6 xl:col-span-1'>
                <Card className='rounded-xl border border-border bg-card'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between gap-4'>
                      <CardTitle className='text-base font-semibold text-foreground'>
                        Recent Bookings
                      </CardTitle>
                      <Link
                        to='/bookings'
                        className='inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline'
                      >
                        View all
                        <ArrowRight className='h-3 w-3' />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {bookingsLoading && (
                      <p className='text-sm text-muted-foreground'>
                        Loading bookings…
                      </p>
                    )}

                    {!bookingsLoading && bookingsError && (
                      <p className='text-sm text-destructive'>
                        Failed to load recent bookings.
                      </p>
                    )}

                    {!bookingsLoading &&
                      !bookingsError &&
                      recentBookingsPreview.length === 0 && (
                        <p className='text-sm text-muted-foreground'>
                          No recent bookings yet.
                        </p>
                      )}

                    {!bookingsLoading &&
                      !bookingsError &&
                      recentBookingsPreview.map((booking) => (
                        <div
                          key={booking.id}
                          className='flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3'
                        >
                          <div className='flex min-w-0 items-center gap-3'>
                            <div className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                              {getInitials(booking.client?.name ?? 'Client')}
                              {booking.client?.profile_photo_url && (
                                <img
                                  src={booking.client.profile_photo_url}
                                  alt={`${booking.client.name} profile`}
                                  className='absolute inset-0 h-full w-full object-cover'
                                  onError={(event) => {
                                    event.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                            <div className='min-w-0'>
                              <p className='truncate text-sm font-medium text-foreground'>
                                {booking.client?.name ?? 'Unknown client'}
                              </p>
                              <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                                {booking.service_category?.name ?? 'General'} •{' '}
                                {formatBookingDate(
                                  booking.scheduled_at || booking.created_at
                                )}
                              </p>
                            </div>
                          </div>

                          <BookingStatusBadge status={booking.status} />
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card className='rounded-xl border border-border bg-card'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-semibold text-foreground'>
                      Top Service Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {topServiceCategories.length === 0 && (
                      <p className='text-sm text-muted-foreground'>
                        No service category data yet.
                      </p>
                    )}

                    {topServiceCategories.map((category) => (
                      <div key={category.name} className='space-y-2'>
                        <div className='flex items-center justify-between gap-3 text-sm'>
                          <span className='font-medium text-foreground'>
                            {category.name}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {category.percent}%
                          </span>
                        </div>
                        <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full rounded-full bg-primary'
                            style={{ width: `${category.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
