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
import { type ReportReason } from '../types'

interface ReportReasonsTableProps {
  data: ReportReason[]
  isLoading: boolean
  error: string | null
  togglingId: number | null
  onEdit: (reason: ReportReason) => void
  onToggle: (reason: ReportReason) => void
  onRetry: () => void
}

export function ReportReasonsTable({
  data,
  isLoading,
  error,
  togglingId,
  onEdit,
  onToggle,
  onRetry,
}: ReportReasonsTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 8 }).map((_, i) => (
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
            <TableHead className='w-40'>Code</TableHead>
            <TableHead className='w-44'>Label</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='w-28 text-center'>Status</TableHead>
            <TableHead className='w-32 text-center'>Active</TableHead>
            <TableHead className='w-20 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((reason) => (
            <TableRow
              key={reason.id}
              className={reason.is_active ? '' : 'opacity-60'}
            >
              {/* Code */}
              <TableCell>
                <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-mono'>
                  {reason.code}
                </code>
              </TableCell>

              {/* Label */}
              <TableCell className='font-medium'>{reason.label}</TableCell>

              {/* Description */}
              <TableCell className='text-sm text-muted-foreground'>
                {reason.description}
              </TableCell>

              {/* Status badge */}
              <TableCell className='text-center'>
                <Badge
                  variant={reason.is_active ? 'default' : 'secondary'}
                  className={
                    reason.is_active
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : ''
                  }
                >
                  {reason.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              {/* Toggle */}
              <TableCell className='text-center'>
                <Switch
                  checked={reason.is_active}
                  onCheckedChange={() => onToggle(reason)}
                  disabled={togglingId === reason.id}
                  aria-label={`Toggle ${reason.label}`}
                />
              </TableCell>

              {/* Edit */}
              <TableCell className='text-right'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onEdit(reason)}
                  aria-label={`Edit ${reason.label}`}
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
                colSpan={6}
                className='py-10 text-center text-sm text-muted-foreground'
              >
                No report reasons found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
