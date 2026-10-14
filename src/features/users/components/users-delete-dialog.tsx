'use client'

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { name: string } | null
  onConfirm: () => void
  isSubmitting?: boolean
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isSubmitting = false,
}: UserDeleteDialogProps) {
  if (!user) return null

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2 text-sm text-foreground'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{user.name}</span>?
            <br />
            This will permanently remove this account and related access from the
            system. This action cannot be undone.
          </p>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This user will lose access immediately, and the action cannot be
              rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isSubmitting ? 'Deleting...' : 'Delete'}
      destructive
      isLoading={isSubmitting}
      handleConfirm={onConfirm}
    />
  )
}
