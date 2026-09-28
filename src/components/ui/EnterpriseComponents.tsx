import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Activity, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { colors, radius, typography, spacing, shadows, motionTokens } from '../../design-system/tokens';

// Helper to construct transition options consuming the motion tokens
const getTransition = (speed: 'fast' | 'normal' | 'slow') => {
  return motionTokens.transition[speed];
};

// 1. EnterpriseCard: Sleek glassmorphism background and sharp slate/cyan borders consuming tokens
interface EnterpriseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowOnHover?: boolean;
  highlightSide?: 'left' | 'right' | 'top' | 'none';
  className?: string;
}

export function EnterpriseCard({
  children,
  glowOnHover = true,
  highlightSide = 'none',
  className = '',
  ...props
}: EnterpriseCardProps) {
  let borderHighlightClass = '';
  if (highlightSide === 'left') borderHighlightClass = 'border-l-2 border-l-[#00D9FF]';
  if (highlightSide === 'right') borderHighlightClass = 'border-r-2 border-r-[#00D9FF]';
  if (highlightSide === 'top') borderHighlightClass = 'border-t-2 border-t-[#00D9FF]';

  return (
    <motion.div
      whileHover={glowOnHover ? { y: -2, transition: getTransition('fast') } : undefined}
      className={`bg-[#101827]/75 backdrop-blur-md ${radius.md} border ${colors.border.subtle} p-4 relative overflow-hidden transition-all duration-200 ${
        glowOnHover ? `hover:border-cyan-500/20 ${shadows.glowing}` : ''
      } ${borderHighlightClass} ${className}`}
      {...props}
    >
      {/* Decorative hairline corner highlight inside card - 2026 tactical aesthetics */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#00D9FF]/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#00D9FF]/20 pointer-events-none" />
      {children}
    </motion.div>
  );
}

// 2. MetricPanel: High density Bloomberg-style metric readout panel consuming design system tokens
interface MetricPanelProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  infoText?: string;
}

export function MetricPanel({
  label,
  value,
  unit = '',
  trend,
  trendDirection = 'neutral',
  infoText = ''
}: MetricPanelProps) {
  const trendColor = 
    trendDirection === 'up' ? 'text-emerald-400' : 
    trendDirection === 'down' ? 'text-rose-400' : 'text-slate-400';

  return (
    <EnterpriseCard glowOnHover={true} className="flex flex-col justify-between h-full bg-[#101827]/90 min-w-[140px]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[#94A3B8]">{label}</span>
        {trend && (
          <span className={`text-[10.5px] font-mono font-black flex items-center gap-0.5 ${trendColor}`}>
            {trendDirection === 'up' && '▲'}
            {trendDirection === 'down' && '▼'}
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-display font-medium text-white tracking-tight leading-none">{value}</span>
        {unit && <span className="text-[10px] font-mono text-[#00D9FF] font-black">{unit}</span>}
      </div>

      {infoText ? (
        <span className="text-[9px] font-mono text-slate-500 truncate block mt-2 pt-1 border-t border-slate-900/40">
          // {infoText}
        </span>
      ) : (
        <div className="h-2" />
      )}
    </EnterpriseCard>
  );
}

// 3. StatusIndicator: Clean glowing state pins
interface StatusIndicatorProps {
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'active';
  label: string;
  subText?: string;
}

export function StatusIndicator({ status, label, subText }: StatusIndicatorProps) {
  let lightColor = 'bg-emerald-400';
  let lightGlow = 'rgba(16, 185, 129, 0.4)';
  let borderColor = 'border-emerald-500/20';

  if (status === 'warning') {
    lightColor = 'bg-amber-400';
    lightGlow = 'rgba(245, 158, 11, 0.4)';
    borderColor = 'border-amber-500/20';
  } else if (status === 'critical') {
    lightColor = 'bg-[#00D9FF]'; // Cyan highlight replaces critical hazard alerts
    lightGlow = 'rgba(0, 217, 255, 0.7)';
    borderColor = 'border-cyan-500/30';
  } else if (status === 'offline') {
    lightColor = 'bg-slate-500';
    lightGlow = 'rgba(148, 163, 184, 0.2)';
    borderColor = 'border-slate-800';
  } else if (status === 'active') {
    lightColor = 'bg-cyan-400';
    lightGlow = 'rgba(0, 217, 255, 0.5)';
    borderColor = 'border-cyan-500/25';
  }

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 ${radius.sm} border bg-[#05070D] ${borderColor} text-left`}>
      <span className="relative flex h-2 w-2">
        {status !== 'offline' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: lightGlow }} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${lightColor}`} />
      </span>
      <div className="leading-tight">
        <span className="text-[10px] font-mono font-bold text-slate-200 block">{label}</span>
        {subText && <span className="text-[8px] font-mono text-slate-500 block">{subText}</span>}
      </div>
    </div>
  );
}

// 4. TenantBadge: Dynamic luxury badge
interface TenantBadgeProps {
  tenantName: string;
  environmentName?: string;
}

export function TenantBadge({ tenantName, environmentName = 'ENTERPRISE TENANT' }: TenantBadgeProps) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 ${radius.sm} border ${colors.border.subtle} bg-cyan-950/20`}>
      <div className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D9FF]" />
      </div>
      <div className="leading-none text-left">
        <span className="text-[10px] font-mono font-black tracking-widest text-[#00D9FF] block uppercase">{tenantName} MODE</span>
        <span className="text-[7px] font-mono text-slate-400 block tracking-widest mt-0.5">{environmentName}</span>
      </div>
    </div>
  );
}

