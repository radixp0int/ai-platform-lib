import { describe, expect, it } from 'vitest'
import { CURRENT_ORG_ID, ORGS, PLANS, initialsOf } from './tenants.fixtures'

describe('tenants fixtures', () => {
  it('has fifteen tenants, and you are in Alderfinch Group', () => {
    expect(ORGS).toHaveLength(15)
    expect(ORGS.find((o) => o.id === CURRENT_ORG_ID)?.name).toBe('Alderfinch Group')
  })

  it('splits the plans six, six and three', () => {
    expect(PLANS.map((plan) => ORGS.filter((o) => o.plan === plan).length)).toEqual([6, 6, 3])
  })

  it('takes two initials from a name', () => {
    expect(initialsOf('Alderfinch Group')).toBe('AG')
    expect(initialsOf('Harbor Lane Logistics')).toBe('HL')
  })
})
