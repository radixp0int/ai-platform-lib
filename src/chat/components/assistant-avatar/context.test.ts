import { describe, expect, it } from 'vitest'
import { assistantAvatarFor } from './context'

describe('assistantAvatarFor', () => {
  it('humanized is the marble bust', () => {
    expect(assistantAvatarFor({ humanized: true })).toBe('marble-bust')
  })

  it('otherwise it is the Orb', () => {
    expect(assistantAvatarFor({ humanized: false })).toBe('orb')
    expect(assistantAvatarFor({})).toBe('orb')
  })
})
