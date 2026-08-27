import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from './components/login-form'

// ── Page ──────────────────────────────────────────────────────────────────────

export function LoginPage() {
  return (
    <div className='grid min-h-svh place-items-center bg-background px-4'>
      <div className='flex w-full max-w-sm flex-col items-center gap-6'>
        {/* Branding */}
        <div className='flex flex-col items-center gap-1 text-center'>
          <img
            src='/images/hanapbuhay-logo.png'
            alt='HanapBuhay'
            className='h-16 w-16 object-contain'
          />
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            HanapBuhay
          </h1>
          <p className='text-sm text-muted-foreground'>Admin Panel</p>
        </div>

        {/* Login card */}
        <Card
          className='w-full rounded-2xl border-border bg-card'
          style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
        >
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg font-semibold text-foreground'>
              Sign in to your account
            </CardTitle>
            <CardDescription>
              Only authorized admin accounts can access this panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className='text-center text-xs text-muted-foreground'>
          © {new Date().getFullYear()} HanapBuhay. All rights reserved.
        </p>
      </div>
    </div>
  )
}
