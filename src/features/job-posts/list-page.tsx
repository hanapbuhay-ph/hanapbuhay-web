import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, SearchIcon, Trash2 } from 'lucide-react'
import { useUsers } from '@/features/users/hooks/use-users'
import { type User } from '@/features/users/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { JobPostsTable } from './components/job-posts-table'
import { JobPostFormDialog } from './components/job-post-form-dialog'
import { DeletePostDialog } from './components/delete-post-dialog'
import { useJobPosts } from './hooks/use-job-posts'
import { useJobPostAction } from './hooks/use-job-post-action'
import { type JobPost, type JobPostStatusFilter, type JobPostVerificationFilter } from './types'
import { WorkersTable } from './components/workers-table'
import { type JobPostsSearch } from './route-search'

interface Category {
  id: number
  name: string
}

interface Barangay {
  id: number
  name: string
}

export function JobPostsListPage({ search }: { search: JobPostsSearch }) {
  const navigate = useNavigate()
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null)
  const [restoredWorkerId, setRestoredWorkerId] = useState<string | null>(null)
  const [failedWorkerRestoreId, setFailedWorkerRestoreId] = useState<string | null>(null)
  const [workerPage, setWorkerPage] = useState(search.workerPage ?? 1)
  const [barangayId, setBarangayId] = useState<number | null>(search.barangayId ?? null)
  const [postStatus, setPostStatus] = useState<JobPostStatusFilter>(search.postStatus ?? 'all')
  const [verification, setVerification] = useState<JobPostVerificationFilter>(search.verification ?? 'all')
  const [page, setPage] = useState(search.postPage ?? 1)
  const [workerSearch, setWorkerSearch] = useState(search.workerSearch ?? '')
  const [postSearch, setPostSearch] = useState(search.postSearch ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(search.categoryId ?? null)
  const [postFormOpen, setPostFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<JobPost | null>(null)
  const [isSelectingPosts, setIsSelectingPosts] = useState(false)
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const { isSubmitting: isBulkDeleting, deletePosts } = useJobPostAction()
  const [categories, setCategories] = useState<Category[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const {
    data: workers,
    isLoading: workersLoading,
    error: workersError,
    pagination: workersPagination,
    refetch: refetchWorkers,
  } = useUsers('worker', 'all', workerSearch, workerPage, verification, barangayId)
  const workerFromList = search.workerId
    ? workers.find((worker) => String(worker.id) === search.workerId) ?? null
    : null
  const activeWorker =
    selectedWorker &&
    (!search.workerId || String(selectedWorker.id) === search.workerId)
      ? selectedWorker
      : workerFromList
  const { data, pagination, isLoading, error, refetch } = useJobPosts(
    categoryId,
    null,
    postStatus,
    'all',
    postSearch,
    page,
    activeWorker
      ? (activeWorker.worker_profile_id ?? -1)
      : undefined,
  )
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  useEffect(() => {
    if (!search.workerId) return

    const workerId = search.workerId
    if (workerFromList) return

    let cancelled = false
    api.get(`/admin/users/${workerId}`)
      .then(({ data: response }) => {
        if (cancelled) return
        const worker = response.data
        setSelectedWorker({
          id: worker.id,
          name: worker.name,
          email: worker.email,
          role: worker.role,
          barangay: worker.barangay,
          barangay_id: worker.barangay_id,
          worker_profile_id: worker.worker_profile_id,
          is_active: worker.is_active,
          created_at: worker.created_at,
          profile_photo_url: worker.profile_photo_url,
        })
        setRestoredWorkerId(workerId)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailedWorkerRestoreId(workerId)
          toast.error(error instanceof Error ? error.message : 'Failed to restore the selected worker.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [search.workerId, workerFromList])

  useEffect(() => {
    Promise.all([api.get('/service-categories'), api.get('/barangays')])
      .then(([categoryResponse, barangayResponse]) => {
        setCategories(Array.isArray(categoryResponse.data?.data) ? categoryResponse.data.data : [])
        setBarangays(Array.isArray(barangayResponse.data?.data) ? barangayResponse.data.data : [])
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load job post categories and barangays.',
        )
      })
  }, [])

  const visible = data.filter((p) => !deletedIds.includes(p.id))
  const detailSearch: JobPostsSearch = {
    workerId: activeWorker ? String(activeWorker.id) : undefined,
    workerPage,
    workerSearch,
    barangayId: barangayId ?? undefined,
    verification,
    categoryId: categoryId ?? undefined,
    postStatus,
    postSearch,
    postPage: page,
  }

  function startPostSelection(postId: number) {
    setIsSelectingPosts(true)
    setSelectedPostIds((current) =>
      current.includes(postId) ? current : [...current, postId],
    )
  }

  function togglePostSelection(postId: number) {
    setSelectedPostIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    )
  }

  function togglePageSelection(ids: number[], checked: boolean) {
    setSelectedPostIds((current) => {
      const pageIdSet = new Set(ids)
      const outsidePage = current.filter((id) => !pageIdSet.has(id))
      return checked ? [...outsidePage, ...ids] : outsidePage
    })
  }

  function clearPostSelection() {
    setIsSelectingPosts(false)
    setSelectedPostIds([])
  }
  const isRestoringWorker = Boolean(
    search.workerId &&
    !activeWorker &&
    restoredWorkerId !== search.workerId &&
    failedWorkerRestoreId !== search.workerId,
  )

  if (!activeWorker) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center gap-2'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Job Post Oversight
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Select a worker to view and manage their service listings.
            </p>
          </div>
          <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
            <div className='relative w-full lg:max-w-xs'>
              <SearchIcon className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search worker'
                value={workerSearch}
                onChange={(event) => {
                  setWorkerSearch(event.target.value)
                  setWorkerPage(1)
                }}
                className='border-border pl-9'
              />
            </div>
            <Select
              value={barangayId === null ? 'all' : String(barangayId)}
              onValueChange={(value) => {
                setBarangayId(value === 'all' ? null : Number(value))
                setWorkerPage(1)
              }}
            >
              <SelectTrigger className='border-border lg:w-48'>
                <SelectValue placeholder='All Barangays' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Barangays</SelectItem>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay.id} value={String(barangay.id)}>
                    {barangay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={verification}
              onValueChange={(value) => {
                setVerification(value as JobPostVerificationFilter)
                setWorkerPage(1)
              }}
            >
              <SelectTrigger className='border-border lg:w-40'>
                <SelectValue placeholder='All Verification' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Verification</SelectItem>
                <SelectItem value='verified'>Verified</SelectItem>
                <SelectItem value='unverified'>Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <WorkersTable
            data={workers}
            isLoading={workersLoading || isRestoringWorker}
            error={workersError}
            onRetry={refetchWorkers}
            onSelect={(worker) => {
              clearPostSelection()
              setSelectedWorker(worker)
            }}
          />
          {workersPagination && workersPagination.last_page > 1 && (
            <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
              <span>Page {workersPagination.current_page} of {workersPagination.last_page} ({workersPagination.total} workers)</span>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='icon'
                  title='Previous page'
                  aria-label='Previous page'
                  disabled={workersPagination.current_page <= 1}
                  onClick={() => setWorkerPage(workersPagination.current_page - 1)}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  title='Next page'
                  aria-label='Next page'
                  disabled={workersPagination.current_page >= workersPagination.last_page}
                  onClick={() => setWorkerPage(workersPagination.current_page + 1)}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                {activeWorker.name}'s Job Posts
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                View and manage this worker's service listings.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingPost(null)
                setPostFormOpen(true)
              }}
              disabled={!activeWorker.worker_profile_id}
            >
              <Plus className='h-4 w-4' />
              Add Post
            </Button>
          </div>
          <Button
            variant='link'
            className='mt-2 h-auto gap-1 p-0'
            onClick={() => {
              setSelectedWorker(null)
              void navigate({
                to: '/job-posts',
                search: () => ({ ...search, workerId: undefined }),
              })
            }}
          >
            <ArrowLeft className='h-4 w-4' />
            Back to workers
          </Button>
        </div>

        <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='relative w-full lg:max-w-xs'>
            <SearchIcon className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search post title'
              value={postSearch}
              onChange={(event) => {
                setPostSearch(event.target.value)
                setPage(1)
              }}
              className='border-border pl-9'
            />
          </div>
          <Select
            value={categoryId === null ? 'all' : String(categoryId)}
            onValueChange={(value) => {
              setCategoryId(value === 'all' ? null : Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className='border-border'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={postStatus}
            onValueChange={(value) => {
              setPostStatus(value as JobPostStatusFilter)
              setPage(1)
            }}
          >
            <SelectTrigger className='border-border lg:w-36'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
          {isSelectingPosts && (
            <div className='flex items-center gap-2 lg:ms-auto'>
              <Button
                variant='destructive'
                disabled={selectedPostIds.length === 0 || isBulkDeleting}
                onClick={() => setIsBulkDeleteDialogOpen(true)}
              >
                <Trash2 className='h-4 w-4' />
                Delete selected ({selectedPostIds.length})
              </Button>
              <Button
                variant='outline'
                disabled={isBulkDeleting}
                onClick={clearPostSelection}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <JobPostsTable
          data={visible}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onDeleted={(id) => {
            setDeletedIds((prev) => [...prev, id])
            setSelectedPostIds((current) => current.filter((selectedId) => selectedId !== id))
          }}
          detailSearch={detailSearch}
          isSelecting={isSelectingPosts}
          selectedIds={selectedPostIds}
          onToggleSelection={togglePostSelection}
          onSelectPage={togglePageSelection}
          onStartSelection={startPostSelection}
          onEdit={(post) => {
            setEditingPost(post)
            setPostFormOpen(true)
          }}
        />
        <DeletePostDialog
          open={isBulkDeleteDialogOpen}
          postTitle=''
          postCount={selectedPostIds.length}
          isSubmitting={isBulkDeleting}
          onConfirm={(reason) => {
            void deletePosts(selectedPostIds, reason, () => {
              setDeletedIds((current) => [...current, ...selectedPostIds])
              setIsBulkDeleteDialogOpen(false)
              clearPostSelection()
              refetch()
            })
          }}
          onCancel={() => setIsBulkDeleteDialogOpen(false)}
        />
        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} posts)</span>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='icon'
                title='Previous page'
                aria-label='Previous page'
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(pagination.current_page - 1)}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                title='Next page'
                aria-label='Next page'
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage(pagination.current_page + 1)}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
        {activeWorker.worker_profile_id && (
          <JobPostFormDialog
            open={postFormOpen}
            onOpenChange={(open) => {
              setPostFormOpen(open)
              if (!open) setEditingPost(null)
            }}
            workerProfileId={activeWorker.worker_profile_id}
            workerName={activeWorker.name}
            categories={categories}
            post={editingPost}
            onSaved={() => {
              setPostFormOpen(false)
              setEditingPost(null)
              setPage(1)
              refetch()
            }}
          />
        )}
      </Main>
    </>
  )
}
