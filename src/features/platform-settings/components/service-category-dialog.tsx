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
import { type ServiceCategory, type ServiceCategoryPayload } from '../types'

interface ServiceCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when adding */
  category?: ServiceCategory
  isSubmitting: boolean
  onConfirm: (payload: ServiceCategoryPayload) => void
}

const EMPTY: ServiceCategoryPayload = {
  name: '',
  description: '',
  is_active: true,
}

export function ServiceCategoryDialog({
  open,
  onOpenChange,
  category,
  isSubmitting,
  onConfirm,
}: ServiceCategoryDialogProps) {
  const [form, setForm] = useState<ServiceCategoryPayload>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceCategoryPayload, string>>>({})

  const isEditing = !!category

  // Pre-fill when editing, reset when adding
  useEffect(() => {
    if (open) {
      setForm(
        category
          ? { name: category.name, description: category.description, is_active: category.is_active }
          : EMPTY
      )
      setErrors({})
    }
  }, [open, category])

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onConfirm({ name: form.name.trim(), description: form.description.trim(), is_active: form.is_active })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Service Category' : 'Add Service Category'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Name */}
          <div className='space-y-1.5'>
            <Label htmlFor='sc-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='sc-name'
              placeholder='e.g. Plumbing'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className='text-xs text-destructive'>{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <Label htmlFor='sc-description'>
              Description <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='sc-description'
              placeholder='Short description of this category'
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
                Inactive categories are hidden from workers and clients.
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
            {isSubmitting
              ? isEditing
                ? 'Saving…'
                : 'Adding…'
              : isEditing
                ? 'Save Changes'
                : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
