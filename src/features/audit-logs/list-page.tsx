import { useState } from 'react'
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
  const { data, isLoading, error, refetch } = useAuditLogs(actionFilter)

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

        {/* Action filter dropdown */}
        <div className='mb-4 w-full max-w-xs'>
          <Select
            value={actionFilter}
            onValueChange={(v) => setActionFilter(v as AuditActionFilter)}
          >
            <SelectTrigger className='rounded-lg border-border focus:ring-ring'>
              <SelectValue placeholder='Filter by action…' />
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

        {/* Table */}
        <AuditLogsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
      </Main>
    </>
  )
}
