import { Separator } from '@/components/ui/separator'
import { ChangePasswordForm } from './change-password-form'
import { TwoFactorSection } from './two-factor-section'

export function AccountSecurity() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>Security Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Manage your password and two-factor authentication.
        </p>
      </div>
      <Separator className='my-4 flex-none' />

      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='-mx-1 space-y-10 px-1.5 lg:max-w-xl'>
          {/* Section A — Change Password */}
          <section>
            <h4 className='mb-1 text-sm font-semibold'>Change Password</h4>
            <p className='mb-4 text-sm text-muted-foreground'>
              Choose a strong password of at least 8 characters.
            </p>
            <ChangePasswordForm />
          </section>

          <Separator />

          {/* Section B — Two-Factor Authentication */}
          <section>
            <h4 className='mb-1 text-sm font-semibold'>
              Two-Factor Authentication
            </h4>
            <p className='mb-4 text-sm text-muted-foreground'>
              Add an extra layer of security to your account.
            </p>
            <TwoFactorSection />
          </section>
        </div>
      </div>
    </div>
  )
}
