import { useState } from 'react'
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
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/password-input'

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
  const [resetToken, setResetToken] = useState('')

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

  async function handleSendResetCode(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)

    try {
      await api.post('/auth/password/forgot', { email: data.email })
      setEmail(data.email)
      emailForm.reset()
      setStep('otp')
      toast.success(`A password reset code has been sent to ${data.email}.`)
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

  async function handleVerifyOtp(data: z.infer<typeof otpSchema>) {
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
              {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='mt-2' disabled={isLoading}>
              Verify code
              {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
            </Button>
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
              {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}
