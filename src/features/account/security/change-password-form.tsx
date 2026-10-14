import { useEffect, useState } from 'react'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

// ── Schema ────────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function ChangePasswordForm() {
  const [isPending, setIsPending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    api
      .get('/user/password/cooldown')
      .then((response) => {
        const seconds = Number(response.data?.data?.retry_after_seconds)
        if (Number.isFinite(seconds) && seconds > 0) {
          setCooldownSeconds(seconds)
        }
      })
      .catch(() => {
        toast.error('Unable to check the password-change cooldown.')
      })
  }, [])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const intervalId = window.setInterval(() => {
      setCooldownSeconds((remaining) => Math.max(0, remaining - 1))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [cooldownSeconds])

  function startCooldown(seconds: number) {
    setCooldownSeconds(seconds)
  }

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: PasswordValues) {
    if (cooldownSeconds > 0) return
    setIsPending(true)

    try {
      const response = await api.post('/user/password', {
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
      })

      const retryAfter = Number(response.data?.data?.retry_after_seconds)
      startCooldown(
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60
      )
      toast.success('Password updated successfully.')
      form.reset()
    } catch (error) {
      const axiosError = error instanceof AxiosError ? error : null
      const message =
        axiosError?.response?.data?.message ??
        'Unable to update password. Please try again.'

      const retryAfter = Number(
        axiosError?.response?.data?.data?.retry_after_seconds
      )
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        startCooldown(retryAfter)
      }
      toast.error(message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        {/* Current Password */}
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormDescription>Minimum 8 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm New Password */}
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending || cooldownSeconds > 0}
          className='bg-primary text-white hover:bg-primary/90'
        >
          {isPending && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
          {cooldownSeconds > 0
            ? `Try again in ${String(Math.floor(cooldownSeconds / 60)).padStart(2, '0')}:${String(cooldownSeconds % 60).padStart(2, '0')}`
            : 'Update Password'}
        </Button>
        {cooldownSeconds > 0 && (
          <p className='text-sm text-muted-foreground'>
            You can submit another password change when the countdown ends.
          </p>
        )}
      </form>
    </Form>
  )
}
