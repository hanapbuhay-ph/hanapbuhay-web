import { useState } from 'react'
import { ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DeletionRequestsTable } from './components/deletion-requests-table'
import { UsersTable } from './components/users-table'
import { useDeletionRequests } from './hooks/use-deletion-requests'
import { useUsers } from './hooks/use-users'
import {
  type RoleFilter,
  type StatusFilter,
  type UserPagination,
} from './types'

// ── User filter tab definitions ───────────────────────────────────────────────

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'client', label: 'Client' },
  { value: 'worker', label: 'Worker' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function UsersListPage() {
  const [section, setSection] = useState<'users' | 'deletion_requests'>('users')

  // Users tab state
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    pagination,
    refetch: refetchUsers,
  } = useUsers(roleFilter, statusFilter, search, page)

  // Deletion requests tab state
  const {
    data: deletionRequests,
    isLoading: drLoading,
    error: drError,
    refetch: refetchDr,
  } = useDeletionRequests()

  const [processedIds, setProcessedIds] = useState<number[]>([])
  const visibleDr = deletionRequests.filter((r) => !processedIds.includes(r.id))

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            User Management
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            View, filter, and manage platform users.
          </p>
        </div>

        {/* ── Top-level section tabs ─────────────────────────────────── */}
        <Tabs
          value={section}
          onValueChange={(v) => setSection(v as typeof section)}
          className='mb-6'
        >
          <TabsList className='min-w-max'>
            <TabsTrigger value='users'>All Users</TabsTrigger>
            <TabsTrigger value='deletion_requests' className='gap-1.5'>
              Deletion Requests
              {deletionRequests.length > 0 && (
                <span className='inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white'>
                  {deletionRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── All Users tab ──────────────────────────────────────── */}
          <TabsContent value='users' className='mt-4'>
            <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='relative w-full sm:max-w-xs'>
                <SearchIcon className='absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name or email…'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className='rounded-lg border-border pl-9 focus-visible:ring-ring'
                />
              </div>
              <div className='overflow-x-auto pb-1'>
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as StatusFilter)
                    setPage(1)
                  }}
                >
                  <TabsList className='min-w-max'>
                    {STATUS_TABS.map((t) => (
                      <TabsTrigger key={t.value} value={t.value}>
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className='mb-4 w-full overflow-x-auto pb-1'>
              <Tabs
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v as RoleFilter)
                  setPage(1)
                }}
              >
                <TabsList className='min-w-max'>
                  {ROLE_TABS.map((t) => (
                    <TabsTrigger key={t.value} value={t.value}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <UsersTable
              data={users}
              isLoading={usersLoading}
              error={usersError}
              onRetry={refetchUsers}
            />
            <UserPaginationControls
              pagination={pagination}
              onPageChange={setPage}
            />
          </TabsContent>

          {/* ── Deletion Requests tab ─────────────────────────────── */}
          <TabsContent value='deletion_requests' className='mt-4'>
            <DeletionRequestsTable
              data={visibleDr}
              isLoading={drLoading}
              error={drError}
              onRetry={refetchDr}
              onProcessed={(id) => setProcessedIds((prev) => [...prev, id])}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function UserPaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: UserPagination | null
  onPageChange: (page: number) => void
}) {
  if (!pagination || pagination.last_page <= 1) return null

  return (
    <div className='mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground'>
      <span>
        Page {pagination.current_page} of {pagination.last_page} ({pagination.total} users)
      </span>
      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='icon'
          title='Previous page'
          aria-label='Previous page'
          disabled={pagination.current_page <= 1}
          onClick={() => onPageChange(pagination.current_page - 1)}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          title='Next page'
          aria-label='Next page'
          disabled={pagination.current_page >= pagination.last_page}
          onClick={() => onPageChange(pagination.current_page + 1)}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
