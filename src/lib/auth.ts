export const TOKEN_KEY = 'admin_token'
export const LEGACY_TOKEN_KEY = 'hanapbuhay_admin_token'
export const USER_KEY = 'admin_user'

export function getToken(): string | null {
  const currentToken = localStorage.getItem(TOKEN_KEY)

  if (currentToken) {
    return currentToken
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)

  if (legacyToken) {
    localStorage.setItem(TOKEN_KEY, legacyToken)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    return legacyToken
  }

  return null
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export function getUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function logout(): void {
  clearToken()
  clearUser()
  window.location.href = '/login'
}

/** True when the app is running against a localhost API */
export function isDevMode(): boolean {
  const apiUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  return !apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
}
