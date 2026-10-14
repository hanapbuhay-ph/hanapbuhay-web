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
import { type TrustTier, ALL_TRUST_TIERS, TRUST_TIER_LABELS } from '../types'

interface ChangeTrustTierDialogProps {
  open: boolean
  workerName: string
  currentTier: TrustTier
  isSubmitting: boolean
  onConfirm: (tier: TrustTier, remarks: string) => void
  onCancel: () => void
}

export function ChangeTrustTierDialog({
  open,
  workerName,
  currentTier,
  isSubmitting,
  onConfirm,
  onCancel,
}: ChangeTrustTierDialogProps) {
  const [tier, setTier] = useState<TrustTier>(currentTier)
  const [remarks, setRemarks] = useState('')

  function handleOpenChange(o: boolean) {
    if (!o) {
      setTier(currentTier)
      setRemarks('')
      onCancel()
    }
  }

  const isValid = remarks.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='rounded-2xl border-border bg-card'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            Change Trust Tier
          </DialogTitle>
          <DialogDescription>
            Updating trust tier for{' '}
            <span className='font-semibold text-foreground'>{workerName}</span>.
            Both fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 py-1'>
          {/* Tier dropdown */}
          <div className='flex flex-col gap-1.5'>
            <Label className='text-sm font-semibold text-foreground'>
              New Trust Tier <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={tier}
              onValueChange={(v) => setTier(v as TrustTier)}
              disabled={isSubmitting}
            >
              <SelectTrigger className='rounded-lg border-border focus:ring-ring'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_TRUST_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TRUST_TIER_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks */}
          <div className='flex flex-col gap-1.5'>
            <Label
              htmlFor='tier-remarks'
              className='text-sm font-semibold text-foreground'
            >
              Remarks <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='tier-remarks'
              placeholder='Reason for changing the trust tier...'
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className='rounded-lg border-border focus-visible:ring-ring'
              disabled={isSubmitting}
            />
            {!isValid && (
              <p className='text-xs text-muted-foreground'>
                Remarks are required before confirming.
              </p>
            )}
          </div>
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
            onClick={() => isValid && onConfirm(tier, remarks.trim())}
            disabled={isSubmitting || !isValid}
            className='bg-primary text-white hover:bg-primary/90'
          >
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
