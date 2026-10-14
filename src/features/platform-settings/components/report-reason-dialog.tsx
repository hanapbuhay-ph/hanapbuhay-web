/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type ReportReason, type ReportReasonPayload } from '../types'

interface ReportReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: ReportReason
  isSubmitting: boolean
  onConfirm: (payload: ReportReasonPayload) => void
}

type ReportReasonForm = Omit<
  ReportReasonPayload,
  'description' | 'is_active'
> & {
  description: string
  is_active: boolean
}

export function ReportReasonDialog({
  open,
  onOpenChange,
  reason,
  isSubmitting,
  onConfirm,
}: ReportReasonDialogProps) {
  const [form, setForm] = useState<ReportReasonForm>({
    label: '',
    description: '',
    is_active: true,
    audience: 'client',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ReportReasonPayload, string>>
  >({})

  const generatedCode = form.label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'other'

  // Pre-fill whenever the dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        label: reason.label,
        description: reason.description ?? '',
        is_active: reason.is_active ?? true,
        audience: reason.audience,
      })
      setErrors({})
    }
  }, [open, reason])

  function validate(): boolean {
    const next: Partial<Record<keyof ReportReasonForm, string>> = {}
    if (!form.label.trim()) next.label = 'Label is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onConfirm({
      code: generatedCode,
      label: form.label.trim(),
      description: form.description.trim(),
      is_active: form.is_active,
      audience: form.audience,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Report Reason</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Code — auto-generated */}
          <div className='space-y-1.5'>
            <Label htmlFor='rr-code'>Code</Label>
            <Input
              id='rr-code'
              value={generatedCode}
              disabled
              className='bg-muted text-muted-foreground'
              aria-label='Generated code'
            />
            <p className='text-xs text-muted-foreground'>
              Auto-generated from the label. Admins do not need to type it.
            </p>
          </div>

          {/* Label */}
          <div className='space-y-1.5'>
            <Label>Applies to</Label>
            <div className='flex gap-2'>
              {(['client', 'worker'] as const).map((value) => (
                <Button key={value} type='button' variant={form.audience === value ? 'default' : 'outline'} onClick={() => setForm((f) => ({ ...f, audience: value }))}>
                  {value === 'client' ? 'Client reports' : 'Worker reports'}
                </Button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className='space-y-1.5'>
            <Label htmlFor='rr-label'>
              Label <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='rr-label'
              placeholder='e.g. No Show'
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              aria-invalid={!!errors.label}
            />
            {errors.label && (
              <p className='text-xs text-destructive'>{errors.label}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <Label htmlFor='rr-description'>
              Description <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='rr-description'
              placeholder='Short description shown to users'
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className='text-xs text-destructive'>{errors.description}</p>
            )}
          </div>

          {/* Active toggle */}
          <div className='flex items-center justify-between rounded-lg border border-border px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Active</p>
              <p className='text-xs text-muted-foreground'>
                Inactive reasons are hidden from the report form.
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, is_active: checked }))
              }
              aria-label='Active status'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
