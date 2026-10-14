import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  type VerificationHistoryEntry,
  type VerificationStatus,
} from '../types'
import { StatusBadge } from './status-badge'

interface VerificationHistoryProps {
  history: VerificationHistoryEntry[] | undefined
}

export function VerificationHistory({ history }: VerificationHistoryProps) {
  const [open, setOpen] = useState(false)

  // Hide section entirely if no history
  if (!history || history.length === 0) return null

  // Newest first
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  )

  return (
    <div
      className='rounded-2xl border border-border bg-card'
      style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
    >
      {/* Toggle header */}
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <span className='text-sm font-semibold text-foreground'>
          Verification History ({history.length}{' '}
          {history.length === 1 ? 'entry' : 'entries'})
        </span>
        {open ? (
          <ChevronUp className='h-4 w-4 shrink-0 text-muted-foreground' />
        ) : (
          <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
        )}
      </button>

      {/* Timeline */}
      {open && (
        <div className='border-t border-border px-5 pt-4 pb-5'>
          <ol className='flex flex-col gap-0'>
            {sorted.map((entry, idx) => (
              <li key={entry.id} className='flex gap-3'>
                {/* Timeline spine */}
                <div className='flex flex-col items-center'>
                  <div className='mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' />
                  {idx < sorted.length - 1 && (
                    <div className='w-px flex-1 bg-border' />
                  )}
                </div>

                {/* Entry content */}
                <div className='pb-5'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <StatusBadge status={entry.status as VerificationStatus} />
                    <span className='text-xs text-muted-foreground'>
                      {format(
                        new Date(entry.changed_at),
                        'MMM d, yyyy · h:mm a'
                      )}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      by{' '}
                      <span className='font-medium text-foreground'>
                        {entry.changed_by}
                      </span>
                    </span>
                  </div>
                  {entry.remarks && (
                    <p className='mt-1.5 text-sm text-muted-foreground'>
                      {entry.remarks}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
