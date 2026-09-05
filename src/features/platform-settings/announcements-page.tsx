import { useState } from 'react'
import { ArrowLeft, Megaphone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from './hooks/use-settings'
import { useAnnouncementAction } from './hooks/use-announcement-action'

export function AnnouncementsPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const { isSubmitting, post } = useAnnouncementAction()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const active = data?.active_announcement ?? null

  function handlePost() {
    post(
      { title: title.trim(), body: body.trim(), expires_at: expiresAt || null },
      () => {
        setDialogOpen(false)
        setTitle('')
        setBody('')
        setExpiresAt('')
        refetch()
      }
    )
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
        <Link
          to='/platform-settings'
          className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft size={14} />
          Platform Settings
        </Link>

        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Announcements
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Post a platform-wide announcement shown to users in the
              notification center.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className='shrink-0 bg-green-600 hover:bg-green-700 text-white'
          >
            <Megaphone size={16} className='mr-1.5' />
            Post Announcement
          </Button>
        </div>

        {isLoading && <Skeleton className='h-32 rounded-xl' />}

        {!isLoading && error && (
          <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
            <Button
              variant='link'
              size='sm'
              className='ml-2 h-auto p-0 text-destructive underline'
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {active ? (
              <Card
                className='rounded-2xl border-border bg-card'
                style={{ boxShadow: '0 2px 12px rgba(52,168,53,0.08)' }}
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base text-foreground'>
                    Active Announcement
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-1'>
                  <p className='font-medium text-foreground'>{active.title}</p>
                  <p className='text-sm text-muted-foreground'>{active.body}</p>
                  {active.expires_at && (
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Expires:{' '}
                      {format(new Date(active.expires_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-14 text-center'>
                <Megaphone className='h-7 w-7 text-muted-foreground' />
                <p className='text-sm font-medium text-foreground'>
                  No active announcement
                </p>
                <p className='text-xs text-muted-foreground'>
                  Post one to display it to all users.
                </p>
              </div>
            )}
          </>
        )}
      </Main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='ann-title'>Title</Label>
              <Input
                id='ann-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. Platform maintenance on Sept 30.'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='ann-body'>Body</Label>
              <Textarea
                id='ann-body'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='Announcement details…'
                className='min-h-[80px]'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='ann-expires'>Expires at (optional)</Label>
              <Input
                id='ann-expires'
                type='date'
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className='bg-primary text-white hover:bg-primary/90'
            >
              {isSubmitting ? 'Posting…' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
