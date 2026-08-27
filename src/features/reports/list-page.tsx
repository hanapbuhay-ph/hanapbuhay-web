import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ReportsTable } from './components/reports-table'
import { useReports } from './hooks/use-reports'
import { type ReportStatusFilter } from './types'

const STATUS_TABS: { value: ReportStatusFilter; label: string }[] = [
  { value: 'under_review', label: 'Under Review' },
  { value: 'all', label: 'All' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

export function ReportsListPage() {
  const [statusFilter, setStatusFilter] =
    useState<ReportStatusFilter>('under_review')
  const { data, isLoading, error, refetch } = useReports(statusFilter)

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
            Reports Queue
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Review and action user-submitted reports.
          </p>
        </div>

        <div className='mb-4 w-full overflow-x-auto pb-1'>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatusFilter)}
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

        <ReportsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
      </Main>
    </>
  )
}
