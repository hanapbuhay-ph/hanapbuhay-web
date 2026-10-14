import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
  email: z.string().trim().email('Please enter a valid email address.'),
  mobile_number: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || /^(09\d{9}|\+639\d{9})$/.test(value.replace(/[\s()-]/g, '')),
      'Enter a Philippine mobile number, e.g. 0917 123 4567.'
    ),
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
  const [pendingEmailVerification, setPendingEmailVerification] = useState<
    string | null
  >(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isResendingVerificationCode, setIsResendingVerificationCode] =
    useState(false)
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0)

  useEffect(() => {
    if (otpSecondsRemaining <= 0) return
    const intervalId = window.setInterval(
      () => setOtpSecondsRemaining((seconds) => Math.max(0, seconds - 1)),
      1000
    )
    return () => window.clearInterval(intervalId)
  }, [otpSecondsRemaining])

  function startEmailVerificationExpiry(validitySeconds?: number) {
    const duration =
      Number.isFinite(validitySeconds) && validitySeconds && validitySeconds > 0
        ? validitySeconds
        : 5 * 60
    setOtpSecondsRemaining(duration)
  }

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: UserProfile }>(
        '/user'
      )
      return res.data.data
    },
  })

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', mobile_number: '' },
  })

  // Populate form once data arrives
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        mobile_number: profile.mobile_number ?? '',
      })
    }
  }, [profile, form])

  useEffect(() => {
    if (!selectedFile) {
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPhotoPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  useEffect(() => {
    if (selectedFile) return
    const timer = setTimeout(() => setPhotoPreview(null), 0)
    return () => clearTimeout(timer)
  }, [selectedFile])

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (values: ProfileValues) => {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      if (values.mobile_number) {
        formData.append('mobile_number', values.mobile_number)
      }
      if (selectedFile) {
        formData.append('profile_photo', selectedFile)
      }

      const res = await api.post<{
        success: boolean
        data: { user: UserProfile }
      }>('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return res.data.data.user
    },
    onSuccess: async (updated, values) => {
      queryClient.setQueryData(['user_profile'], updated)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      const emailChanged =
        values.email.trim().toLowerCase() !==
        (profile?.email ?? '').trim().toLowerCase()

      if (emailChanged) {
        try {
          const response = await api.post('/auth/email/resend-otp', {
            email: values.email.trim(),
          })
          setPendingEmailVerification(values.email.trim())
          setVerificationCode('')
          startEmailVerificationExpiry(
            response.data?.data?.otp_expires_in_seconds
          )
          toast.info(
            'Profile updated. A verification code has been sent to your new email address.'
          )
        } catch {
          toast.error(
            'Profile updated, but the verification code could not be sent.'
          )
        }
      } else {
        toast.success('Profile updated.')
      }
    },
  })

  async function handleVerifyEmail() {
    if (!pendingEmailVerification) {
      return
    }

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code sent to your new email.')
      return
    }

    setIsVerifyingEmail(true)

    try {
      const res = await api.post<{
        success: boolean
        data: { user: UserProfile }
      }>('/auth/email/verify', {
        email: pendingEmailVerification,
        code: verificationCode.trim(),
      })

      queryClient.setQueryData(['user_profile'], res.data.data.user)
      setPendingEmailVerification(null)
      setOtpSecondsRemaining(0)
      setVerificationCode('')
      toast.success('Email verified successfully.')
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((
              error.response as
                | { data?: { message?: string; error?: string } }
                | undefined
            )?.data?.message ??
            (
              error.response as
                | { data?: { message?: string; error?: string } }
                | undefined
            )?.data?.error ??
            'Unable to verify the email change.')
          : error instanceof Error
            ? error.message
            : 'Unable to verify the email change.'
      toast.error(message)
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  async function handleResendEmailVerification() {
    if (!pendingEmailVerification) return
    setIsResendingVerificationCode(true)
    try {
      const response = await api.post('/auth/email/resend-otp', {
        email: pendingEmailVerification,
      })
      const expiresIn = Number(response.data?.data?.otp_expires_in_seconds)
      if (expiresIn > 0) {
        setVerificationCode('')
        startEmailVerificationExpiry(expiresIn)
        toast.success('A new verification code has been sent.')
      } else {
        toast.info(response.data?.message ?? 'No new code was sent.')
      }
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error.response as { data?: { message?: string } } | undefined)
              ?.data?.message ?? 'Unable to resend the verification code.')
          : 'Unable to resend the verification code.'
      toast.error(message)
    } finally {
      setIsResendingVerificationCode(false)
    }
  }

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
            <AvatarFallback className='bg-primary/10 font-semibold text-primary'>
              {profile ? getInitials(profile.name) : '?'}
            </AvatarFallback>
          </Avatar>

          <button
            type='button'
            aria-label='Upload profile photo'
            onClick={() => fileInputRef.current?.click()}
            className='absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90'
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

      {pendingEmailVerification && (
        <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
          <p className='font-medium'>Verify your new email address</p>
          <p className='mt-1'>
            A verification code was sent to {pendingEmailVerification}.
          </p>
          <p className='mt-1'>
            {otpSecondsRemaining > 0
              ? `Code expires in ${String(Math.floor(otpSecondsRemaining / 60)).padStart(2, '0')}:${String(otpSecondsRemaining % 60).padStart(2, '0')}.`
              : 'This code has expired. Request a new one to continue.'}
          </p>
          <div className='mt-3 flex gap-2'>
            <Input
              type='text'
              inputMode='numeric'
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              placeholder='Enter verification code'
              className='max-w-xs'
              disabled={otpSecondsRemaining <= 0}
            />
            <Button
              type='button'
              variant='outline'
              onClick={handleVerifyEmail}
              disabled={isVerifyingEmail || otpSecondsRemaining <= 0}
            >
              {isVerifyingEmail ? 'Verifying...' : 'Verify'}
            </Button>
            {otpSecondsRemaining <= 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={handleResendEmailVerification}
                disabled={isResendingVerificationCode}
              >
                {isResendingVerificationCode ? 'Sending...' : 'Resend code'}
              </Button>
            )}
          </div>
        </div>
      )}

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

          {/* Email */}
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
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Changing your email will send a verification code to the new
                  address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name='mobile_number'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    inputMode='tel'
                    placeholder='0917 123 4567'
                    aria-describedby='profile-mobile-help'
                    {...field}
                  />
                </FormControl>
                <FormDescription id='profile-mobile-help'>
                  Use an 11-digit Philippine mobile number starting with 09.
                </FormDescription>
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
