export const TOKEN_KEY = 'admin_token'
export const USER_KEY = 'admin_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
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
