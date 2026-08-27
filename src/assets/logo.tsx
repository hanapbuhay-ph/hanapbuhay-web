import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/images/hanapbuhay-logo.png'
      alt='HanapBuhay'
      width={24}
      height={24}
      className={cn('size-6 object-contain', className)}
      {...props}
    />
  )
}

// Alias used by sidebar-data.ts (a .ts file that cannot contain JSX)
export { Logo as HanapBuhayLogo }
