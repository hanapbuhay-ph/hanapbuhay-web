import { startTransition, useEffect, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, InboxIcon, RefreshCw, Search, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { type ReviewPagination, type ReviewRecipient } from '../types'

interface RecipientsResponse {
  success: boolean
  data: { users: ReviewRecipient[]; pagination: ReviewPagination }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface ReviewRecipientsProps {
  onSelect: (recipient: ReviewRecipient) => void
}

export function ReviewRecipients({ onSelect }: ReviewRecipientsProps) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'all' | 'client' | 'worker'>('all')
  const [sort, setSort] = useState('average_rating:desc')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<ReviewRecipient[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setIsLoading(true)
      setError(null)
    })

    const params: Record<string, string | number> = { page }
    const [sortBy, sortDirection] = sort.split(':')
    params.sort_by = sortBy
    params.sort_direction = sortDirection
    if (role !== 'all') params.role = role
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()

    api
      .get<RecipientsResponse>('/admin/ratings/users', { params })
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data.data.users)
          setPagination(res.data.data.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load review recipients.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role, debouncedSearch, page, sort, tick])

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
            Ratings &amp; Reviews
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Select a user to review the ratings they have received.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap gap-3'>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value as typeof role)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='All roles' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All roles</SelectItem>
              <SelectItem value='client'>Client</SelectItem>
              <SelectItem value='worker'>Worker</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-52'>
              <SelectValue placeholder='Sort users' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name:asc'>Name: A to Z</SelectItem>
              <SelectItem value='name:desc'>Name: Z to A</SelectItem>
              <SelectItem value='average_rating:desc'>Average rating: High to low</SelectItem>
              <SelectItem value='average_rating:asc'>Average rating: Low to high</SelectItem>
            </SelectContent>
          </Select>
          <div className='relative w-full sm:max-w-xs'>
            <Search className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
            <Input
              value={search}
              placeholder='Search user or email'
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className='border-border pl-9'
            />
          </div>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-border bg-card' style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}>
          <Table className='min-w-[850px]'>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>User</TableHead>
                <TableHead className='font-semibold text-foreground'>Role</TableHead>
                <TableHead className='font-semibold text-foreground'>Email</TableHead>
                <TableHead className='font-semibold text-foreground'>Barangay</TableHead>
                <TableHead className='font-semibold text-foreground'>Reviews Received</TableHead>
                <TableHead className='font-semibold text-foreground'>Average Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((__, column) => (
                      <TableCell key={column} className={column === 0 ? 'ps-4' : undefined}>
                        <Skeleton className='h-4 w-24' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <AlertTriangle className='h-7 w-7 text-destructive' />
                      <p className='text-sm font-semibold text-foreground'>Failed to load users</p>
                      <p className='text-xs text-muted-foreground'>{error}</p>
                      <Button size='sm' variant='outline' onClick={() => setTick((value) => value + 1)}>
                        <RefreshCw className='h-3.5 w-3.5' />
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className='flex flex-col items-center gap-2 py-12 text-center'>
                      <InboxIcon className='h-7 w-7 text-muted-foreground' />
                      <p className='text-sm font-semibold text-foreground'>No users found</p>
                      <p className='text-xs text-muted-foreground'>Try adjusting the filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && users.map((user) => (
                <TableRow
                  key={user.id}
                  className='cursor-pointer hover:bg-primary/5'
                  onClick={() => onSelect(user)}
                >
                  <TableCell className='ps-4'>
                    <Button variant='link' className='h-auto justify-start gap-3 p-0 text-foreground' onClick={() => onSelect(user)}>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.profile_photo_url ?? undefined} alt={`${user.name} profile`} />
                        <AvatarFallback className='bg-primary/10 text-xs text-primary'>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </Button>
                  </TableCell>
                  <TableCell className='capitalize text-sm text-muted-foreground'>{user.role}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>{user.email}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>{user.barangay ?? '—'}</TableCell>
                  <TableCell className='text-sm text-foreground'>
                    {user.reviews_received_count === 0 ? 'No reviews' : user.reviews_received_count}
                  </TableCell>
                  <TableCell>
                    {user.reviews_received_count === 0 ? (
                      <span className='text-sm text-muted-foreground'>—</span>
                    ) : (
                      <span className='inline-flex items-center gap-1 text-sm text-foreground'>
                        <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                        {user.average_rating.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} users)</span>
            <div className='flex gap-1'>
              <Button variant='outline' size='icon' title='Previous page' aria-label='Previous page' disabled={pagination.current_page <= 1} onClick={() => setPage(pagination.current_page - 1)}>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='icon' title='Next page' aria-label='Next page' disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(pagination.current_page + 1)}>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
