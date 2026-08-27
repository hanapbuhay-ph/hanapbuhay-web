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

interface ReactivateDialogProps {
  open: boolean
  userName: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ReactivateDialog({
  open,
  userName,
  isSubmitting,
  onConfirm,
  onCancel,
}: ReactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className='rounded-2xl border-border bg-card'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-foreground'>
            Reactivate User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reactivate{' '}
            <span className='font-semibold text-foreground'>{userName}</span>?
            They will regain full access to the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isSubmitting}
            className='border-border'
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className='bg-primary text-white hover:bg-primary/90'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Reactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
