/**
 * Login Activity page.
 *
 * NOTE: When the real API is ready, the "Log Out" action triggers actual
 * token revocation for that session via /api/admin/sessions/:id/revoke.
 */

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, MonitorSmartphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/confirm-dialog'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginSession {
  id: number
  device: string
  location: string
  ip_address: string
  logged_in_at: string
  is_current_session: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AccountLoginActivity() {
  const queryClient = useQueryClient()
  const [sessionToRevoke, setSessionToRevoke] = useState<LoginSession | null>(
    null
  )
  const [isRevoking, setIsRevoking] = useState(false)

  // ── Fetch sessions ─────────────────────────────────────────────────────────
  const { data: sessions = [], isLoading } = useQuery<LoginSession[]>({
    queryKey: ['login_activity'],
    queryFn: async () => {
      const res = await api.get<LoginSession[]>('/login_activity')
      return res.data
    },
  })

  // ── Revoke session ─────────────────────────────────────────────────────────
  async function handleRevokeConfirm() {
    if (!sessionToRevoke) return
    setIsRevoking(true)
    try {
      // Mock only — remove from local list state after toast.
      // Real implementation: PATCH /login_activity/:id → triggers token revocation.
      await api.patch(`/login_activity/${sessionToRevoke.id}`, {
        revoked: true,
      })
      queryClient.setQueryData<LoginSession[]>(['login_activity'], (prev) =>
        (prev ?? []).filter((s) => s.id !== sessionToRevoke.id)
      )
      toast.success('Session ended.')
    } finally {
      setIsRevoking(false)
      setSessionToRevoke(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>Login Activity</h3>
        <p className='text-sm text-muted-foreground'>
          Review devices and locations where your account is active.
        </p>
      </div>
      <Separator className='my-4 flex-none' />

      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        {isLoading ? (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm'>Loading sessions…</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-12 text-muted-foreground'>
            <MonitorSmartphone className='h-8 w-8 opacity-40' />
            <p className='text-sm'>No active sessions found.</p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Logged In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className='font-medium'>
                      {session.device}
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell className='font-mono text-xs'>
                      {session.ip_address}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatDistanceToNow(new Date(session.logged_in_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {session.is_current_session ? (
                        <Badge className='bg-primary/10 text-primary hover:bg-primary/10 border-0'>
                          Current Session
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-xs'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {!session.is_current_session && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setSessionToRevoke(session)}
                        >
                          Log Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirmation dialog for revoking a session */}
      <ConfirmDialog
        open={!!sessionToRevoke}
        onOpenChange={(open) => {
          if (!open) setSessionToRevoke(null)
        }}
        title='End this session?'
        desc='This will end this session. The device will need to log in again.'
        confirmText='Log Out'
        destructive
        isLoading={isRevoking}
        handleConfirm={handleRevokeConfirm}
      />
    </div>
  )
}
