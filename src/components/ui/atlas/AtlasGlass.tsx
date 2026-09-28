import React from 'react';

export type AtlasGlassTier = 'workspace' | 'data' | 'navigation' | 'command' | 'modal';
export type AtlasGlassDensity = 'dense' | 'normal' | 'sparse';

export type AtlasGlassProps = React.ComponentPropsWithoutRef<'div'> & {
  tier?: AtlasGlassTier;
  dense?: AtlasGlassDensity;
};

function tierClass(tier: AtlasGlassTier) {
  switch (tier) {
    case 'navigation': return 'border-slate-700/60 bg-slate-900/50';
    case 'command': return 'border-cyan-500/25 bg-[#0b1625]/80';
    case 'modal': return 'border-violet-500/25 bg-slate-950/85';
    case 'data': return 'border-slate-700/70 bg-slate-950/35';
    case 'workspace':
    default:
      return 'border-slate-800/80 bg-[#0b1220]/70';
  }
}

function densityClass(dense: AtlasGlassDensity) {
  switch (dense) {
    case 'dense': return 'rounded-lg';
    case 'sparse': return 'rounded-2xl';
    case 'normal':
    default:
      return 'rounded-xl';
  }
}

export const AtlasGlassSurface = ({ tier = 'workspace', dense = 'normal', className = '', children, ...rest }: AtlasGlassProps) => (
  <div className={`atlas-glass border backdrop-blur-xl shadow-[0_0_0_1px_rgba(15,23,42,0.7),0_16px_35px_rgba(2,6,23,0.28)] ${tierClass(tier)} ${densityClass(dense)} ${className}`.trim()} {...rest}>
    {children}
  </div>
);

export const AtlasGlassCard = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'data'} dense={props.dense ?? 'normal'} className={`atlas-glass-card ${props.className ?? ''}`} {...props} />
);

export const AtlasGlassPanel = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'data'} dense={props.dense ?? 'normal'} className={`atlas-glass-panel ${props.className ?? ''}`} {...props} />
);

export const AtlasGlassToolbar = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'command'} dense={props.dense ?? 'normal'} className={`atlas-glass-toolbar ${props.className ?? ''}`} {...props} />
);

export const AtlasGlassModal = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'modal'} dense={props.dense ?? 'sparse'} className={`atlas-glass-modal ${props.className ?? ''}`} {...props} />
);

export const AtlasGlassNavigation = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'navigation'} dense={props.dense ?? 'normal'} className={`atlas-glass-navigation ${props.className ?? ''}`} {...props} />
);

export const AtlasGlassCommandPanel = (props: AtlasGlassProps) => (
  <AtlasGlassSurface tier={props.tier ?? 'command'} dense={props.dense ?? 'normal'} className={`atlas-glass-command ${props.className ?? ''}`} {...props} />
);

export default AtlasGlassSurface;
