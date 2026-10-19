// Branding and copy in one place — rename the assistant without hunting
// through components.
import type { Branding } from '../engine/branding'

export const APP_NAME = 'Acme'
export const MODEL_NAME = 'Acme AI'
export const DISCLAIMER = 'Acme can make mistakes. Verify important financial details.'

/** Branding passed into the (brand-agnostic) library via BrandingProvider. */
export const acmeBranding: Branding = {
  appName: APP_NAME,
  modelName: MODEL_NAME,
  disclaimer: DISCLAIMER,
}

/**
 * The signed-in viewer. Fictional, but held in one place because two surfaces
 * render it now — the sidebar's account button and the user-settings dialog it
 * opens — and they must not drift apart.
 */
export const DEMO_USER = {
  name: 'John Ozzo',
  /** Drawn in the avatar; a real app derives or uploads this. */
  initials: 'JO',
  email: 'john.ozzo@alderfinch.example',
  plan: 'Performance plan',
}
