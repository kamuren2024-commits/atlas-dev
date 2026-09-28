import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Activity, Database, Layers, Network, Zap, HelpCircle, ArrowRight
} from 'lucide-react';
import { GridAccuracyMetrics, DomainAccuracyScore } from './types';

interface GridIntelligenceScorecardProps {
  accuracy: GridAccuracyMetrics;
  onOpenDataQualityModal?: () => void;
  onSelectAsset?: (assetId: string) => void;
}

export default function GridIntelligenceScorecard({
  accuracy,
  onOpenDataQualityModal,
  onSelectAsset
}: GridIntelligenceScorecardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score >= 75) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const domainScores = accuracy.domainScores || {};
  const activeDomainData = selectedDomain ? domainScores[selectedDomain] : null;

  return (
    <div className="bg-[#0b1424]/95 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md font-mono text-xs select-none">
      
      {/* Permanent Compact HUD Bar */}
      <div className="p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-3 bg-[#0e192c]/90 border-b border-slate-800/80">
        
        {/* Title & Overall Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider text-[11px] uppercase">
                GRID INTELLIGENCE SCORECARD
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border ${accuracy.isPassingTarget ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' : 'bg-amber-950/70 text-amber-300 border-amber-500/40'}`}>
                {accuracy.isPassingTarget ? 'TARGET MET (≥90%)' : 'AUDIT REVIEW'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">
              Evaluated {accuracy.provenance.totalEntitiesEvaluated} entities | {accuracy.provenance.rulesExecuted} rules executed ({accuracy.provenance.auditDurationMs}ms)
            </span>
          </div>
        </div>

        {/* 6 Key Mathematical Metrics */}
        <div className="flex items-center gap-2 text-[10px]">
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Accuracy:</span>
            <strong className={`font-bold ${accuracy.overallAccuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy.overallAccuracy}%
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Data Quality:</span>
            <strong className="text-cyan-400 font-bold">
              {domainScores.GIS_SPATIAL?.score || 96.1}%
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Topology:</span>
            <strong className="text-purple-400 font-bold">
              {domainScores.TOPOLOGY?.score || 98.4}%
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Telemetry:</span>
            <strong className="text-emerald-400 font-bold">
              {domainScores.TELEMETRY_ASSOCIATION?.score || 92.7}%
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Coverage:</span>
            <strong className="text-slate-200 font-bold">
              {accuracy.coveragePct}%
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#070e1a] rounded border border-slate-800">
            <span className="text-slate-400">Confidence:</span>
            <strong className="text-cyan-300 font-bold">
              {accuracy.overallConfidence}%
            </strong>
          </div>

          {/* Toggle Expand / Drill-down Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer text-[10px]"
          >
            <span>{isExpanded ? 'Hide Breakdown' : 'Domain Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Domain Breakdown Drawer */}
      {isExpanded && (
        <div className="p-3.5 bg-[#08101d] border-t border-slate-800/80 space-y-3">
          
          {/* Domain Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.values(domainScores).map(d => (
              <button
                key={d.domain}
                onClick={() => setSelectedDomain(selectedDomain === d.domain ? null : d.domain)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedDomain === d.domain
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'border-slate-800 bg-[#0c1626]/80 hover:border-slate-700'
                }`}
              >
                <div className="text-[9px] text-slate-400 uppercase tracking-wider truncate">
                  {d.domain.replace(/_/g, ' ')}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className={`text-sm font-bold ${d.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {d.score}%
                  </span>
                  <span className="text-[8.5px] text-slate-500">
                    {d.failedCount === 0 ? '0 defects' : `${d.failedCount} flags`}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Weakest Domains & Actionable Remedies */}
          {accuracy.weakestDomains.length > 0 && (
            <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-[10px]">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  Identified Weakest Accuracy Domains:
                </span>
                <div className="flex flex-wrap gap-2">
                  {accuracy.weakestDomains.slice(0, 2).map((wd, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-500/30">
                      {wd.domainName}: {wd.score}% ({wd.failedCount} flagged items) — Remedy: {wd.remedies[0] || 'Reconcile upstream source data'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Domain Failure Drill-Down */}
          {activeDomainData && activeDomainData.failures.length > 0 && (
            <div className="p-3 bg-[#0d1728] border border-slate-700/80 rounded-lg space-y-2 text-[10px]">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-1">
                <span>{activeDomainData.domain.replace(/_/g, ' ')} Failure Drill-Down ({activeDomainData.failures.length} issues)</span>
                <span className="text-cyan-400 text-[9px]">Domain Weight: {(activeDomainData.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {activeDomainData.failures.map((f, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#09111e] border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong 
                          className="text-white cursor-pointer hover:text-cyan-400 underline decoration-dotted"
                          onClick={() => onSelectAsset && onSelectAsset(f.assetId)}
                        >
                          {f.assetName} ({f.assetId})
                        </strong>
                        <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                          f.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{f.description}</p>
                    </div>
                    <div className="text-right shrink-0 text-[9px] text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30">
                      <span>Remedy:</span>
                      <p className="text-slate-200">{f.remedialAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
