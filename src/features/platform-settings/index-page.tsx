import { Link } from '@tanstack/react-router'
import { Bell, ChevronRight, Flag, FolderOpen, Megaphone } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

const SECTIONS = [
  {
    title: 'Service Categories',
    description:
      'Define the types of services workers can offer on the platform. Activate or deactivate categories as needed.',
    href: '/platform-settings/service-categories',
    icon: FolderOpen,
  },
  {
    title: 'Report Reason Categories',
    description:
      'Manage the predefined reasons users can select when filing a report. Edit labels and toggle visibility.',
    href: '/platform-settings/report-reasons',
    icon: Flag,
  },
  {
    title: 'Notification Templates',
    description:
      'Edit the body and subject of system notifications sent via push, email, and SMS. Toggle templates on or off platform-wide.',
    href: '/platform-settings/notification-templates',
    icon: Bell,
  },
  {
    title: 'Announcements',
    description:
      'Create and publish platform-wide announcements displayed in the user notification center. Archive when no longer relevant.',
    href: '/platform-settings/announcements',
    icon: Megaphone,
  },
]

export function PlatformSettingsIndexPage() {
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Platform Settings
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Configure platform-wide options for HanapBuhay.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {SECTIONS.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} to={href}>
              <Card className='group h-full cursor-pointer transition-shadow hover:shadow-md'>
                <CardHeader className='flex flex-row items-start gap-4 pb-2'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
                    <Icon size={20} />
                  </div>
                  <div className='flex-1'>
                    <CardTitle className='flex items-center justify-between text-base'>
                      {title}
                      <ChevronRight
                        size={16}
                        className='text-muted-foreground transition-colors group-hover:text-primary'
                      />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm leading-relaxed'>
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Main>
    </>
  )
}
