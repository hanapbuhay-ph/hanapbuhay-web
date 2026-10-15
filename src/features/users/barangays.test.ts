import { describe, expect, it } from 'vitest'
import { deduplicateBarangays } from './barangays'

describe('deduplicateBarangays', () => {
  const barangays = [
    { id: 24, name: 'Poblacion' },
    { id: 2, name: 'Banlasan' },
    { id: 4, name: ' poblacion ' },
    { id: 8, name: 'Catoogan' },
  ]

  it('keeps one option per normalized name and sorts by name', () => {
    expect(deduplicateBarangays(barangays)).toEqual([
      { id: 2, name: 'Banlasan' },
      { id: 8, name: 'Catoogan' },
      { id: 4, name: 'poblacion' },
    ])
  })

  it('preserves a preferred duplicate id for an existing user', () => {
    expect(deduplicateBarangays(barangays, 24)).toContainEqual({
      id: 24,
      name: 'Poblacion',
    })
    expect(deduplicateBarangays(barangays, 24)).toHaveLength(3)
  })
})
