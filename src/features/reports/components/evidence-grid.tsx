import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EvidenceGridProps {
  urls: string[]
}

export function EvidenceGrid({ urls }: EvidenceGridProps) {
  const [selected, setSelected] = useState<string | null>(null)

  if (urls.length === 0) {
    return (
      <div className='flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border py-8 text-center'>
        <ImageOff className='h-6 w-6 text-muted-foreground' />
        <p className='text-xs text-muted-foreground'>No evidence submitted.</p>
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
        {urls.map((url, i) => (
          <button
            key={i}
            type='button'
            onClick={() => setSelected(url)}
            className='group flex flex-col gap-1.5 text-left focus:outline-none'
          >
            <div
              className='overflow-hidden rounded-2xl border border-border bg-card transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring'
              style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
            >
              <img
                src={url}
                alt={`Evidence ${i + 1}`}
                className='aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105'
              />
            </div>
            <span className='px-0.5 text-xs font-semibold text-foreground'>
              Evidence {i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className='max-w-2xl rounded-2xl border-border bg-card p-4'>
          <DialogHeader>
            <DialogTitle className='text-sm font-semibold text-foreground'>
              Evidence
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <img
              src={selected}
              alt='Evidence full size'
              className='mt-2 w-full rounded-xl border border-border object-contain'
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
