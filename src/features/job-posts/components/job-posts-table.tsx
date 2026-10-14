import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  RefreshCw,
  InboxIcon,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useJobPostAction } from '../hooks/use-job-post-action'
import { type JobPostsSearch } from '../route-search'
import { type JobPost } from '../types'
import { DeletePostDialog } from './delete-post-dialog'

interface JobPostsTableProps {
  data: JobPost[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onDeleted: (id: number) => void
  onEdit: (post: JobPost) => void
  detailSearch: JobPostsSearch
  isSelecting: boolean
  selectedIds: number[]
  onToggleSelection: (id: number) => void
  onSelectPage: (ids: number[], checked: boolean) => void
  onStartSelection: (id: number) => void
}

function TableSkeleton({ isSelecting }: { isSelecting: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {isSelecting && (
            <TableCell>
              <Skeleton className='h-4 w-4' />
            </TableCell>
          )}
          <TableCell>
            <Skeleton className='h-4 w-40' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-28' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-20' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-14 rounded-full' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-7 w-8' />
          </TableCell>
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
  onEdit,
  detailSearch,
  isSelecting,
  selectedIds,
  onToggleSelection,
  onSelectPage,
  onStartSelection,
}: JobPostsTableProps) {
  const navigate = useNavigate()
  const { isSubmitting, deletePost } = useJobPostAction()
  const [deletingPost, setDeletingPost] = useState<JobPost | null>(null)
  const pageIds = data.map((post) => post.id)
  const selectedPageCount = pageIds.filter((id) =>
    selectedIds.includes(id)
  ).length
  const allPageSelected =
    pageIds.length > 0 && selectedPageCount === pageIds.length
  const somePageSelected = selectedPageCount > 0 && !allPageSelected

  function viewPost(post: JobPost) {
    void navigate({
      to: '/job-posts/$id',
      params: { id: String(post.id) },
      search: detailSearch,
    })
  }

  return (
    <>
      <div
        className='overflow-x-auto rounded-2xl border border-border bg-card'
        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
      >
        <Table className={isSelecting ? 'min-w-[880px]' : 'min-w-[840px]'}>
          <TableHeader>
            <TableRow className='bg-background hover:bg-background'>
              {isSelecting && (
                <TableHead className='w-12 ps-4'>
                  <Checkbox
                    checked={
                      allPageSelected
                        ? true
                        : somePageSelected
                          ? 'indeterminate'
                          : false
                    }
                    aria-label='Select all job posts on this page'
                    onCheckedChange={(checked) =>
                      onSelectPage(pageIds, !!checked)
                    }
                  />
                </TableHead>
              )}
              <TableHead className='ps-4 font-semibold text-foreground'>
                Title
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Worker
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Barangay
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Category
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Rate
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Status
              </TableHead>
              <TableHead className='font-semibold text-foreground'>
                Created
              </TableHead>
              <TableHead className='font-semibold text-foreground'></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && <TableSkeleton isSelecting={isSelecting} />}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={isSelecting ? 9 : 8}>
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
                <TableCell colSpan={isSelecting ? 9 : 8}>
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

            {!isLoading &&
              !error &&
              data.map((post) => (
                <TableRow
                  key={post.id}
                  className={
                    isSelecting
                      ? 'cursor-default hover:bg-primary/5'
                      : 'cursor-pointer hover:bg-primary/5'
                  }
                  onClick={() => {
                    if (isSelecting) onToggleSelection(post.id)
                    else viewPost(post)
                  }}
                >
                  {isSelecting && (
                    <TableCell
                      className='ps-4'
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(post.id)}
                        aria-label={`Select ${post.title}`}
                        onCheckedChange={() => onToggleSelection(post.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className='ps-4 font-medium text-foreground'>
                    {post.title}
                    {post.deleted_at && (
                      <span className='ml-2 text-xs text-muted-foreground'>
                        (deleted)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {post.worker.name}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {post.worker.barangay ?? '—'}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {post.category.name}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {post.rate_display}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        post.is_active && !post.deleted_at
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {post.deleted_at
                        ? 'Deleted'
                        : post.is_active
                          ? 'Active'
                          : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size='icon'
                          variant='ghost'
                          disabled={isSubmitting}
                          aria-label={`Actions for ${post.title}`}
                          className='h-7 w-7'
                        >
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => viewPost(post)}>
                          <Eye className='h-4 w-4' />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Pencil className='h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStartSelection(post.id)}
                        >
                          <ListChecks className='h-4 w-4' />
                          Select
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => setDeletingPost(post)}
                        >
                          <Trash2 className='h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        onConfirm={(reason) => {
          if (!deletingPost) return
          void deletePost(deletingPost.id, reason, () => {
            onDeleted(deletingPost.id)
            setDeletingPost(null)
          })
        }}
        onCancel={() => setDeletingPost(null)}
      />
    </>
  )
}
