import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function TwoFactorSection() {
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadPreference() {
      try {
        const res = await api.get<{
          success: boolean
          data: { enabled: boolean }
        }>('/user/two-factor')

        if (isMounted) {
          setEnabled(Boolean(res.data.data.enabled))
        }
      } catch {
        if (isMounted) {
          toast.error(
            'Unable to load your two-factor authentication preference.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPreference()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleToggle(checked: boolean) {
    const previousValue = enabled
    setEnabled(checked)
    setIsUpdating(true)

    try {
      const res = await api.post<{
        success: boolean
        data: { enabled: boolean }
      }>('/user/two-factor', { enabled: checked })

      setEnabled(Boolean(res.data.data.enabled))
      toast.success(
        checked
          ? 'Two-factor authentication enabled.'
          : 'Two-factor authentication disabled.'
      )
    } catch (error) {
      setEnabled(previousValue)

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update your two-factor authentication preference.'

      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='flex items-center gap-3'>
      <Switch
        id='2fa-toggle'
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isLoading || isUpdating}
      />
      <Label htmlFor='2fa-toggle' className='cursor-pointer'>
        Two-Factor Authentication:{' '}
        <span className={enabled ? 'text-primary' : 'text-muted-foreground'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </Label>
    </div>
  )
}
