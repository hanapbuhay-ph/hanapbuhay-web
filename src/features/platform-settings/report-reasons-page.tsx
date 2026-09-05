import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSettings } from './hooks/use-settings'

export function ReportReasonsPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const reasons = data?.report_reasons ?? []

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Report Reason Categories
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            System-defined report reasons. Read-only — managed via the API
            contract.
          </p>
        </div>

        {!isLoading && error && (
          <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
            <Button
              variant='link'
              size='sm'
              className='ml-2 h-auto p-0 text-destructive underline'
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}

        <div
          className='overflow-x-auto rounded-2xl border border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <Table>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background'>
                <TableHead className='ps-4 font-semibold text-foreground'>
                  Code
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Label
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className='ps-4'>
                      <Skeleton className='h-4 w-32' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-40' />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                !error &&
                reasons.map((r, i) => (
                  <TableRow key={r.code ?? i}>
                    <TableCell className='ps-4 font-mono text-sm text-muted-foreground'>
                      {r.code}
                    </TableCell>
                    <TableCell className='text-sm text-foreground'>
                      {r.label}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
