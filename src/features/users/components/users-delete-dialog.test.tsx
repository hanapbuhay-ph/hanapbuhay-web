import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import type { User } from '../types'
import { UsersDeleteDialog } from './users-delete-dialog'

const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'worker',
  barangay: 'Barangay 1',
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('UsersDeleteDialog', () => {
  it('renders the dialog with the correct title and action summary', async () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    const { getByText, getByRole } = await render(
      <UsersDeleteDialog
        open
        onOpenChange={onOpenChange}
        user={MOCK_USER}
        onConfirm={onConfirm}
      />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Delete User/i,
    })
    const desc = getByText(/Are you sure you want to delete John Doe/i)
    const cancelButton = getByRole('button', { name: /Cancel/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(cancelButton).toBeInTheDocument()
    await expect.element(deleteButton).toBeInTheDocument()
    await expect.element(deleteButton).toBeEnabled()
  })

  it('calls the confirm handler when the delete button is clicked', async () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    const { getByRole } = await render(
      <UsersDeleteDialog
        open
        onOpenChange={onOpenChange}
        user={MOCK_USER}
        onConfirm={onConfirm}
      />
    )

    const deleteButton = getByRole('button', { name: /Delete/i })
    await userEvent.click(deleteButton)

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disables the confirm action while the request is in progress', async () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    const { getByRole } = await render(
      <UsersDeleteDialog
        open
        onOpenChange={onOpenChange}
        user={MOCK_USER}
        onConfirm={onConfirm}
        isSubmitting
      />
    )

    const deleteButton = getByRole('button', { name: /Deleting/i })
    await expect.element(deleteButton).toBeDisabled()
  })
})
