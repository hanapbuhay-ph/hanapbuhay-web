import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NeedsAttention } from './components/needs-attention'
import { QuickActions } from './components/quick-actions'
import { RecentActivity } from './components/recent-activity'
import { StatGrid } from './components/stat-grid'
import { useDashboard } from './hooks/use-dashboard'
import { deriveNeedsAttention } from './hooks/use-needs-attention'

export function Dashboard() {
  const { data, recentActivity, isLoading, error, refetch } = useDashboard()
  const needsAttentionData = deriveNeedsAttention(data)

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <Main>
        {/* Page title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Dashboard
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Overview of HanapBuhay platform activity.
          </p>
        </div>

        {/* Stat cards */}
        <StatGrid
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />

        {/* ── Needs Attention + Recent Activity ──────────────────────── */}
        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <NeedsAttention
            data={needsAttentionData}
            isLoading={isLoading}
          />
          <RecentActivity
            data={recentActivity}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>

        {/* Quick actions */}
        <div className='mt-8'>
          <h2 className='mb-3 text-sm font-semibold text-foreground'>
            Quick Actions
          </h2>
          <QuickActions />
        </div>
      </Main>
    </>
  )
}
