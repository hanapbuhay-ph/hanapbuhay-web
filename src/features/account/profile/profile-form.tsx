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

interface AdminProfile {
  id: number
  name: string
  email: string
  role: string
  avatar_url: string | null
  phone: string
  created_at: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  phone: z.string().optional(),
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
  const { data: profile, isLoading } = useQuery<AdminProfile>({
    queryKey: ['admin_profile'],
    queryFn: async () => {
      const res = await api.get<AdminProfile>('/admin_profile')
      return res.data
    },
  })

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' },
  })

  // Populate form once data arrives
  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, phone: profile.phone ?? '' })
    }
  }, [profile, form])

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (values: ProfileValues) => {
      // Read-then-merge: PUT merges { name, phone } into the existing record
      const res = await api.put<AdminProfile>('/admin_profile', {
        ...profile,
        name: values.name,
        phone: values.phone ?? '',
      })
      return res.data
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin_profile'], updated)
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

          {/* Phone */}
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
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
