import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, ArrowRight, ChevronDown } from 'lucide-react';
import type { Bottleneck } from '../../../../../backend/planning-engine/types';

interface BottleneckMapProps {
  bottlenecks: Bottleneck[];
  onSelectAsset: (assetId: string) => void;
}

export default function BottleneckMapUI({ bottlenecks, onSelectAsset }: BottleneckMapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ranked = [...bottlenecks].sort((a, b) => b.criticality - a.criticality);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400">Network Intelligence</div>
          <h3 className="text-lg font-bold">BOTTLENECK MAP</h3>
        </div>
      </div>

      {/* Network Path Visualization */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-4 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">Critical Network Paths</div>
        <div className="space-y-3">
          {ranked.map((bottleneck, idx) => (
            <div key={bottleneck.id} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-6">#{idx + 1}</span>
              <div className="flex items-center gap-1 flex-1">
                {bottleneck.path.map((node, ni) => (
                  <React.Fragment key={ni}>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border
                      ${ni === 0 || ni === bottleneck.path.length - 1
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                      {node}
                    </span>
                    {ni < bottleneck.path.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border
                ${bottleneck.criticality > 80 ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                  bottleneck.criticality > 60 ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                {bottleneck.criticality}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Bottleneck Cards */}
      <div className="space-y-3">
        {ranked.map(bottleneck => {
          const severity = bottleneck.criticality > 80 ? 'CRITICAL' : bottleneck.criticality > 60 ? 'HIGH' : bottleneck.criticality > 40 ? 'MEDIUM' : 'LOW';
          const expanded = expandedId === bottleneck.id;

          return (
            <div key={bottleneck.id} className={`rounded-lg border transition
              ${severity === 'CRITICAL' ? 'border-red-500/30 bg-red-500/5' :
                severity === 'HIGH' ? 'border-amber-500/30 bg-amber-500/5' :
                'border-slate-800 bg-[#0a1222]'}`}>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{bottleneck.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold
                        ${severity === 'CRITICAL' ? 'border-red-500/30 text-red-400' :
                          severity === 'HIGH' ? 'border-amber-500/30 text-amber-400' :
                          'border-slate-700 text-slate-400'}`}>{severity}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Path: {bottleneck.path.join(' → ')}</div>
                  </div>
                  <button onClick={() => setExpandedId(expanded ? null : bottleneck.id)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-2 text-[10px]">
                  <div className="text-slate-400">Current <span className="text-slate-200 font-bold">{bottleneck.currentImpact}</span></div>
                  <div className="text-slate-400">Forecast <span className="text-amber-400 font-bold">{bottleneck.forecastImpact}</span></div>
                  <div className="text-slate-400">Probability <span className="text-slate-200 font-bold">{(bottleneck.probability * 100).toFixed(0)}%</span></div>
                  <div className="text-slate-400">Duration <span className="text-slate-200 font-bold">{bottleneck.durationHours}h</span></div>
                  <div className="text-slate-400">Expansion <span className="text-emerald-400 font-bold">+{bottleneck.expansionPotentialPct}%</span></div>
                </div>

                {/* Impact bars */}
                <div className="mt-3 flex items-center gap-2 text-[9px]">
                  <span className="text-slate-500 w-14">Current</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${bottleneck.currentImpact}%` }} />
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[9px]">
                  <span className="text-slate-500 w-14">Forecast</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500/60 rounded-full" style={{ width: `${Math.min(100, bottleneck.forecastImpact)}%` }} />
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <div>Source: {bottleneck.evidence?.[0]?.source || 'Planning Model'}</div>
                    <div>Confidence: {bottleneck.evidence?.[0] ? `${(bottleneck.evidence[0].confidence * 100).toFixed(0)}%` : '95%'}</div>
                    <div>Assumptions: {bottleneck.evidence?.[0]?.assumptions?.join(', ') || 'N-1 contingency'}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
