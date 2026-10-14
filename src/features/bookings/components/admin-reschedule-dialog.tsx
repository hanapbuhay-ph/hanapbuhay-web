import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
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

interface AdminRescheduleDialogProps {
  open: boolean
  bookingCode: string
  scheduledAt: string
  isSubmitting: boolean
  onConfirm: (scheduledAt: string) => void
  onOpenChange: (open: boolean) => void
}

function localDateTimeValue(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

export function AdminRescheduleDialog({
  open,
  bookingCode,
  scheduledAt,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: AdminRescheduleDialogProps) {
  const [value] = useState(() => localDateTimeValue(new Date(scheduledAt)))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value) return
    onConfirm(new Date(value).toISOString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Update the schedule for{' '}
            <span className='font-mono font-semibold text-foreground'>
              {bookingCode}
            </span>
            . The client and worker will both be notified.
          </DialogDescription>
        </DialogHeader>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='reschedule-at'>New schedule</Label>
            <Input
              id='reschedule-at'
              type='datetime-local'
              min={localDateTimeValue(new Date())}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || !value}>
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
