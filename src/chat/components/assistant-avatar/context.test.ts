import { describe, expect, it } from 'vitest'
import { assistantAvatarFor } from './context'

describe('assistantAvatarFor', () => {
  it('gives super admins the marble bust', () => {
    expect(assistantAvatarFor({ superAdmin: true })).toBe('marble-bust')
  })

  it('gives everyone else the Orb', () => {
    expect(assistantAvatarFor({ superAdmin: false })).toBe('orb')
    expect(assistantAvatarFor({})).toBe('orb')
  })
})
