import { useRef, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BookingOption {
  id: number
  booking_code: string
  status: string
  client: { id: number; name: string }
  worker: { id: number; name: string }
}

interface ReportReasonOption {
  code: string
  label: string
  audience: 'client' | 'worker'
  is_active: boolean
}

async function searchBookings(search: string): Promise<BookingOption[]> {
  const response = await api.get('/admin/bookings', {
    params: { search, page: 1 },
  })
  const bookings = response.data?.data?.bookings
  if (!Array.isArray(bookings)) {
    throw new Error('The booking search response was invalid.')
  }
  return bookings
}

async function loadReportReasons(
  audience: 'client' | 'worker'
): Promise<ReportReasonOption[]> {
  const response = await api.get('/admin/settings/report-reasons', {
    params: { audience },
  })
  const reasons = response.data?.data
  if (!Array.isArray(reasons)) {
    throw new Error('The report reason response was invalid.')
  }
  return reasons.filter(
    (reason: ReportReasonOption) =>
      reason.audience === audience && reason.is_active
  )
}

export function AdminReportDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [bookingSearch, setBookingSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(
    null
  )
  const [reporterRole, setReporterRole] = useState<'client' | 'worker'>(
    'client'
  )
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bookingQuery = useQuery({
    queryKey: ['admin-report-bookings', bookingSearch.trim()],
    queryFn: () => searchBookings(bookingSearch.trim()),
    enabled: open && bookingSearch.trim().length >= 2,
  })
  const reasonsQuery = useQuery({
    queryKey: ['admin-report-reasons', reporterRole],
    queryFn: () => loadReportReasons(reporterRole),
    enabled: open,
  })

  function resetForm() {
    setBookingSearch('')
    setSelectedBooking(null)
    setReporterRole('client')
    setReason('')
    setDescription('')
    setPhotos([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) resetForm()
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedBooking || !reason || !description.trim()) return

    const formData = new FormData()
    formData.set('booking_id', String(selectedBooking.id))
    formData.set('reporter_role', reporterRole)
    formData.set('reason', reason)
    formData.set('description', description.trim())
    photos.forEach((photo) => formData.append('evidence_photos[]', photo))

    setIsSubmitting(true)
    try {
      await api.post('/admin/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Report submitted on behalf of the user.')
      resetForm()
      onOpenChange(false)
      onCreated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not submit the report.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportingUser =
    reporterRole === 'client'
      ? selectedBooking?.client
      : selectedBooking?.worker
  const reportedUser =
    reporterRole === 'client'
      ? selectedBooking?.worker
      : selectedBooking?.client

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Submit a Report on Behalf of a User</DialogTitle>
          <DialogDescription>
            Select the related booking and whether the client or worker is
            submitting the report. The other booking participant will be
            reported.
          </DialogDescription>
        </DialogHeader>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='admin-report-booking-search'>Find booking</Label>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='admin-report-booking-search'
                value={bookingSearch}
                onChange={(event) => {
                  setBookingSearch(event.target.value)
                  setSelectedBooking(null)
                }}
                placeholder='Search booking code or participant name'
                className='ps-9'
                disabled={isSubmitting}
              />
            </div>
            <Select
              value={selectedBooking ? String(selectedBooking.id) : ''}
              onValueChange={(value) => {
                const booking = bookingQuery.data?.find(
                  (item) => String(item.id) === value
                )
                if (booking) setSelectedBooking(booking)
              }}
              disabled={
                isSubmitting ||
                bookingSearch.trim().length < 2 ||
                bookingQuery.isLoading
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={
                    bookingSearch.trim().length < 2
                      ? 'Enter at least 2 characters to search'
                      : bookingQuery.isLoading
                        ? 'Searching bookings…'
                        : 'Select a booking'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(bookingQuery.data ?? []).map((booking) => (
                  <SelectItem key={booking.id} value={String(booking.id)}>
                    {booking.booking_code} · {booking.client.name} /{' '}
                    {booking.worker.name}
                  </SelectItem>
                ))}
                {bookingQuery.data?.length === 0 && (
                  <div className='px-2 py-3 text-sm text-muted-foreground'>
                    No bookings matched that search.
                  </div>
                )}
              </SelectContent>
            </Select>
            {bookingQuery.isError && (
              <p role='alert' className='text-sm text-destructive'>
                Could not search bookings. Try again.
              </p>
            )}
          </div>

          {selectedBooking && (
            <div className='rounded-lg border bg-muted/30 p-3 text-sm'>
              <p className='font-medium'>
                Booking {selectedBooking.booking_code}
                <span className='ms-2 text-muted-foreground'>
                  ({selectedBooking.status.replace(/_/g, ' ')})
                </span>
              </p>
              <p className='mt-1 text-muted-foreground'>
                Client: {selectedBooking.client.name} · Worker:{' '}
                {selectedBooking.worker.name}
              </p>
            </div>
          )}

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='admin-reporting-party'>Report submitted for</Label>
            <Select
              value={reporterRole}
              onValueChange={(value) => {
                setReporterRole(value as 'client' | 'worker')
                setReason('')
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id='admin-reporting-party' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='client'>
                  Client reports the worker
                </SelectItem>
                <SelectItem value='worker'>
                  Worker reports the client
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedBooking && (
              <p className='text-xs text-muted-foreground'>
                Reporting as {reportingUser?.name}; report will be about{' '}
                {reportedUser?.name}.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='admin-report-reason'>Reason</Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={
                isSubmitting || reasonsQuery.isLoading || reasonsQuery.isError
              }
            >
              <SelectTrigger id='admin-report-reason' className='w-full'>
                <SelectValue
                  placeholder={
                    reasonsQuery.isLoading
                      ? 'Loading reasons…'
                      : 'Select a report reason'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(reasonsQuery.data ?? []).map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reasonsQuery.isError && (
              <p role='alert' className='text-sm text-destructive'>
                Could not load report reasons. Try again.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='admin-report-description'>Description</Label>
            <Textarea
              id='admin-report-description'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder='Record the report details provided by the client or worker.'
              disabled={isSubmitting}
              required
            />
            <span className='text-end text-xs text-muted-foreground'>
              {description.length}/2000
            </span>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='admin-report-evidence'>
              Evidence photos{' '}
              <span className='text-muted-foreground'>(optional, up to 3)</span>
            </Label>
            <Input
              ref={fileInputRef}
              id='admin-report-evidence'
              type='file'
              accept='image/jpeg,image/png,image/webp'
              multiple
              disabled={isSubmitting}
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? [])
                if (selected.length > 3) {
                  toast.error('You can attach up to 3 evidence photos.')
                  event.target.value = ''
                  setPhotos([])
                  return
                }
                setPhotos(selected)
              }}
            />
            <span className='text-xs text-muted-foreground'>
              JPG, PNG, or WebP; maximum 5 MB per image.
            </span>
          </div>

          <p className='rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground'>
            This action will be attributed to your admin account. The
            represented user and the reported user will both receive an in-app
            notification.
          </p>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting ||
                !selectedBooking ||
                !reason ||
                !description.trim()
              }
            >
              {isSubmitting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Plus className='size-4' />
              )}
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
