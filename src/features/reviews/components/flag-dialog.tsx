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

interface FlagReviewDialogProps {
  open: boolean
  reviewerName: string
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function FlagReviewDialog({
  open,
  reviewerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: FlagReviewDialogProps) {
  const [reason, setReason] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setReason('')
      onCancel()
    }
  }

  const isEmpty = reason.trim() === ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Flag Review</DialogTitle>
          <DialogDescription>
            You are flagging the review from{' '}
            <span className='font-semibold text-foreground'>{reviewerName}</span>
            . This review will be hidden from users and marked for admin review.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='flag-reason'
            className='text-sm font-semibold text-foreground'
          >
            Reason for flagging <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='flag-reason'
            placeholder='e.g. Inappropriate language, false claims, spam...'
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              Reason is required before flagging.
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
            onClick={() => !isEmpty && onConfirm(reason.trim())}
            disabled={isSubmitting || isEmpty}
            className='border-amber-400 text-amber-700 hover:bg-amber-50'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Flag Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
