import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApproveDialogProps {
  open: boolean
  workerName: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ApproveDialog({
  open,
  workerName,
  isSubmitting,
  onConfirm,
  onCancel,
}: ApproveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className='rounded-2xl border-border bg-card'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-foreground'>
            Approve Verification
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve{' '}
            <span className='font-semibold text-foreground'>{workerName}</span>?
            They will be allowed to accept bookings on the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className='border-border'
            disabled={isSubmitting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className='bg-primary text-white hover:bg-primary/90'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
