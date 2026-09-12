import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react'
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
import {
  type JobPostStatusFilter,
  type JobPostVerificationFilter,
} from './types'

interface Category {
  id: number
  name: string
}

interface Barangay {
  id: number
  name: string
}

export function JobPostsListPage() {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [barangayId, setBarangayId] = useState<number | null>(null)
  const [status, setStatus] = useState<JobPostStatusFilter>('all')
  const [verification, setVerification] = useState<JobPostVerificationFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const { data, pagination, isLoading, error, refetch } = useJobPosts(
    categoryId,
    barangayId,
    status,
    verification,
    search,
    page,
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
            View and manage all worker service listings.
          </p>
        </div>

        <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='relative w-full lg:max-w-xs'>
            <SearchIcon className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search worker or post title'
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className='border-border pl-9'
            />
          </div>
          <Select
            value={categoryId === null ? 'all' : String(categoryId)}
            onValueChange={(v) => {
              setCategoryId(v === 'all' ? null : Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className='border-border'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={barangayId === null ? 'all' : String(barangayId)}
            onValueChange={(v) => {
              setBarangayId(v === 'all' ? null : Number(v))
              setPage(1)
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
          <Select value={status} onValueChange={(value) => { setStatus(value as JobPostStatusFilter); setPage(1) }}>
            <SelectTrigger className='border-border lg:w-36'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verification} onValueChange={(value) => { setVerification(value as JobPostVerificationFilter); setPage(1) }}>
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
