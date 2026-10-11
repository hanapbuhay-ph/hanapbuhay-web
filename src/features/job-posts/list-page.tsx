import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react'
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
import { JobPostsTable } from './components/job-posts-table'
import { useJobPosts } from './hooks/use-job-posts'
import { type JobPostStatusFilter, type JobPostVerificationFilter } from './types'
import { WorkersTable } from './components/workers-table'

interface Category {
  id: number
  name: string
}

interface Barangay {
  id: number
  name: string
}

export function JobPostsListPage() {
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null)
  const [workerPage, setWorkerPage] = useState(1)
  const [barangayId, setBarangayId] = useState<number | null>(null)
  const [postStatus, setPostStatus] = useState<JobPostStatusFilter>('all')
  const [verification, setVerification] = useState<JobPostVerificationFilter>('all')
  const [page, setPage] = useState(1)
  const [workerSearch, setWorkerSearch] = useState('')
  const [postSearch, setPostSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const {
    data: workers,
    isLoading: workersLoading,
    error: workersError,
    pagination: workersPagination,
    refetch: refetchWorkers,
  } = useUsers('worker', 'all', workerSearch, workerPage, verification, barangayId)
  const { data, pagination, isLoading, error, refetch } = useJobPosts(
    categoryId,
    null,
    postStatus,
    'all',
    postSearch,
    page,
    selectedWorker
      ? (selectedWorker.worker_profile_id ?? -1)
      : undefined,
  )
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  useEffect(() => {
    Promise.all([api.get('/service-categories'), api.get('/barangays')])
      .then(([categoryResponse, barangayResponse]) => {
        setCategories(Array.isArray(categoryResponse.data?.data) ? categoryResponse.data.data : [])
        setBarangays(Array.isArray(barangayResponse.data?.data) ? barangayResponse.data.data : [])
      })
      .catch(() => {})
  }, [])

  const visible = data.filter((p) => !deletedIds.includes(p.id))

  if (!selectedWorker) {
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
            isLoading={workersLoading}
            error={workersError}
            onRetry={refetchWorkers}
            onSelect={setSelectedWorker}
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
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {selectedWorker.name}'s Job Posts
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            View and manage this worker's service listings.
          </p>
          <Button
            variant='link'
            className='mt-2 h-auto p-0'
            onClick={() => setSelectedWorker(null)}
          >
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
        </div>

        <JobPostsTable
          data={visible}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onDeleted={(id) => setDeletedIds((prev) => [...prev, id])}
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
      </Main>
    </>
  )
}
