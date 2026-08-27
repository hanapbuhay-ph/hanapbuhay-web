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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ApproveDeletionDialogProps {
  open: boolean
  userName: string
  isSubmitting: boolean
  onConfirm: (adminRemarks: string) => void
  onCancel: () => void
}

export function ApproveDeletionDialog({
  open,
  userName,
  isSubmitting,
  onConfirm,
  onCancel,
}: ApproveDeletionDialogProps) {
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
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-4 w-4' />
            Approve Deletion Request
          </DialogTitle>
          <DialogDescription className='space-y-1'>
            <span className='block'>
              You are approving the deletion request for{' '}
              <span className='font-semibold text-foreground'>{userName}</span>.
            </span>
            <span className='block font-medium text-destructive'>
              This will permanently delete the user's account and all associated
              personal data. This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='approve-del-remarks'
            className='text-sm font-semibold text-foreground'
          >
            Admin Remarks <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='approve-del-remarks'
            placeholder='e.g. Account and data deleted per user request...'
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              Remarks are required before approving.
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
            onClick={() => !isEmpty && onConfirm(remarks.trim())}
            disabled={isSubmitting || isEmpty}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Approve & Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
