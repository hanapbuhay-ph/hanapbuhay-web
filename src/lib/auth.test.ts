import { beforeEach, describe, expect, it } from 'vitest'

import { TOKEN_KEY, clearToken, getToken } from './auth'

const LEGACY_TOKEN_KEY = 'hanapbuhay_admin_token'

describe('auth token storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('falls back to the legacy token key and migrates it to the canonical key', () => {
    localStorage.setItem(LEGACY_TOKEN_KEY, 'legacy-token')

    expect(getToken()).toBe('legacy-token')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('legacy-token')
    expect(localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull()
  })

  it('removes both the canonical and legacy token keys when clearing the token', () => {
    localStorage.setItem(TOKEN_KEY, 'current-token')
    localStorage.setItem(LEGACY_TOKEN_KEY, 'legacy-token')

    clearToken()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull()
  })
})
