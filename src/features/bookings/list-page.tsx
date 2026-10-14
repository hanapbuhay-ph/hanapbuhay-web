import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { BookingsTable } from './components/bookings-table'
import { useBookings } from './hooks/use-bookings'
import { useBookingAction } from './hooks/use-booking-action'
import { AdminBookingDialog } from './components/admin-booking-dialog'
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
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [showCreateBooking, setShowCreateBooking] = useState(false)
  const { isSubmitting, createForClient } = useBookingAction()
  const { data, pagination, isLoading, error, refetch } = useBookings(
    statusFilter,
    categoryId,
    dateFrom,
    dateTo,
    search,
    page,
  )

  useEffect(() => {
    api.get('/service-categories').then((response) => {
      const categoriesData = response.data?.data
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    }).catch(() => {})
  }, [])

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
            Manage platform bookings and create bookings on behalf of clients.
          </p>
        </div>
        <div className='mb-4 flex justify-end'>
          <Button onClick={() => setShowCreateBooking(true)}>
            <Plus className='h-4 w-4' />
            Book a Job for a Client
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className='mb-4 w-full overflow-x-auto pb-1'>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as BookingStatusFilter)
              setPage(1)
            }}
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

        <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='relative w-full lg:max-w-xs'>
            <SearchIcon className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
            <Input
              value={search}
              placeholder='Search booking, client, or worker'
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className='border-border pl-9'
            />
          </div>
          <Select value={categoryId === null ? 'all' : String(categoryId)} onValueChange={(value) => { setCategoryId(value === 'all' ? null : Number(value)); setPage(1) }}>
            <SelectTrigger className='border-border lg:w-48'><SelectValue placeholder='All Categories' /></SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type='date' value={dateFrom} aria-label='From date' onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} className='border-border lg:w-40' />
          <Input type='date' value={dateTo} aria-label='To date' onChange={(event) => { setDateTo(event.target.value); setPage(1) }} className='border-border lg:w-40' />
        </div>

        {/* Table */}
        <BookingsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} bookings)</span>
            <div className='flex items-center gap-1'>
              <Button variant='outline' size='icon' title='Previous page' aria-label='Previous page' disabled={pagination.current_page <= 1} onClick={() => setPage(pagination.current_page - 1)}><ChevronLeft className='h-4 w-4' /></Button>
              <Button variant='outline' size='icon' title='Next page' aria-label='Next page' disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(pagination.current_page + 1)}><ChevronRight className='h-4 w-4' /></Button>
            </div>
          </div>
        )}
      </Main>
      <AdminBookingDialog
        open={showCreateBooking}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setShowCreateBooking(open)
          if (!open) refetch()
        }}
        onSubmit={createForClient}
      />
    </>
  )
}
