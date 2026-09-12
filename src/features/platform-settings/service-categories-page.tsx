import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { type ServiceCategory } from './types'
import { useSettings } from './hooks/use-settings'
import { useServiceCategoryAction } from './hooks/use-service-category-action'

interface ServiceCategoryIconOption {
  key: string
  label: string
  Icon: LucideIcon
}

const SERVICE_CATEGORY_ICON_OPTIONS: ServiceCategoryIconOption[] = Object.entries(
  LucideIcons
)
  .filter(([name, value]) => {
    const isLucideIconExport =
      typeof value === 'function' ||
      (typeof value === 'object' &&
        value !== null &&
        '$$typeof' in value &&
        typeof (value as { render?: unknown }).render === 'function')

    return (
      isLucideIconExport &&
      /^[A-Z]/.test(name) &&
      !name.endsWith('Icon') &&
      ![
        'Icon',
        'LucideIcon',
        'createLucideIcon',
        'getDefaultAttributes',
      ].includes(name)
    )
  })
  .map(([key, value]) => ({
    key,
    label: key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'),
    Icon: value as LucideIcon,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

const DEFAULT_CATEGORY_ICON = SERVICE_CATEGORY_ICON_OPTIONS[0]?.key ?? 'Sparkles'
const ICON_ROW_HEIGHT = 48
const ICON_OVERSCAN_ROWS = 2
const ICON_POPOVER_HEIGHT = 260

function getIconSearchScore(
  option: ServiceCategoryIconOption,
  query: string
): number | null {
  if (!query) {
    return 0
  }

  const key = option.key.toLowerCase()
  const label = option.label.toLowerCase()

  if (key === query || label === query) return 0
  if (key.startsWith(query) || label.startsWith(query)) return 1
  if (key.includes(query) || label.includes(query)) return 2

  return null
}

function getCategoryIcon(iconKey?: string | null): LucideIcon {
  return (
    SERVICE_CATEGORY_ICON_OPTIONS.find((option) => option.key === iconKey)?.Icon ??
    Sparkles
  )
}

export function ServiceCategoriesPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const { isSubmitting, add, update, remove } = useServiceCategoryAction()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DEFAULT_CATEGORY_ICON)
  const [isActive, setIsActive] = useState(true)
  const [iconQuery, setIconQuery] = useState('')
  const [iconScrollTop, setIconScrollTop] = useState(0)

  const deferredIconQuery = useDeferredValue(iconQuery)
  const categories = data?.service_categories ?? []
  const selectedIconOption =
    SERVICE_CATEGORY_ICON_OPTIONS.find((option) => option.key === icon) ?? null

  useEffect(() => {
    setIconScrollTop(0)
  }, [deferredIconQuery])

  const filteredIconOptions = useMemo(() => {
    const query = deferredIconQuery.trim().toLowerCase()

    if (!query) {
      return SERVICE_CATEGORY_ICON_OPTIONS
    }

    const matches = SERVICE_CATEGORY_ICON_OPTIONS.reduce<
      Array<{ option: ServiceCategoryIconOption; score: number }>
    >((result, option) => {
      const score = getIconSearchScore(option, query)

      if (score === null) {
        return result
      }

      result.push({ option, score })
      return result
    }, [])

    return matches
      .sort(
        (a, b) => a.score - b.score || a.option.label.localeCompare(b.option.label)
      )
      .map(({ option }) => option)
  }, [deferredIconQuery])

  const virtualizedIconState = useMemo(() => {
    const totalRows = Math.ceil(filteredIconOptions.length / 2)
    const visibleRows = Math.ceil(ICON_POPOVER_HEIGHT / ICON_ROW_HEIGHT)
    const startRow = Math.max(
      0,
      Math.floor(iconScrollTop / ICON_ROW_HEIGHT) - ICON_OVERSCAN_ROWS
    )
    const endRow = Math.min(
      totalRows,
      startRow + visibleRows + ICON_OVERSCAN_ROWS * 2
    )

    const startIndex = startRow * 2
    const endIndex = endRow * 2

    return {
      startIndex,
      endIndex,
      topPadding: startRow * ICON_ROW_HEIGHT,
      bottomPadding: Math.max(0, totalRows - endRow) * ICON_ROW_HEIGHT,
      totalRows,
      visibleRows,
    }
  }, [filteredIconOptions, iconScrollTop])

  const visibleIconOptions = filteredIconOptions.slice(
    virtualizedIconState.startIndex,
    virtualizedIconState.endIndex
  )

  function resetDialogState() {
    setDialogOpen(false)
    setEditingCategory(null)
    setName('')
    setIcon(DEFAULT_CATEGORY_ICON)
    setIsActive(true)
    setIconQuery('')
    setIconScrollTop(0)
  }

  function openAddDialog() {
    resetDialogState()
    setDialogOpen(true)
  }

  function openEditDialog(category: ServiceCategory) {
    setEditingCategory(category)
    setName(category.name)
    setIcon(category.icon || DEFAULT_CATEGORY_ICON)
    setIsActive(category.is_active ?? true)
    setIconQuery('')
    setIconScrollTop(0)
    setDialogOpen(true)
  }

  function handleSubmit() {
    const trimmedName = name.trim()
    const trimmedIcon = icon.trim()

    if (!trimmedName || !trimmedIcon) {
      return
    }

    if (editingCategory) {
      update(
        editingCategory.id,
        {
          name: trimmedName,
          icon: trimmedIcon,
          is_active: isActive,
        },
        () => {
          resetDialogState()
          refetch()
        }
      )
      return
    }

    add(
      {
        name: trimmedName,
        icon: trimmedIcon,
        is_active: isActive,
      },
      () => {
        resetDialogState()
        refetch()
      }
    )
  }

  function handleDelete(category: ServiceCategory) {
    if (
      !window.confirm(
        `Deactivate "${category.name}"? This will hide it from active listings and can be re-enabled later.`
      )
    ) {
      return
    }

    remove(category.id, () => {
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
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
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
            onClick={openAddDialog}
            className='shrink-0 bg-green-600 text-white hover:bg-green-700'
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
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon)
              const isInactive = category.is_active === false

              return (
                <div
                  key={category.id}
                  className='rounded-xl border border-border bg-card p-4'
                  style={{ boxShadow: '0 2px 8px rgba(52,168,53,0.06)' }}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                        <Icon className='h-5 w-5' />
                      </div>
                      <div className='min-w-0'>
                        <p className='font-medium text-foreground'>{category.name}</p>
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {category.icon ? `Icon key: ${category.icon}` : 'No icon key set'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                        isInactive
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isInactive ? 'Inactive' : 'Active'}
                    </span>
                  </div>

                  <div className='mt-4 flex items-center justify-end gap-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 text-xs text-primary hover:bg-primary/10'
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className='mr-1 h-3.5 w-3.5' />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-8 border-border text-muted-foreground hover:bg-muted/50'
                      onClick={() => handleDelete(category)}
                      disabled={isSubmitting || isInactive}
                    >
                      <Trash2 className='mr-1 h-3.5 w-3.5' />
                      Deactivate
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Main>

      <Dialog open={dialogOpen} onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetDialogState()
        } else {
          setDialogOpen(true)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Service Category' : 'Add Service Category'}
            </DialogTitle>
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
              <Label htmlFor='cat-icon'>Icon</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id='cat-icon'
                    variant='outline'
                    className='justify-between'
                    type='button'
                  >
                    <span className='flex items-center gap-2'>
                      {selectedIconOption ? (
                        <>
                          <selectedIconOption.Icon className='h-4 w-4' />
                          <span>{selectedIconOption.label}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className='h-4 w-4' />
                          <span>Select icon</span>
                        </>
                      )}
                    </span>
                    <span className='text-xs text-muted-foreground'>{icon}</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className='w-[420px] p-3' align='start'>
                  <div className='flex flex-col gap-3'>
                    <Input
                      value={iconQuery}
                      onChange={(e) => setIconQuery(e.target.value)}
                      placeholder='Search icon by keyword...'
                    />

                    <div
                      className='max-h-[260px] overflow-y-auto pr-1'
                      onScroll={(e) => setIconScrollTop(e.currentTarget.scrollTop)}
                    >
                      <div className='grid grid-cols-2 gap-2'>
                        {filteredIconOptions.length === 0 ? (
                          <div className='col-span-2 rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>
                            No icon found.
                          </div>
                        ) : (
                          <>
                            <div
                              className='col-span-2'
                              style={{ height: virtualizedIconState.topPadding }}
                            />

                            {visibleIconOptions.map((option) => {
                              const isSelected = icon === option.key

                              return (
                                <Button
                                  key={option.key}
                                  type='button'
                                  variant={isSelected ? 'secondary' : 'outline'}
                                  className='flex h-auto items-center justify-between gap-2 px-2 py-2'
                                  onClick={() => {
                                    setIcon(option.key)
                                    setIconQuery('')
                                  }}
                                >
                                  <span className='flex items-center gap-2 truncate'>
                                    <option.Icon className='h-4 w-4' />
                                    <span className='truncate text-left'>
                                      {option.label}
                                    </span>
                                  </span>
                                  <Check
                                    className={
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    }
                                  />
                                </Button>
                              )
                            })}

                            <div
                              className='col-span-2'
                              style={{ height: virtualizedIconState.bottomPadding }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <p className='text-xs text-muted-foreground'>
                Selected key:{' '}
                <span className='font-medium text-foreground'>{icon}</span>
              </p>
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border bg-card p-3'>
              <div>
                <p className='text-sm font-medium text-foreground'>Active</p>
                <p className='text-xs text-muted-foreground'>
                  Show this category in worker service listings.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                aria-label='Toggle category active state'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => resetDialogState()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || !icon.trim()}
              className='bg-primary text-white hover:bg-primary/90'
            >
              {isSubmitting
                ? editingCategory
                  ? 'Saving…'
                  : 'Adding…'
                : editingCategory
                  ? 'Save changes'
                  : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
