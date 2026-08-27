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

interface SuspendDialogProps {
  open: boolean
  userName: string
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function SuspendDialog({
  open,
  userName,
  isSubmitting,
  onConfirm,
  onCancel,
}: SuspendDialogProps) {
  const [reason, setReason] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setReason('')
      onCancel()
    }
  }

  function handleConfirm() {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  const isEmpty = reason.trim() === ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Suspend User</DialogTitle>
          <DialogDescription>
            You are suspending{' '}
            <span className='font-semibold text-foreground'>{userName}</span>.
            They will lose access to the platform immediately.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <Label
            htmlFor='suspend-reason'
            className='text-sm font-semibold text-foreground'
          >
            Reason for suspension{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='suspend-reason'
            placeholder='e.g. Repeated violations of community guidelines...'
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className='rounded-lg border-border focus-visible:ring-ring'
            disabled={isSubmitting}
          />
          {isEmpty && (
            <p className='text-xs text-muted-foreground'>
              A reason is required before suspending.
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
            onClick={handleConfirm}
            disabled={isSubmitting || isEmpty}
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Suspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
