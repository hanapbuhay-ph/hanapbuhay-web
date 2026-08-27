import { Archive, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type Announcement,
  type AnnouncementStatus,
  type AnnouncementTargetAudience,
} from '../types'

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AnnouncementStatus }) {
  if (status === 'published') {
    return (
      <Badge className='bg-green-600 text-white hover:bg-green-700'>
        Published
      </Badge>
    )
  }
  if (status === 'archived') {
    return (
      <Badge variant='secondary' className='text-muted-foreground'>
        Archived
      </Badge>
    )
  }
  // draft
  return <Badge variant='outline'>Draft</Badge>
}

// ── Audience badge ────────────────────────────────────────────────────────────

const AUDIENCE_CLASSES: Record<AnnouncementTargetAudience, string> = {
  all: 'bg-green-100 text-green-700 border-green-200',
  clients: 'bg-blue-100 text-blue-700 border-blue-200',
  workers: 'bg-amber-100 text-amber-700 border-amber-200',
}

const AUDIENCE_LABELS: Record<AnnouncementTargetAudience, string> = {
  all: 'All',
  clients: 'Clients',
  workers: 'Workers',
}

function AudienceBadge({ audience }: { audience: AnnouncementTargetAudience }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${AUDIENCE_CLASSES[audience]}`}
    >
      {AUDIENCE_LABELS[audience]}
    </span>
  )
}

// ── Date helper ───────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnnouncementsTableProps {
  data: Announcement[]
  isLoading: boolean
  error: string | null
  archivingId: number | null
  onEdit: (announcement: Announcement) => void
  onArchive: (announcement: Announcement) => void
  onRetry: () => void
}

export function AnnouncementsTable({
  data,
  isLoading,
  error,
  archivingId,
  onEdit,
  onArchive,
  onRetry,
}: AnnouncementsTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
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
            <TableHead>Title</TableHead>
            <TableHead className='w-32'>Audience</TableHead>
            <TableHead className='w-28 text-center'>Status</TableHead>
            <TableHead className='w-36'>Published At</TableHead>
            <TableHead className='w-36'>Expires At</TableHead>
            <TableHead className='w-36 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((announcement) => {
            const isArchived = announcement.status === 'archived'
            return (
              <TableRow
                key={announcement.id}
                className={isArchived ? 'opacity-60' : ''}
              >
                {/* Title */}
                <TableCell className='font-medium'>
                  {announcement.title}
                </TableCell>

                {/* Audience */}
                <TableCell>
                  <AudienceBadge audience={announcement.target_audience} />
                </TableCell>

                {/* Status */}
                <TableCell className='text-center'>
                  <StatusBadge status={announcement.status} />
                </TableCell>

                {/* Published At */}
                <TableCell className='text-sm text-muted-foreground'>
                  {formatDate(announcement.published_at)}
                </TableCell>

                {/* Expires At */}
                <TableCell className='text-sm text-muted-foreground'>
                  {formatDate(announcement.expires_at)}
                </TableCell>

                {/* Actions */}
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    {/* Edit — hidden for archived */}
                    {!isArchived && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => onEdit(announcement)}
                        aria-label={`Edit ${announcement.title}`}
                      >
                        <Pencil size={14} className='mr-1' />
                        Edit
                      </Button>
                    )}

                    {/* Archive — hidden for archived */}
                    {!isArchived && (
                      <Button
                        size='sm'
                        variant='ghost'
                        className='text-muted-foreground hover:text-foreground'
                        onClick={() => onArchive(announcement)}
                        disabled={archivingId === announcement.id}
                        aria-label={`Archive ${announcement.title}`}
                      >
                        <Archive size={14} className='mr-1' />
                        Archive
                      </Button>
                    )}

                    {/* Placeholder when archived so the row doesn't collapse */}
                    {isArchived && (
                      <span className='text-xs text-muted-foreground italic'>
                        Read-only
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}

          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className='py-10 text-center text-sm text-muted-foreground'
              >
                No announcements found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