// 5. PermissionBadge: Labeled security token
interface PermissionBadgeProps {
  permission: string;
  granted?: boolean;
}

export function PermissionBadge({ permission, granted = true }: PermissionBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold border transition-colors ${
      granted 
        ? 'border-emerald-500/25 text-emerald-400 bg-emerald-950/15' 
        : 'border-slate-800 text-slate-500 bg-slate-900/30'
    }`}>
      {granted ? <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> : <AlertCircle className="w-2.5 h-2.5 text-slate-500" />}
      <span>{permission.toUpperCase()}</span>
    </div>
  );
}

// 6. CommandButton: Dynamic hover micro scale with consistent tokens
interface CommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function CommandButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: CommandButtonProps) {
  let baseColorStyles = 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white';
  if (variant === 'primary') {
    baseColorStyles = 'bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border-cyan-500/30 text-[#00D9FF] font-bold';
  } else if (variant === 'danger') {
    baseColorStyles = 'bg-rose-950/15 hover:bg-rose-950/40 border-rose-500/25 text-rose-400 font-bold';
  }

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={`px-3 py-1.5 ${radius.sm} border text-[10px] font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${baseColorStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// 7. IntelligenceSignal: Flashing live wire feeds
export function IntelligenceSignal({ message }: { message: string }) {
  return (
    <div className={`flex items-start gap-2.5 py-2 px-3 bg-[#05070D]/65 border ${colors.border.subtle} ${radius.md} hover:border-cyan-500/20 transition-all duration-200`}>
      <div className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] mt-1 shrink-0 animate-pulse shadow-[0_0_8px_rgba(0,217,255,0.7)]" />
      <div className="leading-tight">
        <span className="text-[10px] font-mono text-slate-300 block">{message}</span>
        <span className="text-[7.5px] font-mono text-slate-500 block leading-none mt-1">TELEMETRY RECEIVED // ALPHA CORE ACTIVE</span>
      </div>
    </div>
  );
}

// 8. DataPanel: Compact matrix details list
interface DataPanelProps {
  title: string;
  data: { [key: string]: string | number | boolean };
}

export function DataPanel({ title, data }: DataPanelProps) {
  return (
    <div className={`border ${colors.border.subtle} ${radius.md} overflow-hidden bg-[#101827]/40 ${shadows.subtle}`}>
      <div className="bg-[#101827] px-3 py-2 border-b border-slate-805/40 flex items-center justify-between">
        <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#00D9FF] flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> 
          {title.toUpperCase()}
        </span>
        <span className="text-[7.5px] font-mono font-semibold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">AUTHENTICATED</span>
      </div>
      <div className="divide-y divide-slate-900/60">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex justify-between items-center p-2 px-3 text-[10.5px]">
            <span className="font-mono text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-mono font-bold text-slate-100">
              {typeof val === 'boolean' ? (val ? '✓ Yes' : '✗ No') : val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
