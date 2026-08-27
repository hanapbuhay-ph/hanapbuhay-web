import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ForceCancelDialogProps {
  open: boolean
  bookingCode: string
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function ForceCancelDialog({
  open,
  bookingCode,
  isSubmitting,
  onConfirm,
  onCancel,
}: ForceCancelDialogProps) {
  const [reason, setReason] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setReason('')
      onCancel()
    }
  }

  function handleConfirm() {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  const isEmpty = reason.trim() === ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            Force Cancel Booking
          </DialogTitle>
          <DialogDescription>
            You are force-cancelling booking{' '}
            <span className='font-mono font-semibold text-foreground'>
              {bookingCode}
            </span>
            . This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='cancel-reason'
            className='text-sm font-semibold text-foreground'
          >
            Cancellation reason{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='cancel-reason'
            placeholder='e.g. Worker unresponsive, client request escalated...'
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              A reason is required before force-cancelling.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
            className='border-border'
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={isSubmitting || isEmpty}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Force Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
