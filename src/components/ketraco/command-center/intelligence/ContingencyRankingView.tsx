import React, { useState } from 'react';
import { 
  GitPullRequest, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Gauge, 
  Flame, 
  Play, 
  ChevronRight, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { ContingencyRankedItem, CascadingSimulation, ContingencySeverity } from './types';
import { GridContingencyEngine } from './contingency-engine';
import { GridAsset, TransmissionLine } from '../types';

interface ContingencyRankingViewProps {
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  onSelectScenarioForLab?: (scenarioId: string) => void;
}

export default function ContingencyRankingView({
  substations,
  lines,
  onSelectScenarioForLab
}: ContingencyRankingViewProps) {
  const [rankedContingencies] = useState<ContingencyRankedItem[]>(() =>
    GridContingencyEngine.rankContingencies(substations, lines)
  );
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedContingencyId, setSelectedContingencyId] = useState<string>(
    rankedContingencies[0]?.id || 'SCEN_SUSWA_T1_TRIP'
  );
  const [cascadingData, setCascadingData] = useState<CascadingSimulation>(() =>
    GridContingencyEngine.generateCascadingSimulation(selectedContingencyId, substations, lines)
  );
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const filteredContingencies = rankedContingencies.filter(c => 
    selectedSeverity === 'ALL' || c.severity === selectedSeverity
  );

  const handleSelectContingency = (scenId: string) => {
    setSelectedContingencyId(scenId);
    const sim = GridContingencyEngine.generateCascadingSimulation(scenId, substations, lines);
    setCascadingData(sim);
    setCurrentStageIdx(0);
  };

  const handlePlayCascade = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    let stage = 0;
    setCurrentStageIdx(0);

    const interval = setInterval(() => {
      stage++;
      if (stage < cascadingData.totalStages) {
        setCurrentStageIdx(stage);
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 1800);
  };

  const severityBadge = (severity: ContingencySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
      case 'SEVERE':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">SEVERE</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">MODERATE</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">LOW</span>;
    }
  };

  const currentStage = cascadingData.stages[currentStageIdx] || cascadingData.stages[0];

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-[#090e1a] border border-cyan-900/50 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-base font-bold tracking-wider text-slate-100">
              NATIONAL N-1 & COMPOUND CONTINGENCY RANKING
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              AUTOMATED DYNAMIC AC IMPACT ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantitatively evaluates all single-element (N-1) and sequential (N-1-1) contingencies by Severity × Likelihood.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-md border border-slate-800">
          {['ALL', 'CRITICAL', 'SEVERE', 'HIGH', 'MODERATE'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wider transition-all ${
                selectedSeverity === sev
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Contingency Table */}
      <div className="bg-[#090e1a] border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050913] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Contingency Event</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">MW Loss</th>
                <th className="py-2.5 px-3">Freq Δ</th>
                <th className="py-2.5 px-3">Min Voltage</th>
                <th className="py-2.5 px-3">Overloads</th>
                <th className="py-2.5 px-3">MTTR</th>
                <th className="py-2.5 px-3">Top Mitigation</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContingencies.map(item => {
                const isSel = item.id === selectedContingencyId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectContingency(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSel ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-cyan-400">#{item.rank}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{item.name}</td>
                    <td className="py-2.5 px-3">{severityBadge(item.severity)}</td>
                    <td className="py-2.5 px-3 font-mono text-red-400 font-bold">-{item.mwImpact} MW</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{item.frequencyDipHz.toFixed(2)} Hz</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{item.minVoltagePU.toFixed(3)} p.u.</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={item.overloadedCircuitsCount > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {item.overloadedCircuitsCount} lines
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.restorationTimeMinutes} mins</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300 max-w-[220px] truncate" title={item.topRemediation}>
                      {item.topRemediation}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {onSelectScenarioForLab && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectScenarioForLab(item.id);
                          }}
                          className="px-2 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-[10px] tracking-wider transition-all whitespace-nowrap"
                        >
                          Simulate in Lab →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cascading Failure Step-by-Step Interactive Player */}
      <div className="bg-[#090e1a] border border-cyan-900/60 rounded-lg p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-slate-200">
                CASCADING FAILURE PROPAGATION TIMELINE: {cascadingData.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step physical breakdown from initial trigger to SPS automated defense and island stabilization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayCascade}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-orange-600/30"
            >
              <Play className="w-3.5 h-3.5" />
              {isPlaying ? 'PLAYING CASCADE...' : 'PLAY PROPAGATION'}
            </button>
          </div>
        </div>

        {/* Stage Timeline Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {cascadingData.stages.map((stg, idx) => {
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={idx}
                onClick={() => setCurrentStageIdx(idx)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-[#050913] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>T = +{stg.timeOffsetSec}s</span>
                  <span className={`font-bold ${isCurrent ? 'text-orange-400' : 'text-slate-500'}`}>
                    STAGE {idx}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{stg.title.split(':')[1]}</div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Detailed Card */}
        <div className="bg-[#050913] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block animate-pulse"></span>
              <span>{currentStage.title} (Elapsed: +{currentStage.timeOffsetSec}s)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span>Freq: <strong className="text-red-400">{currentStage.frequencyHz} Hz</strong></span>
              <span>Volt: <strong className="text-amber-400">{currentStage.voltagePU} p.u.</strong></span>
              <span>Overloads: <strong className="text-red-400">{currentStage.overloadedLines.length}</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-300">{currentStage.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-bold block mb-1">Trigger Event:</span>
              <span className="text-amber-300">{currentStage.trigger}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-bold block mb-1">Corridor & Grid Impact:</span>
              <span className="text-slate-200">{currentStage.corridorImpact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
