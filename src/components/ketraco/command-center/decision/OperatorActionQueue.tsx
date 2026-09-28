// OperatorActionQueue - KETRACO Phase 06 Operator Work Queue (Palantir/C3.ai-Class Attention Ranking)

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Activity, 
  GitPullRequest, 
  Eye, 
  Layers, 
  Database, 
  Clock, 
  ArrowUpRight, 
  Cpu, 
  MapPin, 
  Share2, 
  Box, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Filter, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PriorityItem, PriorityLevel, PriorityCategory } from './types';

interface OperatorActionQueueProps {
  items: PriorityItem[];
  onOpenMapToAsset?: (assetId: string) => void;
  onOpen3DTwin?: (assetId: string) => void;
  onOpenGraphExplorer?: (assetId: string) => void;
  onOpenScenarioLab?: (scenarioId?: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
  onOpenAsset360?: (assetId: string) => void;
  onOpenCorridor360?: (corridorId: string) => void;
}

export default function OperatorActionQueue({
  items,
  onOpenMapToAsset,
  onOpen3DTwin,
  onOpenGraphExplorer,
  onOpenScenarioLab,
  onOpenDecisionBrief,
  onOpenAsset360,
  onOpenCorridor360
}: OperatorActionQueueProps) {
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<PriorityCategory | 'ALL'>('ALL');
  const [activeItemId, setActiveItemId] = useState<string>(items[0]?.id || '');

  const filteredItems = items.filter(item => {
    if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const activeItem = items.find(i => i.id === activeItemId) || items[0];

  const getPriorityBadge = (prio: PriorityLevel) => {
    switch (prio) {
      case 'P0':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            CRITICAL P0
          </span>
        );
      case 'P1':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
            HIGH P1
          </span>
        );
      case 'P2':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
            MEDIUM P2
          </span>
        );
      case 'P3':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
            LOW P3
          </span>
        );
      case 'P4':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30">
            INFO P4
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: PriorityCategory) => {
    switch (cat) {
      case 'CORRIDOR': return <Flame className="w-3.5 h-3.5 text-purple-400" />;
      case 'ASSET': return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CONTINGENCY': return <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />;
      case 'FORECAST': return <Eye className="w-3.5 h-3.5 text-indigo-400" />;
      case 'MAINTENANCE': return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
      case 'DATA_QUALITY': return <Database className="w-3.5 h-3.5 text-slate-400" />;
      default: return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      
      {/* Header & Filter Toolbar */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">OPERATOR ACTION QUEUE</h2>
            <p className="text-[10px] font-mono text-slate-400">
              Palantir-Class Multi-Factor Attention Ranking ({items.length} items evaluated)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Filters */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded p-0.5 text-[10px] font-mono">
            {(['ALL', 'P0', 'P1', 'P2', 'P3'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedPriority === p
                    ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="CORRIDOR">Corridors</option>
            <option value="ASSET">Assets</option>
            <option value="CONTINGENCY">Contingencies</option>
            <option value="FORECAST">Weather & Forecasts</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DATA_QUALITY">Data Quality</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Queue List (Left) + Detailed Deep-Dive Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        
        {/* Left Column: Queue Items List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800/80 p-2 space-y-1.5 max-h-[580px] overflow-y-auto">
          {filteredItems.map(item => {
            const isSelected = item.id === activeItem?.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#0f1d35] border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-[#0a1120]/70 border-slate-800/80 hover:bg-[#0c1629] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(item.category)}
                    <span className="text-[10px] font-mono font-bold text-slate-300">{item.code}</span>
                  </div>
                  {getPriorityBadge(item.priority)}
                </div>

                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-400">COMPOSITE:</span>
                    <strong className="text-cyan-300">{item.scores.compositeScore}/100</strong>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                    {item.scores.confidence}% CONF
                  </span>
                  {item.groupedEventCount && item.groupedEventCount > 1 && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                      +{item.groupedEventCount} grouped
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Item Dossier & Deep Links (7 cols) */}
        {activeItem && (
          <div className="lg:col-span-7 p-4 bg-[#09101f] flex flex-col justify-between overflow-y-auto max-h-[580px]">
            <div className="space-y-3">
              
              {/* Item Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityBadge(activeItem.priority)}
                    <span className="text-[10px] font-mono text-slate-400">{activeItem.category}</span>
                    <span className="text-[10px] font-mono text-slate-400">•</span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {activeItem.code}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{activeItem.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-cyan-400">{activeItem.scores.compositeScore} / 100</div>
                  <div className="text-[9px] font-mono text-slate-400">PRIORITY SCORE</div>
                </div>
              </div>

              {/* 5-Factor Score Radar / Micro Breakdown */}
              <div className="grid grid-cols-5 gap-1.5 p-2 rounded bg-slate-900/80 border border-slate-800 text-center font-mono text-[9.5px]">
                <div>
                  <div className="text-slate-400">IMPACT</div>
                  <div className="font-bold text-rose-400">{activeItem.scores.impact}%</div>
                </div>
                <div>
                  <div className="text-slate-400">URGENCY</div>
                  <div className="font-bold text-amber-400">{activeItem.scores.urgency}%</div>
                </div>
                <div>
                  <div className="text-slate-400">PROB</div>
                  <div className="font-bold text-purple-400">{activeItem.scores.probability}%</div>
                </div>
                <div>
                  <div className="text-slate-400">CRITICAL</div>
                  <div className="font-bold text-cyan-400">{activeItem.scores.criticality}%</div>
                </div>
                <div>
                  <div className="text-slate-400">CONF</div>
                  <div className="font-bold text-emerald-400">{activeItem.scores.confidence}%</div>
                </div>
              </div>

              {/* Root Cause & Hypothesis */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  ROOT CAUSE HYPOTHESIS
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeItem.rootCauseHypothesis}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  RECOMMENDED INTERVENTION
                </div>
                <p className="text-xs text-cyan-100 font-medium leading-relaxed">
                  {activeItem.recommendedAction}
                </p>
              </div>

              {/* Evidence Summary */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  CONVERGING EVIDENCE TRAIL
                </div>
                {activeItem.evidenceSummary.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-mono">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>

              {/* Affected Assets Tags */}
              <div>
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  AFFECTED ASSETS & NODES
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeItem.affectedAssetNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Grid: Deep Links to Map, Graph, 3D Twin, Scenarios & Decision Brief */}
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
              
              {/* Context Deep-Link Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {activeItem?.affectedAssetIds?.[0] && (
                  <>
                    <button
                      onClick={() => onOpenAsset360?.(activeItem.affectedAssetIds![0])}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      ASSET 360
                    </button>
                    <button
                      onClick={() => onOpenMapToAsset?.(activeItem.affectedAssetIds![0])}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      MAP
                    </button>
                    <button
                      onClick={() => onOpen3DTwin?.(activeItem.affectedAssetIds![0])}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Box className="w-3 h-3 text-purple-400" />
                      3D TWIN
                    </button>
                    <button
                      onClick={() => onOpenGraphExplorer?.(activeItem.affectedAssetIds![0])}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-amber-400" />
                      GRAPH
                    </button>
                  </>
                )}

                {activeItem?.affectedCorridorIds?.[0] && (
                  <button
                    onClick={() => onOpenCorridor360?.(activeItem.affectedCorridorIds![0])}
                    className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Flame className="w-3 h-3 text-purple-400" />
                    CORRIDOR 360
                  </button>
                )}
              </div>

              {/* Primary Action: Decision Brief & What-If Simulation */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenScenarioLab?.(activeItem.scenarioSimulationId)}
                  className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  SIMULATE
                </button>
                <button
                  onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  DECISION BRIEF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
