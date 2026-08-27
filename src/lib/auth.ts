export const TOKEN_KEY = 'hanapbuhay_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Call on logout — clears the token then redirects the browser to /login.
 * Import `router` from main.tsx if you need programmatic navigation instead.
 */
export function logout(): void {
  clearToken()
  // Hard redirect so TanStack Router re-evaluates beforeLoad cleanly
  window.location.href = '/login'
}

/** True when the app is running against a localhost mock API */
export function isDevMode(): boolean {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined
  return !apiUrl || apiUrl.includes('localhost')
}
