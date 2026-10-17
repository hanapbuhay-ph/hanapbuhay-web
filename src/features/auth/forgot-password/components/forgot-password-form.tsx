import { useEffect, useState } from 'react'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/password-input'

const OTP_VALIDITY_SECONDS = 5 * 60

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email.')
    .email('Invalid email address.'),
})

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

const resetSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Please enter your new password.')
      .min(8, 'Password must be at least 8 characters.'),
    passwordConfirmation: z
      .string()
      .min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match.',
    path: ['passwordConfirmation'],
  })

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [resetCodeExpiresAt, setResetCodeExpiresAt] = useState<number | null>(
    null
  )
  const [resetToken, setResetToken] = useState('')
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  })

  useEffect(() => {
    if (step !== 'otp' || otpSecondsRemaining <= 0) return
    const intervalId = window.setInterval(
      () => setOtpSecondsRemaining((seconds) => Math.max(0, seconds - 1)),
      1000
    )
    return () => window.clearInterval(intervalId)
  }, [otpSecondsRemaining, step])

  function startOtpExpiryWindow(validitySeconds?: number) {
    const duration =
      Number.isFinite(validitySeconds) && validitySeconds && validitySeconds > 0
        ? validitySeconds
        : OTP_VALIDITY_SECONDS
    setOtpSecondsRemaining(duration)
  }

  function continueToOtp() {
    const remainingSeconds = resetCodeExpiresAt
      ? Math.max(0, Math.ceil((resetCodeExpiresAt - Date.now()) / 1000))
      : OTP_VALIDITY_SECONDS
    otpForm.reset()
    setOtpSecondsRemaining(remainingSeconds)
    setStep('otp')
  }

  async function handleSendResetCode(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)

    try {
      const res = await api.post('/auth/admin/password/forgot', {
        email: data.email,
      })
      setEmail(data.email)
      otpForm.reset()
      const validitySeconds =
        res.data?.data?.otp_expires_in_seconds ?? OTP_VALIDITY_SECONDS
      const duration =
        Number.isFinite(validitySeconds) && validitySeconds > 0
          ? validitySeconds
          : OTP_VALIDITY_SECONDS
      setResetCodeExpiresAt(Date.now() + duration * 1000)
      emailForm.reset({ email: data.email })
      toast.success(
        'If an account is eligible, a reset code will be sent. Check your email.'
      )
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Unable to send the reset code.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendResetCode() {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/admin/password/forgot', { email })
      otpForm.reset()
      startOtpExpiryWindow(res.data?.data?.otp_expires_in_seconds)
      toast.success(
        'If an account is eligible, a new reset code will be sent. Check your email.'
      )
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      toast.error(
        axiosErr?.response?.data?.message ??
          'Unable to request a new reset code.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(data: z.infer<typeof otpSchema>) {
    if (otpSecondsRemaining <= 0) return
    setIsLoading(true)

    try {
      const res = await api.post('/auth/password/verify-otp', {
        email,
        code: data.otp,
      })

      const nextResetToken = res.data?.data?.reset_token
      if (!nextResetToken) {
        throw new Error('Reset token not returned by the server.')
      }

      setResetToken(nextResetToken)
      setOtpSecondsRemaining(0)
      otpForm.reset()
      setStep('reset')
      toast.success('Code verified. You can now set a new password.')
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Unable to verify the code. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(data: z.infer<typeof resetSchema>) {
    setIsLoading(true)

    try {
      await api.post('/auth/password/reset', {
        email,
        reset_token: resetToken,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      })

      resetForm.reset()
      toast.success('Password reset successfully. Please sign in again.')
      navigate({ to: '/login' })
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Unable to reset the password. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...emailForm}>
      <form
        onSubmit={
          step === 'email'
            ? emailForm.handleSubmit(handleSendResetCode)
            : step === 'otp'
              ? otpForm.handleSubmit(handleVerifyOtp)
              : resetForm.handleSubmit(handleResetPassword)
        }
        className={cn('grid gap-2', className)}
        {...props}
      >
        {step === 'email' && (
          <>
            {resetCodeExpiresAt === null ? (
              <>
                <FormField
                  control={emailForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='name@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='mt-2' disabled={isLoading}>
                  Continue
                  {isLoading ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    <ArrowRight />
                  )}
                </Button>
              </>
            ) : (
              <>
                <p
                  role='status'
                  className='text-center text-sm text-muted-foreground'
                >
                  If an account is eligible for password reset, a code will be
                  sent. Check your email. If you have a code, continue below.
                </p>
                <Button
                  type='button'
                  className='mt-2'
                  onClick={continueToOtp}
                  disabled={isLoading}
                >
                  I have a code
                  <ArrowRight />
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setResetCodeExpiresAt(null)}
                  disabled={isLoading}
                >
                  Use a different email
                </Button>
              </>
            )}
          </>
        )}

        {step === 'otp' && (
          <>
            <p className='text-center text-sm text-muted-foreground'>
              {otpSecondsRemaining > 0
                ? `Code expires in ${String(Math.floor(otpSecondsRemaining / 60)).padStart(2, '0')}:${String(otpSecondsRemaining % 60).padStart(2, '0')}`
                : 'This code has expired. Request a new code to continue.'}
            </p>
            <FormField
              control={otpForm.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-time password</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={otpSecondsRemaining <= 0}
                      containerClassName='justify-center gap-2 [&_[data-slot="input-otp-group"]]:gap-2 [&_[data-slot="input-otp-group"]>div]:h-11 [&_[data-slot="input-otp-group"]>div]:w-10 sm:[&_[data-slot="input-otp-group"]>div]:w-11'
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='mt-2'
              disabled={isLoading || otpSecondsRemaining <= 0}
            >
              Verify code
              {isLoading ? (
                <Loader2 className='animate-spin' />
              ) : (
                <ArrowRight />
              )}
            </Button>
            {otpSecondsRemaining <= 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={handleResendResetCode}
                disabled={isLoading}
              >
                Request a new code
              </Button>
            )}
          </>
        )}

        {step === 'reset' && (
          <>
            <FormField
              control={resetForm.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name='passwordConfirmation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='mt-2' disabled={isLoading}>
              Reset password
              {isLoading ? (
                <Loader2 className='animate-spin' />
              ) : (
                <ArrowRight />
              )}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}
