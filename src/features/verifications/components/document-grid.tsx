import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type VerificationDocument, DOCUMENT_LABELS } from '../types'

interface DocumentGridProps {
  documents: VerificationDocument[]
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  const [selected, setSelected] = useState<VerificationDocument | null>(null)

  return (
    <>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
        {documents.map((doc) => (
          <button
            key={doc.id}
            type='button'
            onClick={() => setSelected(doc)}
            className='group flex flex-col gap-1.5 text-left focus:outline-none'
          >
            <div
              className='overflow-hidden rounded-2xl border border-border bg-card transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <img
                src={doc.file_url}
                alt={DOCUMENT_LABELS[doc.type] ?? doc.type}
                className='aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105'
              />
            </div>
            <span className='px-0.5 text-xs font-semibold text-foreground'>
              {DOCUMENT_LABELS[doc.type] ?? doc.type}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className='max-w-2xl rounded-2xl border-border bg-card p-4'>
          <DialogHeader>
            <DialogTitle className='text-sm font-semibold text-foreground'>
              {selected ? (DOCUMENT_LABELS[selected.type] ?? selected.type) : ''}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <img
              src={selected.file_url}
              alt={DOCUMENT_LABELS[selected.type] ?? selected.type}
              className='mt-2 w-full rounded-xl border border-border object-contain'
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
