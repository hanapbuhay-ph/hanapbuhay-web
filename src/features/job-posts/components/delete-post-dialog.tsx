import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface DeletePostDialogProps {
  open: boolean
  postTitle: string
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function DeletePostDialog({
  open,
  postTitle,
  isSubmitting,
  onConfirm,
  onCancel,
}: DeletePostDialogProps) {
  const [reason, setReason] = useState('')
  const isEmpty = reason.trim() === ''

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason('')
          onCancel()
        }
      }}
    >
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
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='job-post-delete-reason'>Reason for removal</Label>
            <Textarea
              id='job-post-delete-reason'
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder='Explain why this job post violates platform policies.'
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} className='border-border'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-white hover:bg-destructive/90'
            disabled={isSubmitting || isEmpty}
            onClick={() => onConfirm(reason.trim())}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
