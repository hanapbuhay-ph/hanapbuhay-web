'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { name: string } | null
  onConfirm: (reason: string) => void
  isSubmitting?: boolean
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isSubmitting = false,
}: UserDeleteDialogProps) {
  const [reason, setReason] = useState('')

  if (!user) return null

  const isEmpty = reason.trim() === ''

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setReason('')
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-destructive'>
            <AlertTriangle
              className='me-1 inline-block stroke-destructive'
              size={18}
            />{' '}
            Delete User
          </DialogTitle>
          <DialogDescription>
            You are scheduling deletion of{' '}
            <span className='font-semibold text-foreground'>{user.name}</span>.
            They will receive a 24-hour notice before their account and related
            access are permanently removed.
          </DialogDescription>
        </DialogHeader>

        <Alert variant='destructive'>
          <AlertTitle>24-hour notice</AlertTitle>
          <AlertDescription>
            The user can continue using their account until the scheduled
            deletion time.
          </AlertDescription>
        </Alert>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='delete-reason'>
            Reason for deletion <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='delete-reason'
            placeholder='Explain why this account is being deleted...'
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() => onConfirm(reason.trim())}
            disabled={isSubmitting || isEmpty}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Deletion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
