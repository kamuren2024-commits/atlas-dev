export const breakpoints = {
  values: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  labels: {
    mobile: 'mobile',
    tablet: 'tablet',
    laptop: 'laptop',
    desktop: 'desktop',
    wide: 'wide',
  },
  queries: {
    smUp: '(min-width: 640px)',
    mdUp: '(min-width: 768px)',
    lgUp: '(min-width: 1024px)',
    xlUp: '(min-width: 1280px)',
    xl2Up: '(min-width: 1536px)',
    smDown: '(max-width: 639px)',
    mdDown: '(max-width: 767px)',
    lgDown: '(max-width: 1023px)',
    xlDown: '(max-width: 1279px)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    dark: '(prefers-color-scheme: dark)',
  },
} as const;

export type BreakpointToken = typeof breakpoints;
