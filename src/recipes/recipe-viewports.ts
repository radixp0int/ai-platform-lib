// The two widths the Finals 2.0 boards draw besides the desktop one, as
// Storybook viewports. A recipe's stories pass these in `parameters.viewport`.
export const RECIPE_VIEWPORTS = {
  tablet1024: {
    name: 'Tablet, 1024',
    styles: { width: '1024px', height: '1366px' },
    type: 'tablet',
  },
  portrait834: {
    name: 'Tablet portrait, 834',
    styles: { width: '834px', height: '1194px' },
    type: 'tablet',
  },
} as const
