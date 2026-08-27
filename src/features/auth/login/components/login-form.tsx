import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { setToken, isDevMode } from '@/lib/auth'
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
import { PasswordInput } from '@/components/password-input'

// ── Types ────────────────────────────────────────────────────────────────────

interface LoginResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
    role: string
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

  // ── Real login ─────────────────────────────────────────────────────────────

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', {
        email: data.email,
        password: data.password,
      })

      if (res.data.user.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.')
        return
      }

      setToken(res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate({ to: getRedirectTarget(), replace: true })
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.message ??
        'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
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
                    placeholder='admin@hanapbuhay.ph'
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
