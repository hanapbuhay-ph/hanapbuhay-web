import { Loader2, AlertTriangle } from 'lucide-react'
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

interface DeletePostDialogProps {
  open: boolean
  postTitle: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeletePostDialog({
  open,
  postTitle,
  isSubmitting,
  onConfirm,
  onCancel,
}: DeletePostDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialogContent className='rounded-2xl border-border bg-card'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-4 w-4' />
            Delete Job Post
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are permanently deleting{' '}
            <span className='font-semibold text-foreground'>{postTitle}</span>.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} className='border-border'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className='bg-destructive text-white hover:bg-destructive/90'
            onClick={onConfirm}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
