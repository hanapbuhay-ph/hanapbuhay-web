import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { setToken, setUser } from '@/lib/auth'
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
      role: string | null
    }
    requiresOtp?: boolean
  }
}

// ── Validation schema ─────────────────────────────────────────────────────────

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email.')
    .email('Invalid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type FormValues = z.infer<typeof formSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null)
  const [otpCountdown, setOtpCountdown] = useState('10:00')
  const [otpExpired, setOtpExpired] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)
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
        .userAgentData?.platform ??
      navigator.platform ??
      'Web'

    if (ua.includes('Edg/')) return `${platform} • Edge`
    if (ua.includes('Chrome/')) return `${platform} • Chrome`
    if (ua.includes('Firefox/')) return `${platform} • Firefox`
    if (ua.includes('Safari/')) return `${platform} • Safari`

    return `${platform} • Browser`
  }

  function startOtpExpiryWindow() {
    const expiry = Date.now() + 10 * 60 * 1000
    setOtpExpiresAt(expiry)
    setOtpExpired(false)
  }

  function formatCountdown(expiry: number) {
    const remainingMs = Math.max(expiry - Date.now(), 0)
    const totalSeconds = Math.ceil(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  useEffect(() => {
    if (!otpDialogOpen || otpExpiresAt === null) {
      return
    }

    setOtpCountdown(formatCountdown(otpExpiresAt))

    const intervalId = window.setInterval(() => {
      const nextCountdown = formatCountdown(otpExpiresAt)
      setOtpCountdown(nextCountdown)

      if (Date.now() >= otpExpiresAt) {
        setOtpExpired(true)
        window.clearInterval(intervalId)
      }
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [otpDialogOpen, otpExpiresAt])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !googleButtonRef.current) {
      return
    }

    let intervalId: number | undefined
    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return false
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      })
      googleButtonRef.current.replaceChildren()
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_blue',
        size: 'large',
        width: 320,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'en',
      })
      return true
    }

    if (!renderGoogleButton()) {
      intervalId = window.setInterval(() => {
        if (renderGoogleButton() && intervalId !== undefined) {
          window.clearInterval(intervalId)
        }
      }, 100)
    }

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
      window.google?.accounts.id.cancel()
    }
  }, [])

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
        startOtpExpiryWindow()
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

  async function handleGoogleCredential(response: GoogleCredentialResponse) {
    setIsGoogleLoading(true)

    try {
      const res = await api.post<LoginApiResponse>('/auth/google', {
        google_token: response.credential,
        device_name: getDeviceName(),
        admin_only: true,
      })

      if (res.data.data.requiresOtp) {
        const email = res.data.data.user?.email
        if (!email) {
          throw new Error('Google login did not return an email address.')
        }

        setOtpEmail(email)
        setOtpCode('')
        startOtpExpiryWindow()
        setOtpDialogOpen(true)
        toast.info('A verification code has been sent to your admin email.')
        return
      }

      const token = res.data.data.token
      const user = res.data.data.user

      if (!token || !user || user.role !== 'admin') {
        throw new Error('This Google account is not configured as an admin.')
      }

      setToken(token)
      setUser(user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate({ to: getRedirectTarget(), replace: true })
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Google sign-in failed. Please try again.'
      toast.error(message)
    } finally {
      setIsGoogleLoading(false)
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
      setOtpExpired(false)
      startOtpExpiryWindow()
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
                <div className='flex items-center justify-between gap-2'>
                  <FormLabel>Password</FormLabel>
                  <Link
                    to='/forgot-password'
                    className='text-xs font-medium text-muted-foreground transition-colors hover:text-primary'
                  >
                    Forgot password?
                  </Link>
                </div>
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

          <div className='flex flex-col items-center gap-3 py-2'>
            <p className='text-sm text-muted-foreground'>
              {otpExpired
                ? 'This code has expired. Request a new one.'
                : `Code expires in ${otpCountdown}`}
            </p>

            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
              disabled={otpExpired}
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
              disabled={otpCode.length !== 6 || isVerifyingOtp || otpExpired}
            >
              {isVerifyingOtp ? 'Verifying...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className='flex flex-col gap-2'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='bg-card px-2 text-muted-foreground'>
                or continue with
              </span>
            </div>
          </div>
          <div
            ref={googleButtonRef}
            className={`flex min-h-10 justify-center transition-opacity ${
              isGoogleLoading ? 'pointer-events-none opacity-60' : ''
            }`}
          />
        </div>
      )}
    </div>
  )
}
