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

interface RestoreReviewDialogProps {
  open: boolean
  reviewerName: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RestoreReviewDialog({
  open,
  reviewerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: RestoreReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Restore Review</DialogTitle>
          <DialogDescription>
            You are restoring the review from{' '}
            <span className='font-semibold text-foreground'>{reviewerName}</span>
            . It will become visible to users again.
          </DialogDescription>
        </DialogHeader>

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
            onClick={onConfirm}
            disabled={isSubmitting}
            className='bg-primary text-white hover:bg-primary/90'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Restore Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
