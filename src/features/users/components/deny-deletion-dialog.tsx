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

interface DenyDeletionDialogProps {
  open: boolean
  userName: string
  isSubmitting: boolean
  onConfirm: (adminRemarks: string) => void
  onCancel: () => void
}

export function DenyDeletionDialog({
  open,
  userName,
  isSubmitting,
  onConfirm,
  onCancel,
}: DenyDeletionDialogProps) {
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
            Deny Deletion Request
          </DialogTitle>
          <DialogDescription>
            You are denying the deletion request for{' '}
            <span className='font-semibold text-foreground'>{userName}</span>.
            The user will keep their account.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='deny-del-remarks'
            className='text-sm font-semibold text-foreground'
          >
            Admin Remarks <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='deny-del-remarks'
            placeholder='e.g. Request denied due to active ongoing booking...'
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              Remarks are required before denying.
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
            onClick={() => !isEmpty && onConfirm(remarks.trim())}
            disabled={isSubmitting || isEmpty}
            className='border-muted-foreground text-muted-foreground hover:bg-muted/50'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Deny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
