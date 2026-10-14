import { useEffect, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type AdminBookingInput } from '../types'

interface UserOption {
  id: number
  name: string
  email: string
  worker_profile_id?: number | null
}

interface CategoryOption {
  job_post_id: number
  id: number
  name: string
}

interface WorkerJobPost {
  id: number
  is_active?: boolean
  category?: { id: number; name: string }
}

interface WorkerJobPostDetail extends WorkerJobPost {
  title: string
  description: string
  rate_display: string
  is_available: boolean
  images: {
    id: number
    image_url: string
    thumbnail_url: string | null
  }[]
  category: { id: number; name: string }
}

interface AdminBookingDialogProps {
  open: boolean
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AdminBookingInput) => Promise<boolean>
}

function localDateTimeValue(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

async function loadUsers(
  role: 'client' | 'worker',
  search: string
): Promise<UserOption[]> {
  const response = await api.get('/admin/users', {
    params: {
      role,
      status: 'active',
      search: search.trim() || undefined,
      page: 1,
    },
  })
  const users = response.data?.data?.users
  if (!Array.isArray(users))
    throw new Error('The user list response was invalid.')
  return users.filter(
    (user: UserOption) => role !== 'worker' || user.worker_profile_id
  )
}

async function loadWorkerCategories(
  workerProfileId: number
): Promise<CategoryOption[]> {
  const posts: WorkerJobPost[] = []
  let page = 1

  while (true) {
    const response = await api.get('/admin/posts', {
      params: { worker_profile_id: workerProfileId, status: 'active', page },
    })
    const pagePosts = response.data?.data?.posts
    const pagination = response.data?.data?.pagination
    if (
      !Array.isArray(pagePosts) ||
      !pagination ||
      typeof pagination.last_page !== 'number'
    ) {
      throw new Error('The selected worker’s job posts response was invalid.')
    }
    posts.push(...pagePosts)
    if (page >= pagination.last_page) break
    page += 1
  }

  const categories = new Map<number, CategoryOption>()
  for (const post of posts) {
    if (
      post.is_active !== false &&
      post.category &&
      !categories.has(post.category.id)
    ) {
      categories.set(post.category.id, {
        id: post.category.id,
        name: post.category.name,
        job_post_id: post.id,
      })
    }
  }
  return [...categories.values()]
}

export function AdminBookingDialog({
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminBookingDialogProps) {
  const [clients, setClients] = useState<UserOption[]>([])
  const [workers, setWorkers] = useState<UserOption[]>([])
  const [selectedClient, setSelectedClient] = useState<UserOption | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<UserOption | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [workerSearch, setWorkerSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const workerCategoriesQuery = useQuery({
    queryKey: [
      'admin-booking',
      'worker-categories',
      selectedWorker?.worker_profile_id,
    ],
    queryFn: () => loadWorkerCategories(selectedWorker!.worker_profile_id!),
    enabled: open && selectedWorker?.worker_profile_id != null,
  })
  const categories = workerCategoriesQuery.data ?? []
  const isLoadingCategories = workerCategoriesQuery.isLoading
  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId
  )
  const jobPostQuery = useQuery({
    queryKey: [
      'admin-booking',
      'job-post-detail',
      selectedCategory?.job_post_id,
    ],
    queryFn: async () => {
      const response = await api.get<{
        data: { job_post: WorkerJobPostDetail }
      }>(`/admin/posts/${selectedCategory!.job_post_id}`)
      return response.data.data.job_post
    },
    enabled: open && selectedCategory != null,
  })

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const timeout = window.setTimeout(() => {
      setIsLoadingOptions(true)
      setLookupError(null)

      Promise.all([
        loadUsers('client', clientSearch),
        loadUsers('worker', workerSearch),
      ])
        .then(([clientOptions, workerOptions]) => {
          if (cancelled) return
          setClients(clientOptions)
          setWorkers(workerOptions)
        })
        .catch((error: unknown) => {
          if (cancelled) return
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to load booking options.'
          setLookupError(message)
          toast.error(message)
        })
        .finally(() => {
          if (!cancelled) setIsLoadingOptions(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [open, clientSearch, workerSearch])

  function resetForm() {
    setSelectedClient(null)
    setSelectedWorker(null)
    setClientSearch('')
    setWorkerSearch('')
    setCategoryId('')
    setScheduledAt('')
    setNotes('')
    setLookupError(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !selectedClient ||
      !selectedWorker ||
      !selectedCategory ||
      !jobPostQuery.data ||
      !scheduledAt
    )
      return

    const created = await onSubmit({
      client_id: selectedClient.id,
      worker_id: selectedWorker.id,
      job_post_id: selectedCategory.job_post_id,
      service_category_id: Number(categoryId),
      scheduled_at: new Date(scheduledAt).toISOString(),
      notes: notes.trim() || null,
    })
    if (created) handleOpenChange(false)
  }

  const visibleClients =
    selectedClient && !clients.some((client) => client.id === selectedClient.id)
      ? [selectedClient, ...clients]
      : clients
  const visibleWorkers =
    selectedWorker && !workers.some((worker) => worker.id === selectedWorker.id)
      ? [selectedWorker, ...workers]
      : workers

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            Book a Job for a Client
          </DialogTitle>
          <DialogDescription>
            Create a pending booking on the client's behalf. The worker will
            still need to accept it.
          </DialogDescription>
        </DialogHeader>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='client-search'>Find client</Label>
              <Input
                id='client-search'
                value={clientSearch}
                placeholder='Search by client name or email'
                onChange={(event) => setClientSearch(event.target.value)}
                disabled={isSubmitting}
              />
              <Select
                value={selectedClient ? String(selectedClient.id) : ''}
                onValueChange={(value) =>
                  setSelectedClient(
                    clients.find((client) => String(client.id) === value) ??
                      selectedClient
                  )
                }
                disabled={isSubmitting || isLoadingOptions}
              >
                <SelectTrigger className='w-full border-border'>
                  <SelectValue placeholder='Select client' />
                </SelectTrigger>
                <SelectContent>
                  {visibleClients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name} · {client.email}
                    </SelectItem>
                  ))}
                  {visibleClients.length === 0 && (
                    <div className='px-2 py-3 text-sm text-muted-foreground'>
                      No active clients found.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='worker-search'>Find worker</Label>
              <Input
                id='worker-search'
                value={workerSearch}
                placeholder='Search by worker name or email'
                onChange={(event) => setWorkerSearch(event.target.value)}
                disabled={isSubmitting}
              />
              <Select
                value={selectedWorker ? String(selectedWorker.id) : ''}
                onValueChange={(value) => {
                  setSelectedWorker(
                    workers.find((worker) => String(worker.id) === value) ??
                      selectedWorker
                  )
                  setCategoryId('')
                }}
                disabled={isSubmitting || isLoadingOptions}
              >
                <SelectTrigger className='w-full border-border'>
                  <SelectValue placeholder='Select worker' />
                </SelectTrigger>
                <SelectContent>
                  {visibleWorkers.map((worker) => (
                    <SelectItem key={worker.id} value={String(worker.id)}>
                      {worker.name} · {worker.email}
                    </SelectItem>
                  ))}
                  {visibleWorkers.length === 0 && (
                    <div className='px-2 py-3 text-sm text-muted-foreground'>
                      No active workers with profiles found.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='booking-category'>Service category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isSubmitting || isLoadingCategories || !selectedWorker}
            >
              <SelectTrigger
                id='booking-category'
                className='w-full border-border'
              >
                <SelectValue
                  placeholder={
                    !selectedWorker
                      ? 'Select a worker first'
                      : isLoadingCategories
                        ? 'Loading worker services...'
                        : 'Select service category'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
                {categories.length === 0 &&
                  !isLoadingCategories &&
                  selectedWorker && (
                    <div className='px-2 py-3 text-sm text-muted-foreground'>
                      This worker has no active job posts.
                    </div>
                  )}
              </SelectContent>
            </Select>
          </div>

          {isLoadingCategories && (
            <p className='text-xs text-muted-foreground'>
              Loading this worker&apos;s job categories...
            </p>
          )}
          {selectedCategory && jobPostQuery.isLoading && (
            <p className='text-xs text-muted-foreground'>
              Loading job post details...
            </p>
          )}
          {selectedCategory && jobPostQuery.error && (
            <p role='alert' className='text-sm text-destructive'>
              {jobPostQuery.error instanceof Error
                ? jobPostQuery.error.message
                : 'Failed to load the selected job post details.'}
            </p>
          )}
          {jobPostQuery.data && <JobPostPreview post={jobPostQuery.data} />}

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='booking-scheduled-at'>Schedule</Label>
            <Input
              id='booking-scheduled-at'
              type='datetime-local'
              min={localDateTimeValue(new Date())}
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='booking-notes'>
              Notes for the worker{' '}
              <span className='text-muted-foreground'>(optional)</span>
            </Label>
            <Textarea
              id='booking-notes'
              maxLength={1000}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {(lookupError || workerCategoriesQuery.error) && (
            <p role='alert' className='text-sm text-destructive'>
              {lookupError ??
                (workerCategoriesQuery.error instanceof Error
                  ? workerCategoriesQuery.error.message
                  : 'Failed to load the selected worker’s job categories.')}
            </p>
          )}
          {isLoadingOptions && (
            <p className='text-xs text-muted-foreground'>
              Loading clients and workers...
            </p>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting ||
                isLoadingOptions ||
                isLoadingCategories ||
                jobPostQuery.isLoading ||
                !selectedClient ||
                !selectedWorker ||
                !selectedCategory ||
                !jobPostQuery.data ||
                !scheduledAt
              }
            >
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              Create Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function JobPostPreview({ post }: { post: WorkerJobPostDetail }) {
  return (
    <Card className='gap-3 rounded-xl border-border bg-muted/30 py-4'>
      <CardHeader className='px-4 pb-0'>
        <CardTitle className='flex items-center gap-2 text-base text-foreground'>
          <BriefcaseBusiness className='h-4 w-4 text-primary' />
          {post.title}
        </CardTitle>
        <p className='text-xs text-muted-foreground'>{post.category.name}</p>
      </CardHeader>
      <CardContent className='flex flex-col gap-3 px-4'>
        <p className='text-sm whitespace-pre-wrap text-muted-foreground'>
          {post.description}
        </p>
        <div className='flex flex-wrap gap-x-5 gap-y-1 text-sm'>
          <span>
            <span className='font-medium text-foreground'>Rate:</span>{' '}
            {post.rate_display}
          </span>
          <span>
            <span className='font-medium text-foreground'>Availability:</span>{' '}
            {post.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {post.images.length > 0 && (
          <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
            {post.images.map((image) => (
              <img
                key={image.id}
                src={image.thumbnail_url ?? image.image_url}
                alt={post.title}
                className='aspect-[4/3] w-full rounded-md object-cover'
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
