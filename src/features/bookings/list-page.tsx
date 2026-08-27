import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { BookingsTable } from './components/bookings-table'
import { useBookings } from './hooks/use-bookings'
import { type BookingStatusFilter } from './types'

// ── Filter tab definitions ────────────────────────────────────────────────────

const STATUS_TABS: { value: BookingStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'declined', label: 'Declined' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function BookingsListPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all')
  const { data, isLoading, error, refetch } = useBookings(statusFilter)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Booking Oversight
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            View and monitor all platform bookings. Read-only — force cancel is
            available on the detail page.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className='mb-4 w-full overflow-x-auto pb-1'>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BookingStatusFilter)}
          >
            <TabsList className='min-w-max'>
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <BookingsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
      </Main>
    </>
  )
}
