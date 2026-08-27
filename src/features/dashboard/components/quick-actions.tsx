import { Link } from '@tanstack/react-router'
import { ShieldCheck, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <div className='flex flex-col gap-3 sm:flex-row'>
      <Button
        asChild
        className='bg-primary text-white hover:bg-primary/90 hover:shadow-md'
      >
        <Link to='/verifications'>
          <ShieldCheck className='h-4 w-4' />
          Review Verifications
        </Link>
      </Button>

      <Button
        asChild
        variant='outline'
        className='border-border text-primary hover:bg-primary/5 hover:shadow-sm'
      >
        <Link to='/reports'>
          <Flag className='h-4 w-4' />
          View Reports
        </Link>
      </Button>
    </div>
  )
}
