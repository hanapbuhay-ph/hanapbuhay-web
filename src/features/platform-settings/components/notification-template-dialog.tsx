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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type NotificationChannel,
  type NotificationTemplate,
  type NotificationTemplatePayload,
} from '../types'

interface NotificationTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: NotificationTemplate
  isSubmitting: boolean
  onConfirm: (payload: NotificationTemplatePayload) => void
}

type FormState = {
  title: string
  channel: NotificationChannel
  subject: string
  body: string
  is_active: boolean
}

export function NotificationTemplateDialog({
  open,
  onOpenChange,
  template,
  isSubmitting,
  onConfirm,
}: NotificationTemplateDialogProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    channel: 'push',
    subject: '',
    body: '',
    is_active: true,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Pre-fill whenever the dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        title: template.title,
        channel: template.channel,
        subject: template.subject ?? '',
        body: template.body,
        is_active: template.is_active,
      })
      setErrors({})
    }
  }, [open, template])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.channel) next.channel = 'Channel is required.'
    if (form.channel === 'email' && !form.subject.trim())
      next.subject = 'Subject is required for email notifications.'
    if (!form.body.trim()) next.body = 'Body is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onConfirm({
      title: form.title.trim(),
      channel: form.channel,
      subject: form.channel === 'email' ? form.subject.trim() : null,
      body: form.body.trim(),
      is_active: form.is_active,
      last_updated_at: new Date().toISOString(),
    })
  }

  const isEmailChannel = form.channel === 'email'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Edit Notification Template</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Key — read-only */}
          <div className='space-y-1.5'>
            <Label htmlFor='nt-key'>Key</Label>
            <Input
              id='nt-key'
              value={template.key}
              disabled
              className='bg-muted font-mono text-muted-foreground'
              aria-label='Key (read-only)'
            />
            <p className='text-xs text-muted-foreground'>
              System identifier — cannot be changed.
            </p>
          </div>

          {/* Title */}
          <div className='space-y-1.5'>
            <Label htmlFor='nt-title'>
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='nt-title'
              placeholder='e.g. Booking Confirmed'
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className='text-xs text-destructive'>{errors.title}</p>
            )}
          </div>

          {/* Channel */}
          <div className='space-y-1.5'>
            <Label htmlFor='nt-channel'>
              Channel <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={form.channel}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, channel: v as NotificationChannel }))
              }
            >
              <SelectTrigger id='nt-channel' aria-invalid={!!errors.channel}>
                <SelectValue placeholder='Select channel' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='push'>Push</SelectItem>
                <SelectItem value='email'>Email</SelectItem>
                <SelectItem value='sms'>SMS</SelectItem>
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className='text-xs text-destructive'>{errors.channel}</p>
            )}
          </div>

          {/* Subject — only shown for email */}
          {isEmailChannel && (
            <div className='space-y-1.5'>
              <Label htmlFor='nt-subject'>
                Subject <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='nt-subject'
                placeholder='e.g. Your HanapBuhay account has been suspended'
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                aria-invalid={!!errors.subject}
              />
              {errors.subject && (
                <p className='text-xs text-destructive'>{errors.subject}</p>
              )}
            </div>
          )}

          {/* Body */}
          <div className='space-y-1.5'>
            <Label htmlFor='nt-body'>
              Body <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='nt-body'
              placeholder='Notification message body'
              rows={4}
              value={form.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, body: e.target.value }))
              }
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className='text-xs text-destructive'>{errors.body}</p>
            )}

            {/* Available variables — read-only chip list */}
            {template.variables.length > 0 && (
              <div className='mt-1.5 rounded-md bg-muted/50 px-3 py-2'>
                <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
                  Available variables:
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {template.variables.map((v) => (
                    <span
                      key={v}
                      className='inline-flex items-center rounded bg-background px-1.5 py-0.5 font-mono text-xs text-foreground ring-1 ring-border'
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className='flex items-center justify-between rounded-lg border border-border px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Active</p>
              <p className='text-xs text-muted-foreground'>
                Inactive templates suppress that notification type
                platform-wide.
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
