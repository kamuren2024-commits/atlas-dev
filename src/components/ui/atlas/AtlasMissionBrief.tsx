import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, AlertTriangle, Bot, Workflow, Search } from 'lucide-react';
import { motionTokens } from '../../../design-system/tokens';

export interface MissionMetric {
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'healthy' | 'risk' | 'ai' | 'info';
  icon?: LucideIcon;
}

export interface AtlasMissionBriefProps {
  moduleLabel: string;
  mission: string;
  description?: string;
  metrics: MissionMetric[];
  className?: string;
}

const TONE_META: Record<NonNullable<MissionMetric['tone']>, { text: string; dot: string; iconColor: string }> = {
  healthy: { text: 'text-emerald-400', dot: 'bg-emerald-400', iconColor: 'text-emerald-400' },
  risk: { text: 'text-amber-400', dot: 'bg-amber-400', iconColor: 'text-amber-400' },
  ai: { text: 'text-violet-400', dot: 'bg-violet-400', iconColor: 'text-violet-400' },
  info: { text: 'text-cyan-400', dot: 'bg-cyan-400', iconColor: 'text-cyan-400' },
};

export function AtlasMissionBrief({
  moduleLabel,
  mission,
  description,
  metrics,
  className = '',
}: AtlasMissionBriefProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative border-b border-slate-800/60 bg-[linear-gradient(180deg,rgba(0,217,255,0.03),transparent)] ${className}`}
    >
      {/* Mission statement */}
      <div className="px-6 sm:px-8 pt-4 pb-3 border-b border-slate-800/40">
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1.5">
          {moduleLabel} — Mission Brief
        </div>
        <h3 className="text-lg sm:text-xl font-display font-medium tracking-tight text-slate-100 leading-snug">
          {mission}
        </h3>
        {description && (
          <p className="mt-1 text-[13px] text-slate-300 leading-relaxed max-w-3xl">{description}</p>
        )}
      </div>

      {/* Current Situation strip */}
      {metrics && metrics.length > 0 && (
        <div className="px-6 sm:px-8 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Current Situation
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {metrics.map((m, i) => {
              const meta = TONE_META[m.tone ?? 'info'];
              const Icon = m.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...motionTokens.transition.normal, delay: 0.05 * i }}
                  className="rounded-lg border border-slate-700/60 bg-atlas-bg-surface/60 backdrop-blur px-3 py-2.5 hover:border-slate-600/70 transition-colors"
                >
                  <div className="flex items-start gap-1.5 min-w-0">
                    {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${meta.iconColor}`} />}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 leading-tight break-words">
                      {m.label}
                    </span>
                  </div>
                  <div className={`mt-1 flex items-baseline gap-1 ${meta.text}`}>
                    <span className="numeric text-xl tabular-nums">{m.value}</span>
                    {m.unit && <span className="text-[10px] font-mono font-bold">{m.unit}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}

export default AtlasMissionBrief;
