import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AuditLogsTable } from './components/audit-logs-table'
import { useAuditLogAction } from './hooks/use-audit-log-action'
import { useAuditLogs } from './hooks/use-audit-logs'
import {
  type AuditActionFilter,
  type AuditLog,
  ACTION_LABELS,
  ALL_ACTIONS,
} from './types'

export function AuditLogsListPage() {
  const currentUser = getUser<{ role?: string }>()
  const canDeleteLogs = currentUser?.role === 'super_admin'
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>('all')
  const [targetType, setTargetType] = useState('all')
  const [actorName, setActorName] = useState('')
  const [category, setCategory] = useState('all')
  const [outcome, setOutcome] = useState('all')
  const [ipAddress, setIpAddress] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const { data, pagination, isLoading, error, refetch } = useAuditLogs(
    actionFilter,
    targetType,
    actorName,
    category,
    outcome,
    ipAddress,
    dateFrom,
    dateTo,
    page
  )
  const [logToDelete, setLogToDelete] = useState<AuditLog | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const {
    deleteLog,
    deleteAllLogs,
    isSubmitting: isDeleting,
  } = useAuditLogAction(() => {
    setLogToDelete(null)
    setDeleteAllOpen(false)
    refetch()
  })

  function clearFilters() {
    setActionFilter('all')
    setTargetType('all')
    setActorName('')
    setCategory('all')
    setOutcome('all')
    setIpAddress('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

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
            Security &amp; Audit Logs
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Review authentication events and administrative activity.
          </p>
          <p className='mt-2 text-xs text-muted-foreground'>
            Logs are retained unless permanently deleted by the Super Admin.
          </p>
        </div>

        <div className='mb-6 rounded-xl border border-border bg-card p-4'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-foreground'>Filters</p>
              <p className='text-xs text-muted-foreground'>
                Refine logs by type, action, actor, outcome, IP address, target,
                or date.
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={clearFilters}>
              Clear filters
            </Button>
            {canDeleteLogs && (
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setDeleteAllOpen(true)}
                disabled={isLoading || !data.length || isDeleting}
              >
                <Trash2 className='me-1 h-4 w-4' />
                Delete all logs
              </Button>
            )}
          </div>

          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                Log type
              </label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className='rounded-lg border-border'>
                  <SelectValue placeholder='All log types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All log types</SelectItem>
                  <SelectItem value='security'>Security events</SelectItem>
                  <SelectItem value='admin_activity'>Admin activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                Action
              </label>
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value as AuditActionFilter)
                  setPage(1)
                }}
              >
                <SelectTrigger className='rounded-lg border-border'>
                  <SelectValue placeholder='All actions' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All actions</SelectItem>
                  {ALL_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABELS[action]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                Outcome
              </label>
              <Select
                value={outcome}
                onValueChange={(value) => {
                  setOutcome(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className='rounded-lg border-border'>
                  <SelectValue placeholder='All outcomes' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All outcomes</SelectItem>
                  <SelectItem value='success'>Success</SelectItem>
                  <SelectItem value='failure'>Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                Target type
              </label>
              <Select
                value={targetType}
                onValueChange={(value) => {
                  setTargetType(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className='rounded-lg border-border'>
                  <SelectValue placeholder='All targets' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All targets</SelectItem>
                  {[
                    'User',
                    'WorkerProfile',
                    'Booking',
                    'Report',
                    'JobPost',
                    'RatingReview',
                    'ServiceCategory',
                  ].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                Actor
              </label>
              <Input
                value={actorName}
                placeholder='Search name or email'
                onChange={(event) => {
                  setActorName(event.target.value)
                  setPage(1)
                }}
                className='border-border'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-muted-foreground'>
                IP address
              </label>
              <Input
                value={ipAddress}
                placeholder='Search IP address'
                onChange={(event) => {
                  setIpAddress(event.target.value)
                  setPage(1)
                }}
                className='border-border'
              />
            </div>

            <div className='space-y-1.5 xl:col-span-2'>
              <label className='text-xs font-medium text-muted-foreground'>
                Date range
              </label>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  aria-label='From date'
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setPage(1)
                  }}
                />
                <Input
                  type='date'
                  aria-label='To date'
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <AuditLogsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          canDelete={canDeleteLogs}
          isDeleting={isDeleting}
          onDelete={setLogToDelete}
        />
        {pagination && pagination.last_page > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
            <span>
              Page {pagination.current_page} of {pagination.last_page} (
              {pagination.total} logs)
            </span>
            <div className='flex gap-1'>
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
      {canDeleteLogs && (
        <>
          <ConfirmDialog
            open={logToDelete !== null}
            onOpenChange={(open) => {
              if (!open) setLogToDelete(null)
            }}
            handleConfirm={() => {
              if (logToDelete) void deleteLog(logToDelete.id)
            }}
            title={
              <span className='text-destructive'>
                <Trash2 className='me-1 inline-block h-4 w-4' />
                Delete audit log?
              </span>
            }
            desc={
              logToDelete
                ? `This permanently removes the ${logToDelete.action} record from the audit and security log history.`
                : ''
            }
            confirmText='Delete log'
            destructive
            isLoading={isDeleting}
          />

          <ConfirmDialog
            open={deleteAllOpen}
            onOpenChange={(open) => {
              if (!open) setDeleteAllOpen(false)
            }}
            handleConfirm={() => {
              void deleteAllLogs()
            }}
            title={
              <span className='text-destructive'>
                <Trash2 className='me-1 inline-block h-4 w-4' />
                Delete all audit and security logs?
              </span>
            }
            desc='This permanently deletes every audit and security log in the platform, not only the logs currently shown or matching the filters. This action cannot be undone.'
            confirmText='Delete all logs'
            destructive
            isLoading={isDeleting}
          />
        </>
      )}
    </>
  )
}
