import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { setToken, setUser, isDevMode } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/password-input'

// ── Types ────────────────────────────────────────────────────────────────────

// Real API response shape: { success: true, data: { token, user } }
interface LoginApiResponse {
  success: boolean
  message: string
  data: {
    token?: string
    user?: {
      id: number
      name: string
      email: string
      role: string
    }
    requiresOtp?: boolean
  }
}

// ── Validation schema ─────────────────────────────────────────────────────────

const formSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Invalid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type FormValues = z.infer<typeof formSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDevLoading, setIsDevLoading] = useState(false)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/(auth)/login' })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getRedirectTarget(): string {
    return redirect && redirect !== '/' ? redirect : '/'
  }

  function getDeviceName(): string {
    const ua = navigator.userAgent
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform ?? 'Web'

    if (ua.includes('Edg/')) return `${platform} • Edge`
    if (ua.includes('Chrome/')) return `${platform} • Chrome`
    if (ua.includes('Firefox/')) return `${platform} • Firefox`
    if (ua.includes('Safari/')) return `${platform} • Safari`

    return `${platform} • Browser`
  }

  // ── Real login ─────────────────────────────────────────────────────────────

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      const res = await api.post<LoginApiResponse>('/auth/login', {
        email: data.email,
        password: data.password,
        device_name: getDeviceName(),
      })

      if (res.data.data.requiresOtp) {
        setOtpEmail(data.email)
        setOtpCode('')
        setOtpDialogOpen(true)
        toast.info('A verification code has been sent to your email.')
        return
      }

      const token = res.data.data.token
      const user = res.data.data.user

      if (!token || !user) {
        throw new Error('Invalid login response.')
      }

      if (user.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.')
        return
      }

      setToken(token)
      setUser(user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate({ to: getRedirectTarget(), replace: true })
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const status = axiosErr?.response?.status

      if (status === 401) {
        toast.error('Invalid email or password.')
      } else if (status === 403) {
        const message = axiosErr?.response?.data?.message ?? 'Access denied.'
        toast.error(message)
      } else {
        const message =
          axiosErr?.response?.data?.message ??
          axiosErr?.message ??
          'Something went wrong. Please try again.'
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyOtp() {
    if (!otpEmail) {
      return
    }

    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code.')
      return
    }

    setIsVerifyingOtp(true)

    try {
      const res = await api.post<LoginApiResponse>('/auth/login/verify-otp', {
        email: otpEmail,
        code: otpCode,
        device_name: getDeviceName(),
      })

      const token = res.data.data.token
      const user = res.data.data.user

      if (!token || !user) {
        throw new Error('Invalid verification response.')
      }

      setToken(token)
      setUser(user)
      setOtpDialogOpen(false)
      setOtpCode('')
      toast.success(`Welcome back, ${user.name}!`)
      navigate({ to: getRedirectTarget(), replace: true })
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Unable to verify the code. Please try again.'

      toast.error(message)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  async function resendOtp() {
    if (!otpEmail) {
      return
    }

    setIsResendingOtp(true)

    try {
      await api.post('/auth/login/resend-otp', { email: otpEmail })
      setOtpCode('')
      toast.success('A new verification code has been sent.')
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Unable to resend the verification code.'

      toast.error(message)
    } finally {
      setIsResendingOtp(false)
    }
  }

  // ── Dev bypass ────────────────────────────────────────────────────────────

  function handleDevLogin() {
    setIsDevLoading(true)
    setToken('dev-mock-token-hanapbuhay-admin')
    toast.success('Dev login — skipped authentication.')
    navigate({ to: getRedirectTarget(), replace: true })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-col gap-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-3'
          noValidate
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='admin@hanapbuhay.com'
                    className='rounded-lg'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder='••••••••'
                    className='rounded-lg'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            disabled={isLoading}
            className='mt-1 bg-primary text-white hover:bg-primary/90 hover:shadow-md'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <LogIn className='h-4 w-4' />
            )}
            Sign In
          </Button>
        </form>
      </Form>

      <Dialog
        open={otpDialogOpen}
        onOpenChange={(open) => {
          setOtpDialogOpen(open)
          if (!open) {
            setOtpCode('')
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to {otpEmail}.
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-center py-2'>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter className='sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={resendOtp}
              disabled={isResendingOtp}
            >
              {isResendingOtp ? 'Sending...' : 'Resend code'}
            </Button>
            <Button
              type='button'
              onClick={verifyOtp}
              disabled={otpCode.length !== 6 || isVerifyingOtp}
            >
              {isVerifyingOtp ? 'Verifying...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dev login — only visible when pointing at localhost */}
      {isDevMode() && (
        <div className='flex flex-col gap-2'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-dashed border-border' />
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='bg-card px-2 text-muted-foreground'>
                dev only
              </span>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            disabled={isDevLoading}
            onClick={handleDevLogin}
            className='border-border text-primary hover:bg-primary/5'
          >
            {isDevLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Zap className='h-4 w-4' />
            )}
            Dev Login (skip auth)
          </Button>
        </div>
      )}
    </div>
  )
}
