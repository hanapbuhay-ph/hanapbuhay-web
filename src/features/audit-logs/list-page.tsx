import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import {
  type AuditActionFilter,
  ACTION_LABELS,
  ALL_ACTIONS,
} from './types'
import { useAuditLogs } from './hooks/use-audit-logs'
import { AuditLogsTable } from './components/audit-logs-table'

export function AuditLogsListPage() {
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>('all')
  const [targetType, setTargetType] = useState('all')
  const [adminName, setAdminName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const { data, pagination, isLoading, error, refetch } = useAuditLogs(actionFilter, targetType, adminName, dateFrom, dateTo, page)

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
            Audit Log
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Read-only record of all admin actions on the platform.
          </p>
        </div>

        <div className='mb-6 rounded-xl border border-border bg-card p-4'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-foreground'>Filters</p>
              <p className='text-xs text-muted-foreground'>Refine audit logs by action, target type, admin, or date.</p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setActionFilter('all')
                setTargetType('all')
                setAdminName('')
                setDateFrom('')
                setDateTo('')
                setPage(1)
              }}
            >
              Clear filters
            </Button>
          </div>

          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>Action</label>
              <Select
                value={actionFilter}
                onValueChange={(v) => { setActionFilter(v as AuditActionFilter); setPage(1) }}
              >
                <SelectTrigger className='rounded-lg border-border focus:ring-ring'>
                  <SelectValue placeholder='All actions' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Actions</SelectItem>
                  {ALL_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABELS[action]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>Target type</label>
              <Select value={targetType} onValueChange={(value) => { setTargetType(value); setPage(1) }}>
                <SelectTrigger className='rounded-lg border-border'>
                  <SelectValue placeholder='All targets' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Targets</SelectItem>
                  {['User', 'WorkerProfile', 'Booking', 'Report', 'JobPost', 'RatingReview', 'ServiceCategory'].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>Admin</label>
              <Input
                value={adminName}
                placeholder='Search admin name'
                onChange={(event) => { setAdminName(event.target.value); setPage(1) }}
                className='border-border'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>Date range</label>
              <div className='grid grid-cols-2 gap-2'>
                <Input type='date' aria-label='From date' value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} />
                <Input type='date' aria-label='To date' value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <AuditLogsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} logs)</span>
            <div className='flex gap-1'>
              <Button variant='outline' size='icon' title='Previous page' aria-label='Previous page' disabled={pagination.current_page <= 1} onClick={() => setPage(pagination.current_page - 1)}><ChevronLeft className='h-4 w-4' /></Button>
              <Button variant='outline' size='icon' title='Next page' aria-label='Next page' disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(pagination.current_page + 1)}><ChevronRight className='h-4 w-4' /></Button>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
