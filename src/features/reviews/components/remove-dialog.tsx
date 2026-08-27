import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface RemoveReviewDialogProps {
  open: boolean
  reviewerName: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveReviewDialog({
  open,
  reviewerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: RemoveReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-4 w-4' />
            Remove Review
          </DialogTitle>
          <DialogDescription className='space-y-2'>
            <span className='block'>
              You are removing the review from{' '}
              <span className='font-semibold text-foreground'>{reviewerName}</span>
              .
            </span>
            <span className='block font-medium text-destructive'>
              This will permanently hide the review from all users. This action
              cannot be undone.
            </span>
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
            variant='destructive'
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Remove Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
