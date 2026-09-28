import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Search, ShieldCheck, Database, Clock } from 'lucide-react';
import { motionTokens } from '../../../design-system/tokens';
import { AtlasStatusBadge } from './AtlasStatusBadge';

export type AtlasEvidenceRevealSeverity = 'healthy' | 'risk' | 'critical' | 'info';

export interface AtlasEvidenceLevel {
  label: string;
  summary: string;
  data: Array<{ label: string; value: string; tone?: 'default' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'danger' }>;
  sources?: string[];
}

export interface AtlasEvidenceRevealProps {
  severity: AtlasEvidenceRevealSeverity;
  signal: string;           // e.g. "SUPPLIER RISK"
  level1: string;           // e.g. "HIGH"
  exposure?: string;        // e.g. "$4.2M"
  levels: AtlasEvidenceLevel[]; // Level 2 (operational) → Level 3 (technical evidence)
  confidence?: number;
  dataSources?: number;
  lastAnalyzed?: string;
  className?: string;
}

const SEVERITY_META: Record<AtlasEvidenceRevealSeverity, { ring: string; text: string; badge: any }> = {
  healthy: { ring: 'border-emerald-500/25', text: 'text-emerald-400', badge: 'HEALTHY' },
  risk: { ring: 'border-amber-500/25', text: 'text-amber-400', badge: 'RISK' },
  critical: { ring: 'border-red-500/30', text: 'text-red-400', badge: 'CRITICAL' },
  info: { ring: 'border-cyan-500/25', text: 'text-cyan-400', badge: 'INFO' },
};

export function AtlasEvidenceReveal({
  severity = 'info',
  signal,
  level1,
  exposure,
  levels,
  confidence,
  dataSources,
  lastAnalyzed,
  className = '',
}: AtlasEvidenceRevealProps) {
  const sm = SEVERITY_META[severity];
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  return (
    <div className={`relative rounded-xl border ${sm.ring} bg-atlas-bg-surface/40 backdrop-blur overflow-hidden ${className}`}>
      <div className="px-4 py-3.5 border-b border-slate-800/50">
        {/* Level 1: Executive signal — always visible */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-atlas-label ${sm.text} tracking-widest`}>{signal}</span>
            <span className={`text-atlas-label ${sm.text} tracking-widest font-black text-lg`}>{level1}</span>
          </div>
          {exposure && (
            <span className="text-[11px] font-mono text-slate-300 shrink-0">
              Exposure: <span className="text-slate-100 font-bold tabular-nums">{exposure}</span>
            </span>
          )}
        </div>

        {/* Provenance metadata */}
        {(confidence !== undefined || dataSources !== undefined || lastAnalyzed) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] font-mono text-slate-400">
            {confidence !== undefined && (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                AI Confidence: <span className="text-violet-300 font-semibold tabular-nums">{Math.round(confidence * 100)}%</span>
              </span>
            )}
            {dataSources !== undefined && (
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 font-medium">{dataSources} data sources</span>
              </span>
            )}
            {lastAnalyzed && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300 font-medium">{lastAnalyzed}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progressive disclosure levels */}
      <div className="p-2">
        {levels.map((level, idx) => {
          const isOpen = expandedLevel === idx;
          return (
            <div key={idx} className="rounded-lg border border-transparent hover:border-slate-800/50 transition-colors">
              <button
                onClick={() => setExpandedLevel(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">{level.label}</span>
                  <span className="text-[11px] text-slate-200 truncate font-medium">{level.summary}</span>
                </div>
                {isOpen && (
                  <span className="text-[9px] font-mono text-slate-400 uppercase shrink-0 font-medium">hide</span>
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={motionTokens.interaction.dataReveal}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1.5 border-t border-slate-800/40 pt-2 ml-3">
                      {level.data.map((d, di) => {
                        const toneClass = {
                          default: 'text-slate-200',
                          cyan: 'text-cyan-400',
                          violet: 'text-violet-400',
                          emerald: 'text-emerald-400',
                          amber: 'text-amber-400',
                          danger: 'text-red-400',
                        }[d.tone ?? 'default'];
                        return (
                          <div key={di} className="flex items-center justify-between gap-3 py-0.5">
                            <span className="text-[11px] text-slate-300 font-medium">{d.label}</span>
                            <span className={`text-[11px] font-semibold tabular-nums ${toneClass}`}>{d.value}</span>
                          </div>
                        );
                      })}
                      {level.sources && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800/40 mt-1.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider self-center font-bold">Evidence:</span>
                          {level.sources.map((s, si) => (
                            <span key={si} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-800 bg-[#05070D] text-[9px] font-mono text-slate-400">
                              <Search className="w-2.5 h-2.5 text-cyan-400/60" /> {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AtlasEvidenceReveal;
