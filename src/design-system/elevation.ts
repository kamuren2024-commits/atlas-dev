export const elevation = {
  zIndex: {
    base: 0,
    elevated: 10,
    floating: 20,
    overlayBackdrop: 40,
    toast: 60,
    shell: 40,
    loading: 80,
    debugTop: 9999,
  },
  shadows: {
    flat: 'none',
    elevated: '0 4px 20px rgba(0,0,0,0.15)',
    floating: '0 8px 32px rgba(0,0,0,0.25)',
    toast: '0 12px 40px rgba(0,0,0,0.35)',
    shell: '0 1px 0 rgba(45,59,93,0.6)',
    cyanGlowSubtle: '0 0 20px rgba(0,217,255,0.08)',
    cyanGlowActive: '0 0 30px rgba(0,217,255,0.15)',
    cyanGlowStrong: '0 0 40px rgba(0,217,255,0.22)',
    violetGlowSubtle: '0 0 20px rgba(139,92,246,0.10)',
    violetGlowActive: '0 0 30px rgba(139,92,246,0.16)',
  },
  classes: {
    elevated: 'shadow-[0_4px_20px_rgba(0,0,0,0.15)]',
    floating: 'shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
    glowSubtle: 'shadow-[0_0_20px_rgba(0,217,255,0.08)]',
    glowActive: 'shadow-[0_0_30px_rgba(0,217,255,0.15)]',
    glowViolet: 'shadow-[0_0_24px_rgba(139,92,246,0.12)]',
  },
} as const;

export type ElevationToken = typeof elevation;
