// NationalGridHealthScorecard - KETRACO Phase 06 Composite National Grid Health Metric

import React from 'react';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Flame, 
  Zap, 
  Layers 
} from 'lucide-react';
import { NationalGridHealthScore } from './types';

interface NationalGridHealthScorecardProps {
  healthScore: NationalGridHealthScore;
  isOpen: boolean;
  onClose: () => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function NationalGridHealthScorecard({
  healthScore,
  isOpen,
  onClose,
  onOpenDecisionBrief
}: NationalGridHealthScorecardProps) {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-[#080f1d] border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden font-mono text-slate-200 text-xs">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0b162a] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SYSTEM HEALTH INDEX
              </span>
              <h2 className="text-sm font-bold text-slate-100">National Grid Health Scorecard</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scorecard Body */}
        <div className="p-5 space-y-4">
          
          {/* Main Big Score Hero */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                COMPOSITE SYSTEM HEALTH
              </div>
              <div className={`text-4xl font-black ${getScoreColor(healthScore.overallHealthScore)}`}>
                {healthScore.overallHealthScore} <span className="text-base font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Evaluation Grade: <strong className="text-emerald-400">{healthScore.grade}</strong> (Normal Stability Margin)
              </div>
            </div>

            <div className="text-right text-[10px] space-y-1">
              <div className="text-slate-400">TREND: <strong className="text-emerald-400">STABLE (+0.4%)</strong></div>
              <div className="text-slate-400">CONFIDENCE: <strong className="text-cyan-300">96.8%</strong></div>
              <div className="text-slate-400">NEXT AUDIT: <strong>15 MIN</strong></div>
            </div>
          </div>

          {/* 8-Dimension Breakdown Grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              8-DIMENSION HEALTH METRIC BREAKDOWN
            </div>

            <div className="grid grid-cols-2 gap-2">
              {healthScore.dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{dim.name}</div>
                    <div className="text-[10px] text-slate-400">Weight: {dim.weight}%</div>
                  </div>
                  <div className={`text-sm font-bold ${getScoreColor(dim.score)}`}>
                    {dim.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vulnerability Note */}
          <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px]">
            <strong>Primary Health Reducer:</strong> Transformer aging & DGA thermal hotspot at Suswa 400kV hub (-4.2 pts).
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a1426] border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            DISMISS SCORECARD
          </button>
        </div>

      </div>
    </div>
  );
}
