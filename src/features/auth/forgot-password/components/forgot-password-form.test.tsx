import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const { navigateMock, apiPostMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  apiPostMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigateMock }
})

vi.mock('@/lib/api', () => ({
  api: {
    post: apiPostMock,
  },
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let continueButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    apiPostMock.mockImplementation(
      async (url: string, payload?: Record<string, unknown>) => {
        if (url === '/auth/password/forgot') {
          return { data: { success: true, message: 'Code sent' } }
        }

        if (url === '/auth/password/verify-otp') {
          expect(payload).toMatchObject({
            email: 'user@example.com',
            code: '123456',
          })
          return {
            data: {
              success: true,
              message: 'Code verified',
              data: { reset_token: 'reset-token-123' },
            },
          }
        }

        if (url === '/auth/password/reset') {
          expect(payload).toMatchObject({
            email: 'user@example.com',
            reset_token: 'reset-token-123',
            password: 'NewPassword123!',
            password_confirmation: 'NewPassword123!',
          })
          return {
            data: {
              success: true,
              message: 'Password reset successfully. Please log in.',
            },
          }
        }

        throw new Error(`Unexpected endpoint: ${url}`)
      }
    )

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /^Email$/i })
    continueButton = screen.getByRole('button', { name: /^Continue$/i })
  })

  it('renders email field and continue button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(continueButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.click(continueButton)
    await expect
      .element(screen.getByText(/^Please enter your email\.$/i))
      .toBeInTheDocument()
  })

  it('sends the reset code, verifies it, and resets the password successfully', async () => {
    await userEvent.fill(emailInput, 'user@example.com')
    await userEvent.click(continueButton)

    await vi.waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/password/forgot', {
        email: 'user@example.com',
      })
    })

    await expect
      .element(screen.getByRole('button', { name: /^Verify code$/i }))
      .toBeInTheDocument()

    const otpInput = screen.getByRole('textbox', { name: /One-time password/i })
    await userEvent.fill(otpInput, '123456')
    await userEvent.click(
      screen.getByRole('button', { name: /^Verify code$/i })
    )

    await vi.waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/password/verify-otp', {
        email: 'user@example.com',
        code: '123456',
      })
    })

    await expect
      .element(screen.getByLabelText(/^New password$/i))
      .toBeInTheDocument()

    await userEvent.fill(
      screen.getByLabelText(/^New password$/i),
      'NewPassword123!'
    )
    await userEvent.fill(
      screen.getByLabelText(/^Confirm password$/i),
      'NewPassword123!'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /^Reset password$/i })
    )

    await vi.waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/password/reset', {
        email: 'user@example.com',
        reset_token: 'reset-token-123',
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      })
    })

    await vi.waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/login' })
    })
  })
})
