// EventCausalityGraph - KETRACO Phase 06 Visual Causality Traversal (EVENT -> ASSET -> CORRIDOR -> DEPENDENCY -> IMPACT -> RISK -> RECOMMENDATION)

import React, { useState } from 'react';
import { 
  Share2, 
  Activity, 
  AlertTriangle, 
  Flame, 
  GitPullRequest, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Eye, 
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { EventCausalityGraphData, EventGraphNode, EventGraphEdge } from './types';

interface EventCausalityGraphProps {
  graphData: EventCausalityGraphData;
  onSelectNode?: (node: EventGraphNode) => void;
  onOpenAsset360?: (assetId: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function EventCausalityGraph({
  graphData,
  onSelectNode,
  onOpenAsset360,
  onOpenDecisionBrief
}: EventCausalityGraphProps) {
  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const [activeNodeId, setActiveNodeId] = useState<string>(nodes[0]?.id || '');

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  const getNodeIcon = (type: EventGraphNode['type']) => {
    switch (type) {
      case 'EVENT': return <Activity className="w-4 h-4 text-rose-400" />;
      case 'ASSET': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'CORRIDOR': return <Flame className="w-4 h-4 text-purple-400" />;
      case 'DEPENDENCY': return <GitPullRequest className="w-4 h-4 text-sky-400" />;
      case 'IMPACT': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'RISK': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'RECOMMENDATION': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getNodeColor = (type: EventGraphNode['type'], status: EventGraphNode['status'], isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[#0f2444] border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
    }
    switch (status) {
      case 'CRITICAL': return 'bg-rose-950/40 border-rose-600/50 hover:border-rose-400';
      case 'WARNING': return 'bg-amber-950/40 border-amber-600/50 hover:border-amber-400';
      case 'INFO': return 'bg-emerald-950/40 border-emerald-600/50 hover:border-emerald-400';
      default: return 'bg-slate-900 border-slate-700 hover:border-slate-500';
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      
      {/* Header */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-purple-950/60 border border-purple-500/30">
            <Share2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              EVENT CAUSALITY GRAPH TRAVERSAL
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Interactive Multi-Hop Root Cause & Dependency Propagation Flow
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenDecisionBrief?.(graphData.incidentId)}
          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          DECISION BRIEF
        </button>
      </div>

      {/* Causality Stage Pipeline Walkthrough (Linear Traversal Ribbon) */}
      <div className="p-3 bg-[#060b14] border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {nodes.map((node, index) => {
            const isSelected = node.id === activeNode?.id;
            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => {
                    setActiveNodeId(node.id);
                    onSelectNode?.(node);
                  }}
                  className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${getNodeColor(
                    node.type,
                    node.status,
                    isSelected
                  )}`}
                >
                  <div className="p-1.5 rounded bg-black/40">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400">{node.type}</span>
                      <span className="text-[9px] font-mono text-emerald-400">{node.confidence}%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 max-w-[150px] truncate">
                      {node.label}
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300">
                      {node.value}
                    </div>
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex items-center text-slate-600">
                    <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Dossier */}
      {activeNode && (
        <div className="p-4 bg-[#09101f] grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          
          {/* Node Summary */}
          <div className="md:col-span-2 space-y-2 p-3 rounded bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNodeIcon(activeNode.type)}
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                  {activeNode.type} NODE DETAILS
                </span>
              </div>
              <span className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
                PROVENANCE CONFIDENCE: {activeNode.confidence}%
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100">{activeNode.label}</h3>
            <p className="text-slate-300 text-[11.5px]">{activeNode.subtitle}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400">TELEMETRY / VALUE:</span>{' '}
                <strong className="text-slate-200">{activeNode.value}</strong>
              </div>
              <div>
                <span className="text-slate-400">DATA SOURCE:</span>{' '}
                <strong className="text-cyan-300">{activeNode.source}</strong>
              </div>
            </div>
          </div>

          {/* Quick Context Action */}
          <div className="p-3 rounded bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                GRAPH TOPOLOGY RELATIONS
              </div>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                Node links causality from upstream events to downstream contingency risks.
              </p>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => onOpenAsset360?.('suswa')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                OPEN ASSET 360
              </button>
              <button
                onClick={() => onOpenDecisionBrief?.(graphData.incidentId)}
                className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer"
              >
                GENERATE BRIEF
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
