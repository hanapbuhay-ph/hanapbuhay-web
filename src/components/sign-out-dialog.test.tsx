import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignOutDialog } from './sign-out-dialog'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  api: { post: mocks.post },
}))

vi.mock('@/lib/auth', () => ({ logout: mocks.logout }))

describe('SignOutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.post.mockResolvedValue(undefined)
  })

  it('calls the logout endpoint and clears the local session', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Sign out$/i }))

    await vi.waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/auth/logout')
      expect(mocks.logout).toHaveBeenCalledOnce()
    })
  })

  it('still clears the local session when the logout request fails', async () => {
    mocks.post.mockRejectedValue(new Error('network'))

    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Sign out$/i }))

    await vi.waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledOnce()
    })
  })

  it('does not log out when Cancel is clicked', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cancel$/i }))

    expect(mocks.post).not.toHaveBeenCalled()
    expect(mocks.logout).not.toHaveBeenCalled()
  })
})
