import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Terminal,
  Zap
} from 'lucide-react';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import { gridDataProvider } from '../providers/GridDataProvider';
import { AiInvestigationInsight } from '../types';

interface AiIntelligenceAnomalyLayerProps {
  insights: Record<string, AiInvestigationInsight>;
  onSelectAsset?: (assetId: string) => void;
  onExecuteRemedialAction?: (actionText: string) => void;
}

export default function AiIntelligenceAnomalyLayer({
  insights,
  onSelectAsset,
  onExecuteRemedialAction
}: AiIntelligenceAnomalyLayerProps) {
  const anomalies = gridDataProvider.getGridAnomalies();

  return (
    <div id="level-7-ai" className="w-full bg-[#060a14] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 7
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Operational Intelligence Feed & Grid Anomaly Ledger
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Structured Anomaly Detection, Probabilistic Root Cause & Operator Advisory
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="SIMULATION_ENGINE" />
          <ConfidenceBadge status="HIGH_CONFIDENCE" score={98.2} />
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Real-time Grid Anomaly Ledger (6 Cols) */}
        <div className="lg:col-span-6 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Active Grid Anomalies ({anomalies.length})
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/30">
                AI Deep Inspector
              </span>
            </div>

            <div className="space-y-2.5">
              {anomalies.map((anom) => (
                <div 
                  key={anom.id}
                  className="p-3 rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        anom.severity === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-500/40' : anom.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                      }`}>
                        {anom.severity}
                      </span>
                      <span 
                        onClick={() => onSelectAsset?.(anom.assetId)}
                        className="font-semibold text-slate-100 text-xs hover:text-sky-300 cursor-pointer"
                      >
                        {anom.assetName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{anom.detectionTime}</span>
                  </div>

                  <div className="text-xs text-slate-300 font-sans mb-2">
                    <strong className="text-slate-200">{anom.parameter}:</strong> Current reading{' '}
                    <span className="text-amber-300 font-mono font-bold">{anom.currentReading}</span>{' '}
                    vs baseline <span className="text-slate-400 font-mono">{anom.expectedBaseline}</span>{' '}
                    (<span className="text-red-400 font-mono font-bold">+{anom.variancePct}%</span>).
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <ConfidenceBadge status="VERIFIED" score={anom.confidencePct} size="sm" />
                    <button
                      onClick={() => onExecuteRemedialAction?.(anom.suggestedAction)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-mono flex items-center gap-1 border border-purple-500/30"
                    >
                      <span>Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Harmonics Analysis Engine:</span>
            <span className="text-emerald-400 font-semibold">Continuous FFT Stream</span>
          </div>
        </div>

        {/* AI Insight Feed & Dispatch Advisory (6 Cols) */}
        <div className="lg:col-span-6 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Dispatch & Remedial Operational Advisories
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Advisory Confidence &gt; 96%
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(insights).slice(0, 3).map(([key, item]) => (
                <div 
                  key={key}
                  className="p-3 rounded bg-slate-950/80 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      {item.assetName} AI Risk Diagnostics
                    </span>
                    <ConfidenceBadge status="VERIFIED" score={item.confidenceScore} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.summary}
                  </p>

                  <div className="p-2 rounded bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
                    <strong>Primary Mitigation:</strong> {item.mitigations?.[0] || item.projectedTrajectory}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Advisory Dispatch Protocol:</span>
            <span className="text-cyan-300 font-semibold">Ready for System Control Officer Authorization</span>
          </div>
        </div>

      </div>
    </div>
  );
}
