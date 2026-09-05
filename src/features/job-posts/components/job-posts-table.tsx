import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, RefreshCw, InboxIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type JobPost } from '../types'
import { useJobPostAction } from '../hooks/use-job-post-action'
import { DeletePostDialog } from './delete-post-dialog'

interface JobPostsTableProps {
  data: JobPost[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onDeleted: (id: number) => void
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className='h-4 w-40' /></TableCell>
          <TableCell><Skeleton className='h-4 w-28' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell><Skeleton className='h-4 w-20' /></TableCell>
          <TableCell><Skeleton className='h-5 w-14 rounded-full' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell><Skeleton className='h-7 w-8' /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function JobPostsTable({
  data,
  isLoading,
  error,
  onRetry,
  onDeleted,
}: JobPostsTableProps) {
  const { isSubmitting, deletePost } = useJobPostAction()
  const [deletingPost, setDeletingPost] = useState<JobPost | null>(null)

  return (
    <>
      <div
        className='overflow-x-auto rounded-2xl border border-border bg-card'
        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
      >
        <Table className='min-w-[760px]'>
          <TableHeader>
            <TableRow className='bg-background hover:bg-background'>
              <TableHead className='ps-4 font-semibold text-foreground'>Title</TableHead>
              <TableHead className='font-semibold text-foreground'>Worker</TableHead>
              <TableHead className='font-semibold text-foreground'>Category</TableHead>
              <TableHead className='font-semibold text-foreground'>Rate</TableHead>
              <TableHead className='font-semibold text-foreground'>Status</TableHead>
              <TableHead className='font-semibold text-foreground'>Created</TableHead>
              <TableHead className='font-semibold text-foreground'></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && <TableSkeleton />}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <AlertTriangle className='h-7 w-7 text-destructive' />
                    <p className='text-sm font-semibold text-foreground'>
                      Failed to load job posts
                    </p>
                    <p className='text-xs text-muted-foreground'>{error}</p>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={onRetry}
                      className='mt-1 border-border text-primary hover:bg-primary/5'
                    >
                      <RefreshCw className='h-3.5 w-3.5' />
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <InboxIcon className='h-7 w-7 text-muted-foreground' />
                    <p className='text-sm font-semibold text-foreground'>
                      No job posts found
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Try changing the filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && data.map((post) => (
              <TableRow key={post.id} className='hover:bg-primary/5'>
                <TableCell className='ps-4 font-medium text-foreground'>
                  {post.title}
                  {post.deleted_at && (
                    <span className='ml-2 text-xs text-muted-foreground'>(deleted)</span>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground'>{post.worker.name}</TableCell>
                <TableCell className='text-muted-foreground'>{post.category.name}</TableCell>
                <TableCell className='text-muted-foreground'>{post.rate_display}</TableCell>
                <TableCell>
                  <span className={[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    post.is_active
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  ].join(' ')}>
                    {post.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    size='icon'
                    variant='ghost'
                    disabled={isSubmitting}
                    onClick={() => setDeletingPost(post)}
                    className='h-7 w-7 text-destructive hover:bg-destructive/10'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                    <span className='sr-only'>Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeletePostDialog
        open={!!deletingPost}
        postTitle={deletingPost?.title ?? ''}
        isSubmitting={isSubmitting}
        onConfirm={() => {
          if (!deletingPost) return
          void deletePost(deletingPost.id, () => {
            onDeleted(deletingPost.id)
            setDeletingPost(null)
          })
        }}
        onCancel={() => setDeletingPost(null)}
      />
    </>
  )
}
