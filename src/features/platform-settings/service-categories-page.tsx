import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from './hooks/use-settings'
import { useServiceCategoryAction } from './hooks/use-service-category-action'

export function ServiceCategoriesPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const { isSubmitting, add } = useServiceCategoryAction()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')

  const categories = data?.service_categories ?? []

  function handleAdd() {
    add({ name: name.trim(), icon: icon.trim() }, () => {
      setDialogOpen(false)
      setName('')
      setIcon('')
      refetch()
    })
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
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Service Categories
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage the service types workers can offer on HanapBuhay.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className='shrink-0 bg-green-600 hover:bg-green-700 text-white'
          >
            <Plus size={16} className='mr-1.5' />
            Add Category
          </Button>
        </div>

        {isLoading && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-20 rounded-xl' />
            ))}
          </div>
        )}

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

        {!isLoading && !error && (
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map((c) => (
              <div
                key={c.id}
                className='rounded-xl border border-border bg-card p-4'
                style={{ boxShadow: '0 2px 8px rgba(52,168,53,0.06)' }}
              >
                <p className='font-medium text-foreground'>{c.name}</p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  icon: {c.icon}
                </p>
              </div>
            ))}
          </div>
        )}
      </Main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Category</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='cat-name'>Name</Label>
              <Input
                id='cat-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Tailoring'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='cat-icon'>Icon key</Label>
              <Input
                id='cat-icon'
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder='e.g. tailoring'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isSubmitting || !name.trim() || !icon.trim()}
              className='bg-primary text-white hover:bg-primary/90'
            >
              {isSubmitting ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
