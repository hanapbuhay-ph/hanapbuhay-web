/**
 * Two-Factor Authentication toggle.
 *
 * NOTE: 2FA toggle is a placeholder. Real implementation requires a backend
 * TOTP/SMS verification flow — out of scope until the backend is ready.
 */

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function TwoFactorSection() {
  const [enabled, setEnabled] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  function handleToggle(checked: boolean) {
    if (checked) {
      // Opening the switch triggers the preview dialog instead of enabling 2FA
      setPreviewOpen(true)
    } else {
      setEnabled(false)
    }
  }

  function handleDialogClose() {
    // Keep the toggle off — this is UI preview only
    setEnabled(false)
    setPreviewOpen(false)
  }

  return (
    <>
      <div className='flex items-center gap-3'>
        <Switch
          id='2fa-toggle'
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor='2fa-toggle' className='cursor-pointer'>
          Two-Factor Authentication:{' '}
          <span className={enabled ? 'text-primary' : 'text-muted-foreground'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </Label>
      </div>

      {/* 2FA Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={handleDialogClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Two-factor authentication setup will be available once backend
              support is ready. This is a preview of the upcoming security
              feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
