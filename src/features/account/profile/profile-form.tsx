import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

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

  useEffect(() => {
    if (!selectedFile) {
      setPhotoPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPhotoPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (values: ProfileValues) => {
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.mobile_number) {
        formData.append('mobile_number', values.mobile_number)
      }
      if (selectedFile) {
        formData.append('profile_photo', selectedFile)
      }

      const res = await api.post<{ success: boolean; data: { user: UserProfile } }>(
        '/user/profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return res.data.data.user
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['user_profile'], updated)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
      {/* Avatar */}
      <div className='flex items-center gap-4'>
        <div className='relative'>
          <Avatar className='h-16 w-16 text-lg'>
            {profile?.profile_photo_url || photoPreview ? (
              <AvatarImage
                src={photoPreview ?? profile?.profile_photo_url ?? undefined}
                alt={profile?.name ?? 'Profile'}
              />
            ) : null}
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {profile ? getInitials(profile.name) : '?'}
            </AvatarFallback>
          </Avatar>

          <button
            type='button'
            aria-label='Upload profile photo'
            onClick={() => fileInputRef.current?.click()}
            className='absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90'
          >
            <Camera className='h-3.5 w-3.5' />
          </button>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
          />
        </div>

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
