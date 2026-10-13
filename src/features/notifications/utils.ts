const internalAdminDestination =
  /^\/(?:users|job-posts|verifications|reports)\/\d+$|^\/audit-logs$/

export function openAdminNotificationDestination(
  url: string | undefined
): boolean {
  if (!url || !internalAdminDestination.test(url)) return false

  window.location.assign(url)
  return true
}
