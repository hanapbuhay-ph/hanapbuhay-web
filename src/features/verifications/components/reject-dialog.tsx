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

interface RejectDialogProps {
  open: boolean
  workerName: string
  isSubmitting: boolean
  onConfirm: (remarks: string) => void
  onCancel: () => void
}

export function RejectDialog({
  open,
  workerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: RejectDialogProps) {
  const [remarks, setRemarks] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setRemarks('')
      onCancel()
    }
  }

  function handleConfirm() {
    if (!remarks.trim()) return
    onConfirm(remarks.trim())
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Reject Verification</DialogTitle>
          <DialogDescription>
            You are rejecting the verification for{' '}
            <span className='font-semibold text-foreground'>{workerName}</span>.
            Please provide a reason — this will be sent to the worker.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label htmlFor='reject-remarks' className='text-sm font-semibold text-foreground'>
            Rejection Reason <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='reject-remarks'
            placeholder='e.g. Documents are blurry or incomplete...'
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {remarks.trim() === '' && (
            <p className='text-xs text-muted-foreground'>
              A reason is required before rejecting.
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
            disabled={isSubmitting || remarks.trim() === ''}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
