import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '../ui/button'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Full-width branded header */}
        <div className='flex items-center justify-between rounded-xl bg-sidebar-primary px-3 py-2'>
          <Link
            to='/'
            onClick={() => setOpenMobile(false)}
            className='flex flex-1 items-center gap-3'
          >
            <img
              src='/images/hanapbuhay-logo.png'
              alt='HanapBuhay'
              className='h-10 w-10 shrink-0 object-contain drop-shadow-sm'
            />
            <div className='flex flex-col leading-tight'>
              <span className='text-base font-bold text-sidebar-primary-foreground'>
                HanapBuhay
              </span>
              <span className='text-[11px] font-medium text-sidebar-primary-foreground/70'>
                Admin Panel
              </span>
            </div>
          </Link>
          <ToggleSidebar />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function ToggleSidebar({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar='trigger'
      data-slot='sidebar-trigger'
      variant='ghost'
      size='icon'
      className={cn(
        'aspect-square size-8 text-sidebar-primary-foreground/80 hover:bg-sidebar-primary-foreground/10 hover:text-sidebar-primary-foreground max-md:scale-125',
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <X className='md:hidden' />
      <Menu className='max-md:hidden' />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  )
}
