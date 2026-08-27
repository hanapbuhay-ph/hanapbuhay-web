import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { useServiceCategories } from './hooks/use-service-categories'
import { useServiceCategoryAction } from './hooks/use-service-category-action'
import { ServiceCategoryCard } from './components/service-category-card'
import { ServiceCategoryDialog } from './components/service-category-dialog'
import { type ServiceCategory, type ServiceCategoryPayload } from './types'

export function ServiceCategoriesPage() {
  const { data, isLoading, error, refetch } = useServiceCategories()
  const { isSubmitting, add, edit, toggle } = useServiceCategoryAction()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCategory | undefined>(undefined)

  // Track which card's toggle is in-flight (for per-card disabled state)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Optimistic local overrides so the UI responds immediately
  const [localOverrides, setLocalOverrides] = useState<Map<number, ServiceCategory>>(new Map())

  const displayed = data.map((c) => localOverrides.get(c.id) ?? c)

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(category: ServiceCategory) {
    setEditing(category)
    setDialogOpen(true)
  }

  function handleConfirm(payload: ServiceCategoryPayload) {
    if (editing) {
      edit(editing.id, payload, (updated) => {
        setLocalOverrides((m) => new Map(m).set(updated.id, updated))
        setDialogOpen(false)
      })
    } else {
      add(payload, () => {
        setDialogOpen(false)
        refetch()
      })
    }
  }

  function handleToggle(category: ServiceCategory) {
    setTogglingId(category.id)
    toggle(category, (updated) => {
      setLocalOverrides((m) => new Map(m).set(updated.id, updated))
      setTogglingId(null)
    }).finally(() => setTogglingId(null))
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
        {/* Back link */}
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        {/* Page header */}
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Service Categories
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage the service types workers can offer on HanapBuhay.
            </p>
          </div>
          <Button onClick={openAdd} className='shrink-0 bg-green-600 hover:bg-green-700 text-white'>
            <Plus size={16} className='mr-1.5' />
            Add Category
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-44 animate-pulse rounded-xl bg-muted'
              />
            ))}
          </div>
        )}

        {/* Error */}
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

        {/* Card grid */}
        {!isLoading && !error && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {displayed.map((category) => (
              <ServiceCategoryCard
                key={category.id}
                category={category}
                isTogglingId={togglingId}
                onEdit={openEdit}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </Main>

      {/* Add / Edit dialog */}
      <ServiceCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />
    </>
  )
}
