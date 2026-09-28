import React from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, Zap, Flame, 
  TrendingUp, Sparkles, Network, ArrowRight
} from 'lucide-react';
import { GridIntelligenceState } from './intelligence-fabric';

interface GridTopBarIntelligenceHUDProps {
  intelligence: GridIntelligenceState;
  onSelectAsset: (assetId: string) => void;
  onOpenCopilotWithPrompt?: (prompt: string) => void;
  onSwitchMode?: (mode: string) => void;
}

export default function GridTopBarIntelligenceHUD({
  intelligence,
  onSelectAsset,
  onOpenCopilotWithPrompt,
  onSwitchMode
}: GridTopBarIntelligenceHUDProps) {
  const topAnomaly = intelligence.anomalies[0];
  const topRiskAsset = intelligence.riskAssessment.assetFailureRisk[0];
  const topCorridor = intelligence.riskAssessment.corridorRisk[0];
  const topIncident = intelligence.incidents[0];
  const nextThreat = intelligence.riskAssessment.forecasts[0];

  return (
    <div className="w-full bg-[#08101e]/95 border-b border-slate-800/90 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none font-mono text-[10px] text-slate-300 backdrop-blur-md shrink-0">
      
      {/* 1. GRID STATE */}
      <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-[#0e192c] border border-slate-800">
        <span className="text-slate-400">GRID STATE:</span>
        <span className="flex items-center gap-1 font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          BALANCED (94.2% ACC)
        </span>
      </div>

      {/* 2. TOP RISK */}
      {topRiskAsset && (
        <button
          onClick={() => {
            onSelectAsset(topRiskAsset.assetId);
            if (onOpenCopilotWithPrompt) onOpenCopilotWithPrompt(`Explain why ${topRiskAsset.assetName} is rated as the top failure risk.`);
          }}
          className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/40 hover:bg-rose-950/70 text-rose-300 transition-colors cursor-pointer"
        >
          <Flame className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="text-slate-400">TOP RISK:</span>
          <strong className="text-rose-200 truncate max-w-[120px]">{topRiskAsset.assetName.split(' ')[0]}</strong>
          <span className="px-1 py-0.2 rounded bg-rose-900/60 text-rose-200 text-[8.5px] font-bold">
            {topRiskAsset.score}/100
          </span>
        </button>
      )}

      {/* 3. TOP ANOMALY */}
      {topAnomaly && (
        <button
          onClick={() => {
            onSelectAsset(topAnomaly.assetId);
            if (onOpenCopilotWithPrompt) onOpenCopilotWithPrompt(`What is the anomaly on ${topAnomaly.assetName} and what is the probable cause?`);
          }}
          className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 hover:bg-amber-950/70 text-amber-300 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-slate-400">TOP ANOMALY:</span>
          <strong className="text-amber-200 truncate max-w-[140px]">{topAnomaly.signal}</strong>
          <span className="text-amber-300 font-bold">({topAnomaly.currentValue})</span>
        </button>
      )}

      {/* 4. TOP CONGESTION */}
      {topCorridor && (
        <button
          onClick={() => {
            if (onSwitchMode) onSwitchMode('GRAPH');
            if (onOpenCopilotWithPrompt) onOpenCopilotWithPrompt(`Detail the power transfer and dynamic line rating status of corridor ${topCorridor.name}.`);
          }}
          className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/40 hover:bg-purple-950/70 text-purple-300 transition-colors cursor-pointer"
        >
          <Zap className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="text-slate-400">CONGESTION:</span>
          <strong className="text-purple-200 truncate max-w-[130px]">{topCorridor.corridorId}</strong>
          <span className="text-purple-300 font-bold">{topCorridor.loadingPct}%</span>
        </button>
      )}

      {/* 5. TOP INCIDENT */}
      {topIncident && (
        <button
          onClick={() => {
            onSelectAsset(topIncident.affectedAssets[0] || 'suswa');
            if (onOpenCopilotWithPrompt) onOpenCopilotWithPrompt(`Provide full investigation advisory for incident: ${topIncident.title}`);
          }}
          className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-950/70 text-cyan-300 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="text-slate-400">INCIDENT:</span>
          <strong className="text-cyan-200 truncate max-w-[160px]">{topIncident.title}</strong>
          <span className="text-cyan-300 font-bold">{topIncident.confidence}%</span>
        </button>
      )}

      {/* 6. NEXT THREAT */}
      {nextThreat && (
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-[#0e192c] border border-slate-800 text-slate-300">
          <TrendingUp className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="text-slate-400">NEXT THREAT ({nextThreat.horizon}):</span>
          <strong className="text-indigo-300">{nextThreat.trajectory}</strong>
          <span className="text-slate-400">({nextThreat.riskScore} Risk)</span>
        </div>
      )}
    </div>
  );
}
