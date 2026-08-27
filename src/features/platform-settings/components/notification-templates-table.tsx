import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type NotificationTemplate, type NotificationChannel } from '../types'

// ── Channel badge ─────────────────────────────────────────────────────────────

const CHANNEL_CLASSES: Record<NotificationChannel, string> = {
  push: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-amber-100 text-amber-700 border-amber-200',
  sms: 'bg-purple-100 text-purple-700 border-purple-200',
}

function ChannelBadge({ channel }: { channel: NotificationChannel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${CHANNEL_CLASSES[channel]}`}
    >
      {channel}
    </span>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface NotificationTemplatesTableProps {
  data: NotificationTemplate[]
  isLoading: boolean
  error: string | null
  togglingId: number | null
  onEdit: (template: NotificationTemplate) => void
  onToggle: (template: NotificationTemplate) => void
  onRetry: () => void
}

export function NotificationTemplatesTable({
  data,
  isLoading,
  error,
  togglingId,
  onEdit,
  onToggle,
  onRetry,
}: NotificationTemplatesTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='h-12 animate-pulse rounded-lg bg-muted' />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
        {error}
        <Button
          variant='link'
          size='sm'
          className='ml-2 h-auto p-0 text-destructive underline'
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-48'>Key</TableHead>
            <TableHead className='w-44'>Title</TableHead>
            <TableHead className='w-24'>Channel</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead className='w-28 text-center'>Status</TableHead>
            <TableHead className='w-32 text-center'>Active</TableHead>
            <TableHead className='w-36 text-right'>Last Updated</TableHead>
            <TableHead className='w-20 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((template) => (
            <TableRow
              key={template.id}
              className={template.is_active ? '' : 'opacity-60'}
            >
              {/* Key — read-only monospace */}
              <TableCell>
                <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-mono'>
                  {template.key}
                </code>
              </TableCell>

              {/* Title */}
              <TableCell className='font-medium'>{template.title}</TableCell>

              {/* Channel badge */}
              <TableCell>
                <ChannelBadge channel={template.channel} />
              </TableCell>

              {/* Variables — small chips */}
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {template.variables.map((v) => (
                    <span
                      key={v}
                      className='inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground'
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </TableCell>

              {/* Status badge */}
              <TableCell className='text-center'>
                <Badge
                  variant={template.is_active ? 'default' : 'secondary'}
                  className={
                    template.is_active
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : ''
                  }
                >
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              {/* Active toggle */}
              <TableCell className='text-center'>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => onToggle(template)}
                  disabled={togglingId === template.id}
                  aria-label={`Toggle ${template.title}`}
                />
              </TableCell>

              {/* Last updated */}
              <TableCell className='text-right text-xs text-muted-foreground'>
                {new Date(template.last_updated_at).toLocaleDateString(
                  'en-PH',
                  { year: 'numeric', month: 'short', day: 'numeric' }
                )}
              </TableCell>

              {/* Edit */}
              <TableCell className='text-right'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onEdit(template)}
                  aria-label={`Edit ${template.title}`}
                >
                  <Pencil size={14} className='mr-1' />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className='py-10 text-center text-sm text-muted-foreground'
              >
                No notification templates found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
