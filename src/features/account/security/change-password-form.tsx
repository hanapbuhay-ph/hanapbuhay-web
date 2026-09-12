import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { AxiosError } from 'axios'
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

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: PasswordValues) {
    setIsPending(true)

    try {
      await api.post('/user/password', {
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
      })

      toast.success('Password updated successfully.')
      form.reset()
    } catch (error) {
      const axiosError = error instanceof AxiosError ? error : null
      const message =
        axiosError?.response?.data?.message ??
        'Unable to update password. Please try again.'

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
          disabled={isPending}
          className='bg-primary text-white hover:bg-primary/90'
        >
          {isPending && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
          Update Password
        </Button>
      </form>
    </Form>
  )
}
