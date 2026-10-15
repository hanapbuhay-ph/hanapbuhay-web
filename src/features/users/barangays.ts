export interface BarangayOption {
  id: number
  name: string
}

export function deduplicateBarangays(
  barangays: BarangayOption[],
  preferredId?: number
): BarangayOption[] {
  const unique = new Map<string, BarangayOption>()

  for (const barangay of barangays) {
    const name = barangay.name.trim()
    if (!name) continue

    const key = name.toLocaleLowerCase()
    const existing = unique.get(key)
    if (
      !existing ||
      barangay.id === preferredId ||
      (existing.id !== preferredId && barangay.id < existing.id)
    ) {
      unique.set(key, { ...barangay, name })
    }
  }

  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
}
