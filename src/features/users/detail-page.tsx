import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
  BriefcaseBusiness,
  Star,
  Clock3,
  MessageSquareText,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ReactivateDialog } from './components/reactivate-dialog'
import { SuspendDialog } from './components/suspend-dialog'
import { UserRoleBadge } from './components/user-role-badge'
import { UserStatusBadge } from './components/user-status-badge'
import { useUser } from './hooks/use-user'
import { useUserAction } from './hooks/use-user-action'
import { useUserDeletionRequest } from './hooks/use-user-deletion-request'
import { type ActivityPage, type ActivityPagination } from './types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserDetailPageProps {
  id: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserDetailPage({ id }: UserDetailPageProps) {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch, setData } = useUser(id)
  const { isSubmitting, suspend, reactivate } = useUserAction()
  const { hasPendingDeletion, requestedAt } = useUserDeletionRequest(data)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showReactivate, setShowReactivate] = useState(false)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const sections = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'account', label: 'Account' },
      ...(data?.worker_profile
        ? [
            { id: 'worker-profile', label: 'Worker profile' },
            { id: 'job-posts', label: 'Job posts' },
          ]
        : []),
      ...(data?.activity
        ? [
            { id: 'bookings', label: 'Bookings' },
            { id: 'reviews', label: 'Reviews' },
          ]
        : []),
      ...(data?.notification_preferences
        ? [{ id: 'notifications', label: 'Notifications' }]
        : []),
    ],
    [data?.activity, data?.notification_preferences, data?.worker_profile]
  )

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(`user-detail-${id}`))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visible[0]?.target.id.replace('user-detail-', '')
        if (id) setActiveSection(id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sections])

  function handleSuspendConfirm(reason: string) {
    if (!data) return
    suspend(data.id, reason, (isActive) => {
      setData((prev) => (prev ? { ...prev, is_active: isActive } : prev))
      setShowSuspend(false)
    })
  }

  function handleReactivateConfirm() {
    if (!data) return
    reactivate(data.id, (isActive) => {
      setData((prev) => (prev ? { ...prev, is_active: isActive } : prev))
      setShowReactivate(false)
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back + title */}
        <div className='mb-6 flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate({ to: '/users' })}
            className='h-8 w-8 text-primary hover:bg-primary/10'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              User Detail
            </h1>
            <p className='text-sm text-muted-foreground'>
              View and manage this user's account.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <DetailSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
            <p className='text-sm font-semibold text-foreground'>
              Failed to load user
            </p>
            <p className='text-xs text-muted-foreground'>{error}</p>
            <Button
              size='sm'
              variant='outline'
              onClick={refetch}
              className='mt-1 border-border text-primary hover:bg-primary/5'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Retry
            </Button>
          </div>
        )}

        {/* Data */}
        {!isLoading && !error && data && (
          <div className='flex flex-col gap-5'>
            <Card
              id='user-detail-overview'
              className='scroll-mt-24 overflow-hidden rounded-2xl border-border bg-card'
            >
              <CardContent className='flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center sm:p-6'>
                {data.profile_photo_url ? (
                  <button
                    type='button'
                    aria-label={`View ${data.name}'s profile photo`}
                    onClick={() => setIsPhotoOpen(true)}
                    className='shrink-0 cursor-zoom-in rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
                  >
                    <Avatar className='h-20 w-20 border-2 border-background shadow-sm sm:h-24 sm:w-24'>
                      <AvatarImage
                        src={data.profile_photo_url}
                        alt={`${data.name} profile`}
                      />
                      <AvatarFallback className='bg-primary/10 text-2xl font-semibold text-primary'>
                        {getInitials(data.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <Avatar className='h-20 w-20 shrink-0 border-2 border-background shadow-sm sm:h-24 sm:w-24'>
                    <AvatarFallback className='bg-primary/10 text-2xl font-semibold text-primary'>
                      {getInitials(data.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className='min-w-0 flex-1'>
                  <h2 className='text-xl font-semibold text-foreground'>
                    {data.name}
                  </h2>
                  <p className='mt-1 text-sm break-all text-muted-foreground'>
                    {data.email}
                  </p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <UserRoleBadge role={data.role} />
                    <UserStatusBadge isActive={data.is_active} />
                  </div>
                  {data.role === 'super_admin' && (
                    <p className='mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300'>
                      <ShieldCheck className='h-4 w-4 shrink-0' />
                      Protected super admin account
                    </p>
                  )}
                </div>
                {data.role !== 'super_admin' && data.is_active ? (
                  <Button
                    variant='outline'
                    onClick={() => setShowSuspend(true)}
                    disabled={isSubmitting}
                    className='w-full shrink-0 border-destructive text-destructive hover:bg-destructive/5 sm:w-auto'
                  >
                    <UserX className='h-4 w-4' />
                    Suspend User
                  </Button>
                ) : data.role !== 'super_admin' ? (
                  <Button
                    onClick={() => setShowReactivate(true)}
                    disabled={isSubmitting}
                    className='w-full shrink-0 bg-primary text-white hover:bg-primary/90 hover:shadow-md sm:w-auto'
                  >
                    <UserCheck className='h-4 w-4' />
                    Reactivate User
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <MetricCard
                label='Bookings'
                value={String(data.activity?.bookings.total ?? 0)}
                detail='Total bookings'
                icon={Calendar}
              />
              <MetricCard
                label={
                  data.worker_profile ? 'Average rating' : 'Reviews received'
                }
                value={
                  data.worker_profile
                    ? `${Number(data.worker_profile.average_rating).toFixed(2)} / 5`
                    : String(data.activity?.reviews_received_count ?? 0)
                }
                detail={
                  data.worker_profile
                    ? `${data.worker_profile.total_reviews} reviews`
                    : 'Ratings from other users'
                }
                icon={Star}
              />
              {data.worker_profile && (
                <MetricCard
                  label='Completed jobs'
                  value={String(data.worker_profile.completed_jobs)}
                  detail='Jobs completed'
                  icon={BriefcaseBusiness}
                />
              )}
              {!data.worker_profile && (
                <MetricCard
                  label='Reviews given'
                  value={String(data.activity?.reviews_given_count ?? 0)}
                  detail='Ratings submitted'
                  icon={MessageSquareText}
                />
              )}
              <MetricCard
                label='Member since'
                value={format(new Date(data.created_at), 'MMM yyyy')}
                detail={format(new Date(data.created_at), 'MMMM d, yyyy')}
                icon={Clock3}
              />
            </div>

            <div className='grid items-start gap-5 lg:grid-cols-[200px_minmax(0,1fr)]'>
              <nav
                aria-label='User details sections'
                className='flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible'
              >
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#user-detail-${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    aria-current={
                      activeSection === section.id ? 'location' : undefined
                    }
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors lg:w-full ${
                      activeSection === section.id
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>

              <div className='flex min-w-0 flex-col gap-5'>
                <section
                  id='user-detail-account'
                  className='flex scroll-mt-24 flex-col gap-5'
                >
                  <Card
                    className='rounded-2xl border-border bg-card'
                    style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base text-foreground'>
                        Contact &amp; Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
                      <InfoRow icon={Mail} label={data.email} />
                      <InfoRow
                        icon={Phone}
                        label={
                          data.mobile_number || 'Phone number not provided'
                        }
                      />
                      <InfoRow
                        icon={MapPin}
                        label={data.barangay ?? 'Barangay not set'}
                      />
                    </CardContent>
                  </Card>

                  <Card
                    className='rounded-2xl border-border bg-card'
                    style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base text-foreground'>
                        Account Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
                      <InfoRow
                        icon={Calendar}
                        label={`Joined ${format(new Date(data.created_at), 'MMMM d, yyyy')}`}
                      />
                      {data.is_google_account !== undefined && (
                        <InfoRow
                          icon={ShieldCheck}
                          label={
                            data.is_google_account
                              ? 'Google account'
                              : 'Email & password account'
                          }
                        />
                      )}
                      {data.email_verified_at && (
                        <InfoRow
                          icon={ShieldCheck}
                          label={`Email verified ${format(new Date(data.email_verified_at), 'MMMM d, yyyy')}`}
                        />
                      )}
                      <InfoRow
                        icon={ShieldCheck}
                        label={
                          data.two_factor_enabled
                            ? 'Two-factor authentication enabled'
                            : 'Two-factor authentication disabled'
                        }
                      />
                      {data.last_seen_at && (
                        <InfoRow
                          icon={Clock3}
                          label={`Last active ${format(new Date(data.last_seen_at), 'MMM d, yyyy h:mm a')}`}
                        />
                      )}
                      {hasPendingDeletion && requestedAt && (
                        <InfoRow
                          icon={Trash2}
                          label={`Deletion requested ${format(new Date(requestedAt), 'MMM d, yyyy')}`}
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {data.worker_profile && (
                  <>
                    <section
                      id='user-detail-worker-profile'
                      className='scroll-mt-24'
                    >
                      <Card
                        className='rounded-2xl border-border bg-card'
                        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
                      >
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-base text-foreground'>
                            Worker Profile
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-5'>
                          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                            <DetailValue
                              label='Verification'
                              value={data.worker_profile.verification_status.replaceAll(
                                '_',
                                ' '
                              )}
                            />
                            <DetailValue
                              label='Trust tier'
                              value={
                                data.worker_profile.trust_tier?.replaceAll(
                                  '_',
                                  ' '
                                ) ?? 'Not assigned'
                              }
                            />
                            <DetailValue
                              label='Availability'
                              value={data.worker_profile.availability_status}
                            />
                            <DetailValue
                              label='Average rating'
                              value={`${Number(data.worker_profile.average_rating).toFixed(2)} / 5`}
                            />
                            <DetailValue
                              label='Reviews'
                              value={String(data.worker_profile.total_reviews)}
                            />
                            <DetailValue
                              label='Completed jobs'
                              value={String(data.worker_profile.completed_jobs)}
                            />
                            <DetailValue
                              label='Verified on'
                              value={
                                data.worker_profile.verified_at
                                  ? format(
                                      new Date(data.worker_profile.verified_at),
                                      'MMM d, yyyy'
                                    )
                                  : 'Not verified'
                              }
                            />
                            {data.worker_profile.verified_by && (
                              <DetailValue
                                label='Verified by'
                                value={data.worker_profile.verified_by.name}
                              />
                            )}
                            <DetailValue
                              label='Profile created'
                              value={
                                data.worker_profile.created_at
                                  ? format(
                                      new Date(data.worker_profile.created_at),
                                      'MMM d, yyyy'
                                    )
                                  : '—'
                              }
                            />
                          </div>
                          {data.worker_profile.bio && (
                            <div className='border-t border-border pt-4'>
                              <p className='text-xs font-medium text-muted-foreground'>
                                Professional bio
                              </p>
                              <p className='mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground'>
                                {data.worker_profile.bio}
                              </p>
                            </div>
                          )}
                          {data.worker_profile.verification_remarks && (
                            <div className='border-t border-border pt-4'>
                              <p className='text-xs font-medium text-muted-foreground'>
                                Verification remarks
                              </p>
                              <p className='mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground'>
                                {data.worker_profile.verification_remarks}
                              </p>
                            </div>
                          )}
                          <div className='border-t border-border pt-4'>
                            <p className='mb-2 text-xs font-medium text-muted-foreground'>
                              Service categories
                            </p>
                            {data.worker_profile.service_categories.length ? (
                              <div className='flex flex-wrap gap-2'>
                                {data.worker_profile.service_categories.map(
                                  (category) => (
                                    <span
                                      key={category.id}
                                      className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                                    >
                                      {category.name}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className='text-sm text-muted-foreground'>
                                No service categories listed.
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    <section
                      id='user-detail-job-posts'
                      className='scroll-mt-24'
                    >
                      <Card
                        className='rounded-2xl border-border bg-card'
                        style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
                      >
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center gap-2 text-base text-foreground'>
                            <BriefcaseBusiness className='h-4 w-4 text-primary' />
                            Job Posts ({data.worker_profile.job_posts.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                          {data.worker_profile.job_posts.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>
                              No job posts found.
                            </p>
                          ) : (
                            data.worker_profile.job_posts.map((post) => (
                              <div
                                key={post.id}
                                className='rounded-xl border border-border p-4'
                              >
                                <div className='flex flex-wrap items-start justify-between gap-2'>
                                  <div>
                                    <h3 className='font-semibold text-foreground'>
                                      {post.title}
                                    </h3>
                                    <p className='mt-1 text-xs text-muted-foreground'>
                                      {post.service_category ?? 'Uncategorized'}{' '}
                                      · {post.rate_display}
                                    </p>
                                  </div>
                                  <span className='rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground capitalize'>
                                    {post.deleted_at
                                      ? 'Deleted'
                                      : !post.is_active
                                        ? 'Inactive'
                                        : post.is_available
                                          ? 'Available'
                                          : 'Unavailable'}
                                  </span>
                                </div>
                                <p className='mt-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                                  {post.description}
                                </p>
                                {post.images.length > 0 && (
                                  <div className='mt-3 flex flex-wrap gap-2'>
                                    {post.images.map((image, index) => (
                                      <img
                                        key={`${post.id}-${index}`}
                                        src={
                                          image.thumbnail_url ??
                                          image.image_url ??
                                          undefined
                                        }
                                        alt={`${post.title} image ${index + 1}`}
                                        className='h-16 w-16 rounded-lg border border-border object-cover'
                                      />
                                    ))}
                                  </div>
                                )}
                                <p className='mt-3 text-xs text-muted-foreground'>
                                  Posted{' '}
                                  {post.created_at
                                    ? format(
                                        new Date(post.created_at),
                                        'MMM d, yyyy'
                                      )
                                    : 'date unavailable'}
                                </p>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </section>
                  </>
                )}

                {data.notification_preferences && (
                  <section
                    id='user-detail-notifications'
                    className='scroll-mt-24'
                  >
                    <Card className='rounded-2xl border-border bg-card'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-base text-foreground'>
                          Notification Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        {Object.entries(data.notification_preferences).map(
                          ([key, enabled]) => (
                            <div
                              key={key}
                              className='flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2'
                            >
                              <span className='text-sm text-muted-foreground capitalize'>
                                {key.replaceAll('_', ' ')}
                              </span>
                              <span
                                className={
                                  enabled
                                    ? 'text-xs font-medium text-primary'
                                    : 'text-xs text-muted-foreground'
                                }
                              >
                                {enabled ? 'On' : 'Off'}
                              </span>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </section>
                )}

                {data.activity && (
                  <>
                    <section id='user-detail-bookings' className='scroll-mt-24'>
                      <BookingActivity
                        userId={data.id}
                        role={data.role}
                        total={data.activity.bookings.total}
                        byStatus={data.activity.bookings.by_status}
                        initialItems={data.activity.bookings.recent}
                        initialPagination={data.activity.bookings.pagination}
                      />
                    </section>

                    <section id='user-detail-reviews' className='scroll-mt-24'>
                      <Card className='rounded-2xl border-border bg-card'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center gap-2 text-base text-foreground'>
                            <MessageSquareText className='h-4 w-4 text-primary' />
                            Review Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='grid gap-5 md:grid-cols-2'>
                          <ReviewActivity
                            userId={data.id}
                            type='reviews-received'
                            title={`Received (${data.activity.reviews_received_count})`}
                            initialPagination={
                              data.activity.reviews_received_pagination
                            }
                            reviews={data.activity.recent_reviews_received.map(
                              (review) => ({
                                id: review.id,
                                booking_code: review.booking_code,
                                counterpart: review.from,
                                score: review.score,
                                comment: review.comment,
                                created_at: review.created_at,
                              })
                            )}
                          />
                          <ReviewActivity
                            userId={data.id}
                            type='reviews-given'
                            title={`Given (${data.activity.reviews_given_count})`}
                            initialPagination={
                              data.activity.reviews_given_pagination
                            }
                            reviews={data.activity.recent_reviews_given.map(
                              (review) => ({
                                id: review.id,
                                booking_code: review.booking_code,
                                counterpart: review.to,
                                score: review.score,
                                comment: review.comment,
                                created_at: review.created_at,
                              })
                            )}
                          />
                        </CardContent>
                      </Card>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {data?.profile_photo_url && (
          <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
            <DialogContent className='max-w-3xl rounded-2xl border-border bg-card p-4 sm:p-6'>
              <DialogHeader>
                <DialogTitle className='text-sm font-semibold text-foreground'>
                  {data.name}'s profile photo
                </DialogTitle>
              </DialogHeader>
              <img
                src={data.profile_photo_url}
                alt={`${data.name}'s profile`}
                className='max-h-[75vh] w-full rounded-xl object-contain'
              />
            </DialogContent>
          </Dialog>
        )}
      </Main>

      {/* Dialogs — rendered outside Main so they always portal correctly */}
      {data && (
        <>
          <SuspendDialog
            open={showSuspend}
            userName={data.name}
            isSubmitting={isSubmitting}
            onConfirm={handleSuspendConfirm}
            onCancel={() => setShowSuspend(false)}
          />
          <ReactivateDialog
            open={showReactivate}
            userName={data.name}
            isSubmitting={isSubmitting}
            onConfirm={handleReactivateConfirm}
            onCancel={() => setShowReactivate(false)}
          />
        </>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Mail
}) {
  return (
    <Card className='rounded-xl border-border bg-card'>
      <CardContent className='flex items-start justify-between gap-3 p-4'>
        <div className='min-w-0'>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <p className='mt-1 truncate text-xl font-semibold text-foreground'>
            {value}
          </p>
          <p className='mt-1 truncate text-xs text-muted-foreground'>
            {detail}
          </p>
        </div>
        <span className='rounded-lg bg-primary/10 p-2 text-primary'>
          <Icon className='h-4 w-4' />
        </span>
      </CardContent>
    </Card>
  )
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 text-sm font-medium text-foreground capitalize'>
        {value}
      </p>
    </div>
  )
}

interface BookingActivityItem {
  id: number
  booking_code: string
  status: string
  scheduled_at: string | null
  service_category: string | null
  other_party: { id: number | null; name: string | null }
}

interface ReviewActivityItem {
  id: number
  booking_code: string | null
  counterpart: string | null
  score: number
  comment: string | null
  created_at: string | null
}

interface ApiReviewActivityItem extends Omit<
  ReviewActivityItem,
  'counterpart'
> {
  from?: string | null
  to?: string | null
}

function BookingActivity({
  userId,
  role,
  total,
  byStatus,
  initialItems,
  initialPagination,
}: {
  userId: number
  role: string
  total: number
  byStatus: Record<string, number>
  initialItems: BookingActivityItem[]
  initialPagination: ActivityPagination
}) {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: [
      'admin',
      'users',
      userId,
      'activity',
      'bookings',
      page,
      initialPagination.per_page,
    ],
    queryFn: async () => {
      const response = await api.get<{
        data: ActivityPage<BookingActivityItem>
      }>(`/admin/users/${userId}/activity/bookings`, {
        params: { page, per_page: initialPagination.per_page },
      })
      return response.data.data
    },
    enabled: page > 1,
    initialData:
      page === 1
        ? { items: initialItems, pagination: initialPagination }
        : undefined,
  })
  const bookings = query.data?.items

  return (
    <Card className='rounded-2xl border-border bg-card'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base text-foreground'>
          <Calendar className='h-4 w-4 text-primary' />
          Booking Activity ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(byStatus).map(([status, count]) => (
            <span
              key={status}
              className='rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground capitalize'
            >
              {status.replaceAll('_', ' ')}: {count}
            </span>
          ))}
          {total === 0 && (
            <p className='text-sm text-muted-foreground'>No bookings yet.</p>
          )}
        </div>
        {query.isError ? (
          <ActivityLoadError onRetry={() => query.refetch()} />
        ) : query.isFetching ? (
          <p className='text-sm text-muted-foreground' role='status'>
            Loading bookings…
          </p>
        ) : bookings && bookings.length > 0 ? (
          <div className='overflow-x-auto rounded-lg border border-border'>
            <table className='w-full min-w-[520px] text-left text-sm'>
              <thead className='bg-muted/50 text-xs text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2 font-medium'>Booking</th>
                  <th className='px-3 py-2 font-medium'>
                    {role === 'client' ? 'Worker' : 'Client'}
                  </th>
                  <th className='px-3 py-2 font-medium'>Service</th>
                  <th className='px-3 py-2 font-medium'>Schedule</th>
                  <th className='px-3 py-2 font-medium'>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className='border-t border-border'>
                    <td className='px-3 py-2 font-mono text-xs'>
                      {booking.booking_code}
                    </td>
                    <td className='px-3 py-2'>
                      {booking.other_party.name ?? '—'}
                    </td>
                    <td className='px-3 py-2'>
                      {booking.service_category ?? '—'}
                    </td>
                    <td className='px-3 py-2'>
                      {booking.scheduled_at
                        ? format(new Date(booking.scheduled_at), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className='px-3 py-2 capitalize'>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <ActivityPaginationControls
          page={page}
          pagination={query.data?.pagination ?? initialPagination}
          isLoading={query.isFetching}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  )
}

function ReviewActivity({
  userId,
  type,
  title,
  initialPagination,
  reviews,
}: {
  userId: number
  type: 'reviews-received' | 'reviews-given'
  title: string
  initialPagination: ActivityPagination
  reviews: ReviewActivityItem[]
}) {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: [
      'admin',
      'users',
      userId,
      'activity',
      type,
      page,
      initialPagination.per_page,
    ],
    queryFn: async () => {
      const response = await api.get<{
        data: ActivityPage<ApiReviewActivityItem>
      }>(`/admin/users/${userId}/activity/${type}`, {
        params: { page, per_page: initialPagination.per_page },
      })
      return {
        items: response.data.data.items.map((review) => ({
          id: review.id,
          booking_code: review.booking_code,
          counterpart: review.from ?? review.to ?? null,
          score: review.score,
          comment: review.comment,
          created_at: review.created_at,
        })),
        pagination: response.data.data.pagination,
      }
    },
    enabled: page > 1,
    initialData:
      page === 1
        ? { items: reviews, pagination: initialPagination }
        : undefined,
  })
  const pageReviews = query.data?.items

  return (
    <section>
      <h3 className='mb-3 text-sm font-semibold text-foreground'>{title}</h3>
      {query.isError ? (
        <ActivityLoadError onRetry={() => query.refetch()} />
      ) : query.isFetching ? (
        <p className='text-sm text-muted-foreground' role='status'>
          Loading reviews…
        </p>
      ) : pageReviews?.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No reviews in this category.
        </p>
      ) : (
        <div className='flex flex-col gap-3'>
          {pageReviews?.map((review) => (
            <div
              key={review.id}
              className='rounded-lg border border-border p-3'
            >
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <span className='text-sm font-medium text-foreground'>
                  {review.counterpart ?? 'User'}
                </span>
                <span className='inline-flex items-center gap-1 text-xs text-foreground'>
                  <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
                  {review.score}/5
                </span>
              </div>
              {review.comment && (
                <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                  {review.comment}
                </p>
              )}
              <p className='mt-2 text-xs text-muted-foreground'>
                {review.booking_code ? `${review.booking_code} · ` : ''}
                {review.created_at
                  ? format(new Date(review.created_at), 'MMM d, yyyy')
                  : 'Date unavailable'}
              </p>
            </div>
          ))}
        </div>
      )}
      <ActivityPaginationControls
        page={page}
        pagination={query.data?.pagination ?? initialPagination}
        isLoading={query.isFetching}
        onPageChange={setPage}
      />
    </section>
  )
}

function ActivityPaginationControls({
  page,
  pagination,
  isLoading,
  onPageChange,
}: {
  page: number
  pagination: ActivityPagination
  isLoading: boolean
  onPageChange: (page: number) => void
}) {
  if (pagination.total === 0) return null

  const firstItem = (page - 1) * pagination.per_page + 1
  const lastItem = Math.min(page * pagination.per_page, pagination.total)

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3'>
      <p className='text-xs text-muted-foreground' aria-live='polite'>
        {isLoading
          ? `Loading page ${page}…`
          : `Showing ${firstItem}–${lastItem} of ${pagination.total}`}
      </p>
      {pagination.last_page > 1 && (
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>
          <span className='text-xs text-muted-foreground'>
            {page} / {pagination.last_page}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page >= pagination.last_page || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  )
}

function ActivityLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3'>
      <p className='text-sm text-destructive'>
        Failed to load this activity page. Please try again.
      </p>
      <Button type='button' variant='outline' size='sm' onClick={onRetry}>
        <RefreshCw className='h-3.5 w-3.5' />
        Retry
      </Button>
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      <Icon className='h-4 w-4 shrink-0 text-primary' />
      <span>{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <Card className='rounded-2xl border-border bg-card'>
        <CardContent className='flex items-center gap-5 p-5 sm:p-6'>
          <Skeleton className='h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24' />
          <div className='flex flex-1 flex-col gap-3'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-56 max-w-full' />
            <Skeleton className='h-5 w-32 rounded-full' />
          </div>
          <Skeleton className='hidden h-9 w-32 sm:block' />
        </CardContent>
      </Card>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((metric) => (
          <Card key={metric} className='rounded-xl border-border bg-card'>
            <CardContent className='flex flex-col gap-2 p-4'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-6 w-20' />
              <Skeleton className='h-3 w-28' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid items-start gap-5 lg:grid-cols-[200px_minmax(0,1fr)]'>
        <Skeleton className='h-12 w-full rounded-xl lg:h-56' />
        <div className='flex flex-col gap-5'>
          {[0, 1].map((section) => (
            <Card key={section} className='rounded-2xl border-border bg-card'>
              <CardHeader>
                <Skeleton className='h-5 w-36' />
              </CardHeader>
              <CardContent className='grid gap-4 sm:grid-cols-2'>
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-4 w-44' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
