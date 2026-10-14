import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, AlertTriangle, Calendar, MapPin, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useJobPost } from './hooks/use-job-post'
import { type JobPostDetail } from './types'
import { type JobPostsSearch } from './route-search'

export function JobPostDetailPage({
  id,
  returnSearch,
}: {
  id: string
  returnSearch: JobPostsSearch
}) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useJobPost(id)
  const backToPosts = () => navigate({
    to: '/job-posts',
    search: () => returnSearch,
  })

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={backToPosts} title='Back to job posts' aria-label='Back to job posts'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>Job Post Detail</h1>
            <p className='text-sm text-muted-foreground'>Review the listing and its worker information.</p>
          </div>
        </div>
        {isLoading && <DetailSkeleton />}
        {!isLoading && error && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
            <p className='text-sm font-semibold text-foreground'>Failed to load job post</p>
            <p className='text-xs text-muted-foreground'>{error}</p>
            <Button size='sm' variant='outline' onClick={refetch}>
              <RefreshCw className='h-3.5 w-3.5' /> Retry
            </Button>
          </div>
        )}
        {!isLoading && !error && data && <JobPostContent data={data} />}
      </Main>
    </>
  )
}

function JobPostContent({ data }: { data: JobPostDetail }) {
  return (
    <div className='flex flex-col gap-5'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader className='pb-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <CardTitle className='text-xl text-foreground'>{data.title}</CardTitle>
              <p className='mt-1 text-sm text-muted-foreground'>{data.category.name}</p>
            </div>
            <StatusBadge active={data.is_active} deleted={!!data.deleted_at} />
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='whitespace-pre-wrap text-sm text-muted-foreground'>{data.description}</p>
          <div className='grid gap-2 text-sm text-muted-foreground sm:grid-cols-3'>
            <span>Rate: {data.rate_display}</span>
            <span>Availability: {data.is_available ? 'Available' : 'Unavailable'}</span>
            <span>Bookings: {data.bookings_count}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Calendar className='h-4 w-4 text-primary' />
            Posted {format(new Date(data.created_at), 'MMMM d, yyyy')}
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-border bg-card'>
        <CardHeader><CardTitle className='text-base'>Worker</CardTitle></CardHeader>
        <CardContent className='flex flex-col gap-2 text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground'>{data.worker.name}</span>
          <span>{data.worker.email ?? 'No email available'}</span>
          <span className='flex items-center gap-2'><MapPin className='h-4 w-4 text-primary' />{data.worker.barangay ?? 'Barangay not set'}</span>
          <span>Verification: {data.worker.verification_status ?? 'unverified'}</span>
          <span>Rating: {data.worker.average_rating} ({data.worker.total_reviews} reviews)</span>
        </CardContent>
      </Card>

      {data.images.length > 0 && (
        <Card className='rounded-2xl border-border bg-card'>
          <CardHeader><CardTitle className='text-base'>Images ({data.images.length})</CardTitle></CardHeader>
          <CardContent className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
            {data.images.map((image) => <img key={image.id} src={image.image_url} alt={data.title} className='aspect-[4/3] w-full rounded-lg object-cover' />)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ active, deleted }: { active: boolean; deleted: boolean }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${active && !deleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{deleted ? 'Deleted' : active ? 'Active' : 'Inactive'}</span>
}

function DetailSkeleton() {
  return <div className='flex flex-col gap-5'><Card><CardHeader><Skeleton className='h-6 w-56' /></CardHeader><CardContent><Skeleton className='h-20 w-full' /></CardContent></Card><Card><CardHeader><Skeleton className='h-5 w-24' /></CardHeader><CardContent><Skeleton className='h-16 w-full' /></CardContent></Card></div>
}
