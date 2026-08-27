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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type ResolutionAction,
  RESOLUTION_ACTION_LABELS,
} from '../types'

interface ResolveDialogProps {
  open: boolean
  bookingCode: string
  isSubmitting: boolean
  onConfirm: (resolutionAction: ResolutionAction, adminRemarks: string) => void
  onCancel: () => void
}

const RESOLUTION_OPTIONS = Object.entries(RESOLUTION_ACTION_LABELS) as [
  ResolutionAction,
  string,
][]

export function ResolveDialog({
  open,
  bookingCode,
  isSubmitting,
  onConfirm,
  onCancel,
}: ResolveDialogProps) {
  const [action, setAction] = useState<ResolutionAction | ''>('')
  const [remarks, setRemarks] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setAction('')
      setRemarks('')
      onCancel()
    }
  }

  const isValid = action !== '' && remarks.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Resolve Report</DialogTitle>
          <DialogDescription>
            Resolving report for booking{' '}
            <span className='font-mono font-semibold text-foreground'>
              {bookingCode}
            </span>
            . Both fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 py-1'>
          {/* Resolution action dropdown */}
          <div className='flex flex-col gap-1.5'>
            <Label className='text-sm font-semibold text-foreground'>
              Resolution Action <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as ResolutionAction)}
              disabled={isSubmitting}
            >
              <SelectTrigger className='rounded-lg border-border focus:ring-ring'>
                <SelectValue placeholder='Select an action…' />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTION_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin remarks */}
          <div className='flex flex-col gap-1.5'>
            <Label
              htmlFor='resolve-remarks'
              className='text-sm font-semibold text-foreground'
            >
              Admin Remarks <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='resolve-remarks'
              placeholder='Describe the resolution outcome…'
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className='rounded-lg border-border focus-visible:ring-ring'
              disabled={isSubmitting}
            />
          </div>

          {!isValid && (
            <p className='text-xs text-muted-foreground'>
              Both fields must be filled to confirm.
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
            onClick={() => isValid && onConfirm(action as ResolutionAction, remarks.trim())}
            disabled={isSubmitting || !isValid}
            className='bg-primary text-white hover:bg-primary/90'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
