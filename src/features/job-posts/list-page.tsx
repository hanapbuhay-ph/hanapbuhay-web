import { useEffect, useState } from 'react'
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

interface Category {
  id: number
  name: string
}

export function JobPostsListPage() {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { data, isLoading, error, refetch } = useJobPosts(categoryId)
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  useEffect(() => {
    api.get('/service-categories').then((res) => {
      const raw = res.data?.data ?? res.data
      setCategories(Array.isArray(raw) ? raw : [])
    }).catch(() => {})
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

        {/* Category filter */}
        <div className='mb-4 w-48'>
          <Select
            value={categoryId === null ? 'all' : String(categoryId)}
            onValueChange={(v) => setCategoryId(v === 'all' ? null : Number(v))}
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
        </div>

        <JobPostsTable
          data={visible}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onDeleted={(id) => setDeletedIds((prev) => [...prev, id])}
        />
      </Main>
    </>
  )
}
