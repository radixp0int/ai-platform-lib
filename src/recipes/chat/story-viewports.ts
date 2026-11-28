/**
 * The two tablet sizes the Finals 2.0 boards are drawn at, for the recipes'
 * Tablet (1024, light) and Portrait (834, dark) stories.
 */
export const RECIPE_VIEWPORTS = {
  viewport: {
    options: {
      tablet1024: {
        name: 'Tablet 1024',
        styles: { width: '1024px', height: '768px' },
        type: 'tablet',
      },
      portrait834: {
        name: 'Tablet 834',
        styles: { width: '834px', height: '1112px' },
        type: 'tablet',
      },
    },
  },
} as const

export const TABLET = { viewport: { value: 'tablet1024', isRotated: false } } as const
export const PORTRAIT = {
  viewport: { value: 'portrait834', isRotated: false },
  mode: 'dark',
} as const
