import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { type ServiceCategory } from '../types'

interface ServiceCategoryCardProps {
  category: ServiceCategory
  isTogglingId: number | null
  onEdit: (category: ServiceCategory) => void
  onToggle: (category: ServiceCategory) => void
}

export function ServiceCategoryCard({
  category,
  isTogglingId,
  onEdit,
  onToggle,
}: ServiceCategoryCardProps) {
  const isToggling = isTogglingId === category.id

  return (
    <Card
      className={
        category.is_active
          ? 'flex flex-col'
          : 'flex flex-col opacity-60'
      }
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-base leading-snug'>{category.name}</CardTitle>
          <Badge
            variant={category.is_active ? 'default' : 'secondary'}
            className={
              category.is_active
                ? 'shrink-0 bg-green-600 text-white hover:bg-green-700'
                : 'shrink-0'
            }
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='flex-1 pb-4'>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {category.description}
        </p>
      </CardContent>

      <CardFooter className='flex items-center justify-between border-t border-border pt-3'>
        {/* Toggle */}
        <div className='flex items-center gap-2'>
          <Switch
            checked={category.is_active}
            onCheckedChange={() => onToggle(category)}
            disabled={isToggling}
            aria-label={`Toggle ${category.name}`}
          />
          <span className='text-xs text-muted-foreground'>
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Edit button */}
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
        >
          <Pencil size={14} className='mr-1' />
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}
