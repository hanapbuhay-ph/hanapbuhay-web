import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type Announcement,
  type AnnouncementPayload,
  type AnnouncementStatus,
  type AnnouncementTargetAudience,
} from '../types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when creating */
  announcement?: Announcement
  isSubmitting: boolean
  onConfirm: (payload: AnnouncementPayload) => void
}

// ── Form state ────────────────────────────────────────────────────────────────

type FormState = {
  title: string
  body: string
  target_audience: AnnouncementTargetAudience
  status: 'draft' | 'published'
  expires_at: Date | undefined
}

const EMPTY: FormState = {
  title: '',
  body: '',
  target_audience: 'all',
  status: 'draft',
  expires_at: undefined,
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  isSubmitting,
  onConfirm,
}: AnnouncementDialogProps) {
  const isEditing = !!announcement
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Pre-fill on open
  useEffect(() => {
    if (open) {
      if (announcement) {
        setForm({
          title: announcement.title,
          body: announcement.body,
          target_audience: announcement.target_audience,
          // Archived announcements cannot be set back; clamp to draft/published
          status:
            announcement.status === 'archived' ? 'draft' : announcement.status,
          expires_at: announcement.expires_at
            ? new Date(announcement.expires_at)
            : undefined,
        })
      } else {
        setForm(EMPTY)
      }
      setErrors({})
    }
  }, [open, announcement])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.body.trim()) next.body = 'Body is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const now = new Date().toISOString()
    const payload: AnnouncementPayload = {
      title: form.title.trim(),
      body: form.body.trim(),
      target_audience: form.target_audience,
      status: form.status as AnnouncementStatus,
      published_at:
        form.status === 'published'
          ? (announcement?.published_at ?? now)
          : null,
      expires_at: form.expires_at ? form.expires_at.toISOString() : null,
      created_at: announcement?.created_at ?? now,
    }
    onConfirm(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Announcement' : 'New Announcement'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Title */}
          <div className='space-y-1.5'>
            <Label htmlFor='ann-title'>
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='ann-title'
              placeholder='e.g. Platform Maintenance Notice'
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

          {/* Body */}
          <div className='space-y-1.5'>
            <Label htmlFor='ann-body'>
              Body <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='ann-body'
              placeholder='Write the announcement message…'
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
          </div>

          {/* Target Audience */}
          <div className='space-y-1.5'>
            <Label htmlFor='ann-audience'>Target Audience</Label>
            <Select
              value={form.target_audience}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  target_audience: v as AnnouncementTargetAudience,
                }))
              }
            >
              <SelectTrigger id='ann-audience'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='clients'>Clients</SelectItem>
                <SelectItem value='workers'>Workers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status — draft or published only (archived is set via archive action) */}
          <div className='space-y-1.5'>
            <Label htmlFor='ann-status'>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  status: v as 'draft' | 'published',
                }))
              }
            >
              <SelectTrigger id='ann-status'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='published'>Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expires At — optional date picker */}
          <div className='space-y-1.5'>
            <Label>Expires At (optional)</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                  aria-label='Pick expiry date'
                >
                  <CalendarIcon size={14} className='mr-2 opacity-60' />
                  {form.expires_at ? (
                    format(form.expires_at, 'PPP')
                  ) : (
                    <span className='text-muted-foreground'>
                      No expiry date
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={form.expires_at}
                  onSelect={(date) => {
                    setForm((f) => ({ ...f, expires_at: date ?? undefined }))
                    setCalendarOpen(false)
                  }}
                  initialFocus
                />
                {form.expires_at && (
                  <div className='border-t p-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full text-muted-foreground'
                      onClick={() => {
                        setForm((f) => ({ ...f, expires_at: undefined }))
                        setCalendarOpen(false)
                      }}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
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
                : 'Creating…'
              : isEditing
                ? 'Save Changes'
                : 'Create Announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
