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

interface DismissDialogProps {
  open: boolean
  bookingCode: string
  isSubmitting: boolean
  onConfirm: (adminRemarks: string) => void
  onCancel: () => void
}

export function DismissDialog({
  open,
  bookingCode,
  isSubmitting,
  onConfirm,
  onCancel,
}: DismissDialogProps) {
  const [remarks, setRemarks] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setRemarks('')
      onCancel()
    }
  }

  const isEmpty = remarks.trim() === ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Dismiss Report</DialogTitle>
          <DialogDescription>
            Dismissing report for booking{' '}
            <span className='font-mono font-semibold text-foreground'>
              {bookingCode}
            </span>
            . Please provide a reason.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='dismiss-remarks'
            className='text-sm font-semibold text-foreground'
          >
            Admin Remarks <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='dismiss-remarks'
            placeholder='e.g. Unable to substantiate claim after review…'
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              A reason is required before dismissing.
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
            variant='outline'
            onClick={() => !isEmpty && onConfirm(remarks.trim())}
            disabled={isSubmitting || isEmpty}
            className='border-muted-foreground text-muted-foreground hover:bg-muted/50'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
