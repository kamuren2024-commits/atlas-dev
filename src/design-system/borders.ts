export const borders = {
  subtle: '1px solid rgba(0,217,255,0.08)',
  standard: '1px solid rgba(45,59,93,0.6)',
  active: '1px solid rgba(0,217,255,0.35)',
  divider: '1px solid rgba(45,59,93,0.35)',
  focusRing: '2px solid rgba(0,217,255,0.5)',
  classes: {
    subtle: 'border border-cyan-500/10',
    standard: 'border border-slate-800/60',
    active: 'border border-cyan-500/35',
    divider: 'border-b border-slate-800/35',
  },
} as const;

export type BorderToken = typeof borders;
