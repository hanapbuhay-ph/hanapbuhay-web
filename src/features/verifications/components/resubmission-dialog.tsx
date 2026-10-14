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

interface ResubmissionDialogProps {
  open: boolean
  workerName: string
  isSubmitting: boolean
  onConfirm: (remarks: string) => void
  onCancel: () => void
}

export function ResubmissionDialog({
  open,
  workerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: ResubmissionDialogProps) {
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
          <DialogTitle className='text-foreground'>
            Request Resubmission
          </DialogTitle>
          <DialogDescription>
            Tell{' '}
            <span className='font-semibold text-foreground'>{workerName}</span>{' '}
            what they need to fix and resubmit.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='resubmission-remarks'
            className='text-sm font-semibold text-foreground'
          >
            Resubmission Instructions{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='resubmission-remarks'
            placeholder='e.g. Please resubmit a clearer government ID — the current photo is blurry...'
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              Instructions are required before sending.
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
            onClick={() => !isEmpty && onConfirm(remarks.trim())}
            disabled={isSubmitting || isEmpty}
            className='bg-amber-500 text-white hover:bg-amber-600'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
