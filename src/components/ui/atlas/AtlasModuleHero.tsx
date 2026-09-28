import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Home, Zap, Activity, ArrowRight } from 'lucide-react';
import AtlasButton from './AtlasButton';
import AtlasStatusBadge from './AtlasStatusBadge';
import type { AtlasStatus } from './AtlasStatusBadge';

export interface AtlasModuleHeroProps {
  breadcrumb?: { label: string; icon?: LucideIcon; onClick?: () => void }[];
  moduleLabel: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  icon?: LucideIcon | React.ReactNode;
  live?: boolean;
  status?: AtlasStatus | string;
  primaryAction?: { label: string; onClick?: () => void; icon?: LucideIcon };
  secondaryAction?: { label: string; onClick?: () => void; icon?: LucideIcon };
  kpis?: Array<{ label: string; value: string | number; unit?: string; delta?: string }>;
  className?: string;
  topologyVariant?: 'grid' | 'network' | 'waves' | 'none';
}

export function AtlasModuleHero({
  breadcrumb,
  moduleLabel,
  title,
  subtitle,
  tagline,
  icon,
  live = true,
  status,
  primaryAction,
  secondaryAction,
  kpis,
  className = '',
  topologyVariant = 'grid',
}: AtlasModuleHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`atlas-hero-bg relative border-b border-slate-800/60 overflow-hidden ${className}`}
    >
      {/* Topology overlay variant */}
      {topologyVariant === 'network' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="650" cy="60" r="120" fill="url(#netGlow)" />
          {[
            [100, 180], [180, 100], [260, 220], [380, 130],
            [460, 210], [560, 90], [640, 200], [720, 130], [200, 50],
          ].map(([cx, cy], i, arr) =>
            arr.slice(i + 1, i + 3).map(([x2, y2], j) => {
              const dist = Math.hypot(cx - x2, cy - y2);
              if (dist > 180) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(0,217,255,0.22)"
                  strokeWidth="1"
                />
              );
            })
          )}
          {[
            [100, 180], [180, 100], [260, 220], [380, 130],
            [460, 210], [560, 90], [640, 200], [720, 130], [200, 50],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 4 === 0 ? 4 : 2.5}
              fill={i % 3 === 0 ? '#00D9FF' : 'rgba(139,92,246,0.6)'}
              opacity="0.8"
            />
          ))}
        </svg>
      )}

      {topologyVariant === 'waves' && (
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-40 pointer-events-none opacity-50"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="w1" x1="0" x2="1">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
              <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="w2" x1="0" x2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,100 C200,60 400,140 600,100 C800,60 1000,130 1200,100 L1200,160 L0,160 Z" fill="url(#w1)" />
          <path d="M0,120 C200,90 400,150 600,118 C800,86 1000,140 1200,118 L1200,160 L0,160 Z" fill="url(#w2)" />
        </svg>
      )}

      {/* Breadcrumb */}
      <div className="relative px-6 sm:px-8 pt-5 sm:pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono text-slate-500">
            {(breadcrumb || [{ label: 'ATLAS', icon: Home }]).map((item, i, arr) => (
              <li key={i} className="flex items-center gap-1.5">
                {item.icon && <item.icon className="w-3 h-3 text-slate-600" />}
                <span
                  className={`tracking-wider uppercase font-bold ${
                    i === arr.length - 1 ? 'text-cyan-400' : ''
                  }`}
                >
                  {item.label}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="relative px-6 sm:px-8 pb-7 sm:pb-8 pt-5 sm:pt-6">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-atlas-label text-cyan-400 tracking-[0.2em]">
              <Zap className="w-3.5 h-3.5" />
              {moduleLabel}
            </span>
            {live && !status && (
              <AtlasStatusBadge status="ACTIVE" label="LIVE · CONNECTED" pulse size="md" />
            )}
            {status && (
              <AtlasStatusBadge status={status as any} pulse={live} size="md" />
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {icon && (
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/80 via-atlas-bg-panel to-violet-950/30 flex items-center justify-center text-cyan-400 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
                {typeof icon === 'function'
                  ? React.createElement(icon as any, { className: 'w-8 h-8 sm:w-10 sm:h-10' })
                  : icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-atlas-display-sm sm:text-atlas-display-md text-slate-100 tracking-tight mb-2 leading-[1.05]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-normal">
                  {subtitle}
                </p>
              )}
              {tagline && (
                <p className="mt-3 text-atlas-body text-slate-300 max-w-3xl italic border-l-2 border-violet-500/60 pl-4 font-medium">
                  {tagline}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
            {primaryAction && (
              <AtlasButton
                variant="primary"
                size="lg"
                onClick={primaryAction.onClick}
                icon={primaryAction.icon ?? ArrowRight}
              >
                {primaryAction.label}
              </AtlasButton>
            )}
            {secondaryAction && (
              <AtlasButton
                variant="outline"
                size="lg"
                onClick={secondaryAction.onClick}
                icon={secondaryAction.icon ?? Activity}
              >
                {secondaryAction.label}
              </AtlasButton>
            )}
          </div>
        </div>

        {/* KPI strip */}
        {kpis && kpis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            {kpis.slice(0, 4).map((kpi, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800/60 bg-atlas-bg-surface/50 backdrop-blur px-4 py-3.5 hover:border-cyan-500/25 transition-colors"
              >
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                  {kpi.label}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="numeric text-slate-100 text-2xl sm:text-[26px] tabular-nums font-semibold">
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className="text-atlas-label text-cyan-400 font-bold">{kpi.unit}</span>
                  )}
                </div>
                {kpi.delta && (
                  <div className="text-[11px] font-mono text-success-500 mt-1 flex items-center gap-1">
                    <span>▲</span>
                    <span>{kpi.delta}</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export default AtlasModuleHero;
