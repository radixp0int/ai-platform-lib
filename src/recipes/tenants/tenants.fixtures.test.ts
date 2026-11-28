import { describe, expect, it } from 'vitest'
import { ORGS, initialsOf, toneOf } from './tenants.fixtures'

describe('tenants fixtures', () => {
  it('gives pending rows the warning edge, suspended the error edge, active none', () => {
    const tones = Object.fromEntries(ORGS.map((o) => [o.status, toneOf(o)]))
    expect(tones).toEqual({ active: undefined, pending: 'warning', suspended: 'error' })
  })

  it('takes two initials from a name', () => {
    expect(initialsOf('Bayshore Foods')).toBe('BF')
    expect(initialsOf('Harbor Lane Logistics')).toBe('HL')
  })
})
