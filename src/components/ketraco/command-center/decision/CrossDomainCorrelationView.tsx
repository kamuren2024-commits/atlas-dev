// CrossDomainCorrelationView - KETRACO Phase 06 Cross-Domain Evidence Correlation

import React, { useState } from 'react';
import { 
  GitMerge, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Share2, 
  Sparkles, 
  ChevronRight,
  Database,
  FileText
} from 'lucide-react';
import { CrossDomainCorrelation } from './types';

interface CrossDomainCorrelationViewProps {
  correlations: CrossDomainCorrelation[];
  onOpenAsset360?: (assetId: string) => void;
  onOpenCorridor360?: (corridorId: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function CrossDomainCorrelationView({
  correlations = [],
  onOpenAsset360,
  onOpenCorridor360,
  onOpenDecisionBrief
}: CrossDomainCorrelationViewProps) {
  const list = correlations || [];
  const [selectedCorrId, setSelectedCorrId] = useState<string>(list[0]?.id || '');

  const activeCorr = list.find(c => c.id === selectedCorrId) || list[0];

  const getStatusBadge = (status: CrossDomainCorrelation['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            CONFIRMED
          </span>
        );
      case 'CORRELATED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            CORRELATED
          </span>
        );
      case 'MODELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            MODELLED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">
            UNCONFIRMED
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      
      {/* Header */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            <GitMerge className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              CROSS-DOMAIN EVIDENCE CORRELATION ENGINE
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Automated Synthesis across SCADA, PMU, Weather, GIS, EAM, and Simulation
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
        >
          <FileText className="w-3 h-3" />
          OPERATOR BRIEF
        </button>
      </div>

      {/* Grid: Correlation List (5 cols) + Evidence Decomposition (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left Column: Correlations */}
        <div className="lg:col-span-5 border-r border-slate-800/80 p-2 space-y-1.5 max-h-[560px] overflow-y-auto">
          {correlations.map(c => {
            const isSelected = c.id === activeCorr?.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCorrId(c.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer select-none font-mono ${
                  isSelected
                    ? 'bg-[#0f1f38] border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-[#0a1220]/70 border-slate-800 hover:bg-[#0c172a]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-300">{c.category}</span>
                  {getStatusBadge(c.status)}
                </div>

                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1 font-sans">
                  {c.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Confidence: <strong className="text-emerald-400">{c.confidence}%</strong></span>
                  <span className="text-rose-400 font-bold">Risk: {c.riskScore}/100</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Evidence Decomposition Dossier */}
        {activeCorr && (
          <div className="lg:col-span-7 p-4 bg-[#09101f] flex flex-col justify-between overflow-y-auto max-h-[560px]">
            <div className="space-y-3 font-mono text-xs">
              
              {/* Header */}
              <div className="border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(activeCorr.status)}
                  <span className="text-[10px] text-emerald-400 font-bold">{activeCorr.confidence}% CONFIDENCE</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-400">Sources: {activeCorr.sources.join(', ')}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">{activeCorr.title}</h3>
              </div>

              {/* Correlation Formula */}
              <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">
                  SYNTHESIZED CROSS-DOMAIN FORMULA
                </div>
                <p className="text-cyan-200 text-[11px] font-bold leading-relaxed">
                  {activeCorr.formula}
                </p>
              </div>

              {/* Evidence Points Table */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  CONVERGING EVIDENCE POINTS
                </div>
                {activeCorr.evidencePoints.map((ep, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900/70 border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                      <span>{ep.domain} ({ep.source})</span>
                      <span className="text-slate-200">{ep.metric}</span>
                    </div>
                    <div className="text-slate-200 font-bold text-[11px]">{ep.measuredValue}</div>
                    <div className="text-[10px] text-slate-400 italic">{ep.significance}</div>
                  </div>
                ))}
              </div>

              {/* Impact & Mitigation */}
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-300">
                  <span className="text-slate-400 font-bold">OPERATIONAL IMPACT:</span> {activeCorr.operationalImpact}
                </div>
                <div className="text-emerald-300 pt-1">
                  <span className="text-emerald-400 font-bold">RECOMMENDED MITIGATION:</span> {activeCorr.recommendedMitigation}
                </div>
              </div>

            </div>

            {/* Bottom Links */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {activeCorr.primaryAssetId && (
                  <button
                    onClick={() => onOpenAsset360?.(activeCorr.primaryAssetId)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    ASSET 360
                  </button>
                )}
                {activeCorr.corridorId && (
                  <button
                    onClick={() => onOpenCorridor360?.(activeCorr.corridorId!)}
                    className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    CORRIDOR 360
                  </button>
                )}
              </div>

              <button
                onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer"
              >
                GENERATE BRIEF
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
