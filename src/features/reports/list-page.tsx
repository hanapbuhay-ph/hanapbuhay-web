import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminReportDialog } from './components/admin-report-dialog'
import { ReportsTable } from './components/reports-table'
import { useReports } from './hooks/use-reports'
import {
  REASON_LABELS,
  type ReportReasonFilter,
  type ReportStatusFilter,
} from './types'

const STATUS_TABS: { value: ReportStatusFilter; label: string }[] = [
  { value: 'under_review', label: 'Under Review' },
  { value: 'all', label: 'All' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

export function ReportsListPage() {
  const [statusFilter, setStatusFilter] =
    useState<ReportStatusFilter>('under_review')
  const [reasonFilter, setReasonFilter] = useState<ReportReasonFilter>('all')
  const [page, setPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { data, pagination, isLoading, error, refetch } = useReports(
    statusFilter,
    reasonFilter,
    page
  )

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Reports Queue
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Review and action user-submitted reports.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className='size-4' />
            Submit report for a user
          </Button>
        </div>

        <div className='mb-4 w-full overflow-x-auto pb-1'>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as ReportStatusFilter)
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

        <div className='mb-4 flex items-center gap-2'>
          <select
            aria-label='Filter reports by reason'
            value={reasonFilter}
            onChange={(event) => {
              setReasonFilter(event.target.value as ReportReasonFilter)
              setPage(1)
            }}
            className='h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground'
          >
            <option value='all'>All Reasons</option>
            {Object.entries(REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <ReportsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>
              Page {pagination.current_page} of {pagination.last_page} (
              {pagination.total} reports)
            </span>
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
      <AdminReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => {
          setStatusFilter('all')
          setPage(1)
          refetch()
        }}
      />
    </>
  )
}
