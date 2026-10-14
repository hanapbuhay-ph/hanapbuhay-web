import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserInput } from '../hooks/use-user-crud'
import type { User } from '../types'

interface UserCrudDialogProps {
  open: boolean
  user: User | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UserInput) => Promise<void>
}

interface Barangay {
  id: number
  name: string
}

const emptyForm: UserInput = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  mobile_number: '',
  role: 'client',
  barangay_id: undefined,
  is_active: true,
}

export function UserCrudDialog({
  open,
  user,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: UserCrudDialogProps) {
  const [form, setForm] = useState<UserInput>(emptyForm)
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [barangaysLoading, setBarangaysLoading] = useState(false)
  const [barangayError, setBarangayError] = useState<string | null>(null)
  const isEdit = user !== null
  const canAssignAdminRole =
    !isEdit || user.role === 'admin' || user.role === 'super_admin'

  useEffect(() => {
    if (!open || barangays.length > 0) return

    setBarangaysLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    api
      .get('/barangays')
      .then((response) => setBarangays(response.data.data ?? []))
      .catch(() => setBarangayError('Unable to load barangays.'))
      .finally(() => setBarangaysLoading(false))
  }, [open, barangays.length])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      user
        ? {
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number ?? '',
            role: user.role,
            barangay_id: user.barangay_id,
            is_active: user.is_active,
            password: '',
            password_confirmation: '',
          }
        : emptyForm
    )
  }, [user, open])

  function updateField<K extends keyof UserInput>(
    field: K,
    value: UserInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { ...form }
    if (!input.password) {
      delete input.password
      delete input.password_confirmation
    }
    await onSubmit(input)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit user' : 'Add user'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='user-name'>Full name</Label>
            <Input
              id='user-name'
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='user-email'>Email</Label>
            <Input
              id='user-email'
              type='email'
              required
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
          <div className='grid gap-2 sm:grid-cols-2 sm:gap-3'>
            <div className='grid gap-2'>
              <Label htmlFor='user-mobile'>Mobile number</Label>
              <Input
                id='user-mobile'
                type='tel'
                inputMode='tel'
                placeholder='0917 123 4567'
                pattern='(09[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{4}|[+]63[ -]?9[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{4})'
                title='Enter a Philippine mobile number, e.g. 0917 123 4567.'
                required={!isEdit}
                value={form.mobile_number ?? ''}
                onChange={(event) =>
                  updateField('mobile_number', event.target.value)
                }
              />
              <p className='text-xs text-muted-foreground'>
                Enter an 11-digit Philippine mobile number starting with 09.
              </p>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='user-role'>Role</Label>
              <select
                id='user-role'
                className='h-10 rounded-md border border-input bg-background px-3 text-sm'
                value={form.role}
                onChange={(event) =>
                  updateField('role', event.target.value as User['role'])
                }
              >
                <option value='client'>Client</option>
                <option value='worker'>Worker</option>
                <option value='admin' disabled={!canAssignAdminRole}>
                  Admin
                </option>
              </select>
              {isEdit && !canAssignAdminRole && (
                <p className='text-xs text-muted-foreground'>
                  Client and worker accounts cannot be changed to Admin.
                </p>
              )}
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='user-barangay'>Barangay</Label>
            <Select
              value={form.barangay_id ? String(form.barangay_id) : undefined}
              onValueChange={(value) =>
                updateField('barangay_id', Number(value))
              }
              disabled={barangaysLoading || !!barangayError}
            >
              <SelectTrigger id='user-barangay' className='w-full'>
                <SelectValue
                  placeholder={
                    barangaysLoading
                      ? 'Loading barangays...'
                      : 'Select a barangay'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay.id} value={String(barangay.id)}>
                    {barangay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {barangayError && (
              <p className='text-sm text-destructive'>{barangayError}</p>
            )}
          </div>
          <div className='grid gap-2 sm:grid-cols-2 sm:gap-3'>
            <div className='grid gap-2'>
              <Label htmlFor='user-password'>
                {isEdit ? 'New password (optional)' : 'Password'}
              </Label>
              <Input
                id='user-password'
                type='password'
                required={!isEdit}
                minLength={8}
                value={form.password ?? ''}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='user-password-confirmation'>
                Confirm password
              </Label>
              <Input
                id='user-password-confirmation'
                type='password'
                required={!isEdit || !!form.password}
                value={form.password_confirmation ?? ''}
                onChange={(event) =>
                  updateField('password_confirmation', event.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting ||
                barangaysLoading ||
                !!barangayError ||
                !form.barangay_id
              }
            >
              {isSubmitting ? 'Saving...' : 'Save user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
