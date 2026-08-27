import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { VerificationsTable } from './components/verifications-table'
import { useVerifications } from './hooks/use-verifications'
import { type VerificationStatus } from './types'

type FilterValue = VerificationStatus | 'all'

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'resubmission_requested', label: 'Resubmission Requested' },
]

export function VerificationsListPage() {
  const [filter, setFilter] = useState<FilterValue>('pending')
  const { data, isLoading, error, refetch } = useVerifications(filter)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Verification Queue
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Review and approve worker identity documents.
          </p>
        </div>

        {/* Filter tabs */}
        <div className='mb-4 w-full overflow-x-auto pb-1'>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterValue)}
          >
            <TabsList className='min-w-max'>
              {FILTER_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <VerificationsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
      </Main>
    </>
  )
}
