import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Input } from '@/components/ui/input'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number
  name: string
  email: string
  mobile_number: string | null
  role: string
  profile_photo_url: string | null
  barangay?: {
    id: number
    name: string
    latitude?: number
    longitude?: number
  } | null
  email_verified_at?: string | null
  is_google_account?: boolean
  notification_preferences?: {
    booking_updates: boolean
    messages: boolean
    promotions: boolean
    push: boolean
    email: boolean
  }
}

// ── Schema ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  mobile_number: z.string().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns up-to-2-character initials from a full name. */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileForm() {
  const queryClient = useQueryClient()

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: UserProfile }>('/user')
      return res.data.data
    },
  })

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', mobile_number: '' },
  })

  // Populate form once data arrives
  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, mobile_number: profile.mobile_number ?? '' })
    }
  }, [profile, form])

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (values: ProfileValues) => {
      const res = await api.post<{ success: boolean; data: { user: UserProfile } }>('/user/profile', {
        name: values.name,
        mobile_number: values.mobile_number ?? '',
      })
      return res.data.data.user
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['user_profile'], updated)
      toast.success('Profile updated.')
    },
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        <span className='text-sm'>Loading profile…</span>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Avatar — placeholder circle with initials (no upload yet) */}
      <div className='flex items-center gap-4'>
        <Avatar className='h-16 w-16 text-lg'>
          <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
            {profile ? getInitials(profile.name) : '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-medium'>{profile?.name}</p>
          <p className='text-xs text-muted-foreground'>{profile?.role}</p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => saveProfile(v))}
          className='space-y-6'
        >
          {/* Name */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Admin User' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email — read-only */}
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type='email'
                value={profile?.email ?? ''}
                disabled
                readOnly
                className='cursor-not-allowed opacity-60'
              />
            </FormControl>
            <FormDescription>
              Contact support to change your email address.
            </FormDescription>
          </FormItem>

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name='mobile_number'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder='09171234567' {...field} />
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
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  )
}
