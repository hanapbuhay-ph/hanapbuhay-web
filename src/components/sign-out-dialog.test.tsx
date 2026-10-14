import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignOutDialog } from './sign-out-dialog'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/lib/api', () => ({ api: { post: mocks.post } }))
vi.mock('@/lib/auth', () => ({ logout: mocks.logout }))

describe('SignOutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.post.mockResolvedValue(undefined)
  })

  it('calls the logout API and clears local auth state', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Sign out$/i }))

    await vi.waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce())
    expect(mocks.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('does not request logout when Cancel is clicked', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cancel$/i }))

    expect(mocks.post).not.toHaveBeenCalled()
    expect(mocks.logout).not.toHaveBeenCalled()
  })
})
