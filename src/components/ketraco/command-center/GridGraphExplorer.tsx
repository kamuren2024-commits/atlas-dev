import React, { useState, useMemo } from 'react';
import { 
  Network, ArrowRight, ShieldAlert, GitCommit, GitBranch, 
  Search, Sliders, CheckCircle2, AlertTriangle, Zap, Eye, RotateCcw,
  Layers, Compass, Activity, Navigation
} from 'lucide-react';
import { GridAsset, TransmissionLine } from './types';

interface GridGraphExplorerProps {
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onHighlightPath?: (nodeIds: string[]) => void;
}

export type GraphCommand = 
  | 'ALL_TOPOLOGY'
  | 'TRACE_PATH'
  | 'SHOW_UPSTREAM'
  | 'SHOW_DOWNSTREAM'
  | 'SHOW_CRITICAL_BACKBONE'
  | 'SHOW_SPOF'
  | 'SHOW_N_MINUS_ONE_RISK'
  | 'SHOW_ALARM_PROPAGATION';

export default function GridGraphExplorer({
  substations,
  lines,
  selectedAssetId,
  onSelectAsset,
  onHighlightPath
}: GridGraphExplorerProps) {
  const [activeCommand, setActiveCommand] = useState<GraphCommand>('ALL_TOPOLOGY');
  const [sourceNode, setSourceNode] = useState<string>(selectedAssetId || 'suswa');
  const [targetNode, setTargetNode] = useState<string>('rabai');
  const [selectedVoltageFilter, setSelectedVoltageFilter] = useState<number | 'ALL'>('ALL');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const currentAsset = (selectedAssetId && substations ? substations[selectedAssetId] : null) || (substations ? (substations[sourceNode] || Object.values(substations)[0]) : undefined);

  // Graph Pathfinding Engine (Shortest Path / BFS)
  const computedPath = useMemo(() => {
    if (!sourceNode || !targetNode || sourceNode === targetNode) {
      return [sourceNode];
    }

    // Build adjacency list from transmission lines
    const adj: Record<string, string[]> = {};
    Object.values(lines).forEach(line => {
      if (!adj[line.fromSubstationId]) adj[line.fromSubstationId] = [];
      if (!adj[line.toSubstationId]) adj[line.toSubstationId] = [];
      adj[line.fromSubstationId].push(line.toSubstationId);
      adj[line.toSubstationId].push(line.fromSubstationId);
    });

    // BFS Queue
    const queue: string[][] = [[sourceNode]];
    const visited = new Set<string>([sourceNode]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (node === targetNode) {
        return path;
      }

      const neighbors = adj[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return [sourceNode, targetNode];
  }, [sourceNode, targetNode, lines]);

  // Compute graph nodes and active relationships based on command
  const graphState = useMemo(() => {
    const allSubs = Object.values(substations);
    const allLines = Object.values(lines);

    // Apply Voltage Filter
    let filteredSubs = selectedVoltageFilter === 'ALL' 
      ? allSubs 
      : allSubs.filter(s => s.voltageLevelKV === selectedVoltageFilter);
    
    let filteredLines = allLines;

    if (activeCommand === 'SHOW_CRITICAL_BACKBONE') {
      filteredSubs = allSubs.filter(s => s.voltageLevelKV >= 400 || s.criticalityScore >= 9);
      const nodeIds = filteredSubs.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) && nodeIds.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'SHOW_SPOF') {
      filteredSubs = allSubs.filter(s => s.singlePointOfFailure || !s.nMinusOneRedundant);
      const nodeIds = filteredSubs.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) || nodeIds.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'SHOW_N_MINUS_ONE_RISK') {
      filteredSubs = allSubs.filter(s => s.riskScore >= 40 || !s.nMinusOneRedundant);
      const nodeIds = filteredSubs.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) || nodeIds.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'SHOW_UPSTREAM') {
      const upstreamIds = currentAsset?.upstreamNodes || [];
      filteredSubs = allSubs.filter(s => s.id === currentAsset?.id || upstreamIds.includes(s.id));
      const nodeIds = filteredSubs.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) && nodeIds.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'SHOW_DOWNSTREAM') {
      const downstreamIds = currentAsset?.downstreamNodes || [];
      filteredSubs = allSubs.filter(s => s.id === currentAsset?.id || downstreamIds.includes(s.id));
      const nodeIds = filteredSubs.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) && nodeIds.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'SHOW_ALARM_PROPAGATION') {
      const alarmedNodes = allSubs.filter(s => s.state === 'WARNING' || s.state === 'CONGESTED' || s.state === 'CRITICAL');
      const nodeIds = alarmedNodes.map(n => n.id);
      filteredLines = allLines.filter(l => nodeIds.includes(l.fromSubstationId) || nodeIds.includes(l.toSubstationId));
      return { nodes: alarmedNodes, lines: filteredLines, pathNodes: [] };
    }

    if (activeCommand === 'TRACE_PATH') {
      filteredSubs = allSubs.filter(s => computedPath.includes(s.id));
      filteredLines = allLines.filter(l => computedPath.includes(l.fromSubstationId) && computedPath.includes(l.toSubstationId));
      return { nodes: filteredSubs, lines: filteredLines, pathNodes: computedPath };
    }

    return { nodes: filteredSubs, lines: filteredLines, pathNodes: [] };
  }, [substations, lines, activeCommand, currentAsset, computedPath, selectedVoltageFilter]);

  // Sync highlighted path to parent if in TRACE_PATH mode
  const handleTraceCommand = () => {
    setActiveCommand('TRACE_PATH');
    if (onHighlightPath) {
      onHighlightPath(computedPath);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070e1a] overflow-hidden select-none font-mono">
      
      {/* Top Command Toolbar */}
      <div className="p-2.5 px-4 bg-[#0c1626]/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.25)]">
            <Network className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider">
                NATIONAL TRANSMISSION GRAPH TOPOLOGY ONTOLOGY
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                GRAPH-AI ENGINE
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400">
              Active Nodes: {graphState.nodes.length} | Relationships: {graphState.lines.length} | Canonical Graph Model
            </span>
          </div>
        </div>

        {/* Voltage Tier Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {(['ALL', 500, 400, 220, 132] as const).map(v => (
            <button
              key={String(v)}
              onClick={() => setSelectedVoltageFilter(v)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                selectedVoltageFilter === v
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v === 'ALL' ? 'ALL TIERS' : `${v}kV`}
            </button>
          ))}
        </div>

        {/* Graph Query Commands */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL_TOPOLOGY', 'SHOW_CRITICAL_BACKBONE', 'SHOW_SPOF', 'SHOW_N_MINUS_ONE_RISK', 'SHOW_UPSTREAM', 'SHOW_DOWNSTREAM', 'TRACE_PATH'] as GraphCommand[]).map(cmd => (
            <button
              key={cmd}
              onClick={() => {
                if (cmd === 'TRACE_PATH') {
                  handleTraceCommand();
                } else {
                  setActiveCommand(cmd);
                }
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                activeCommand === cmd
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
            >
              {cmd.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Path Trace Selectors Toolbar */}
      {activeCommand === 'TRACE_PATH' && (
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px]">Origin Substation:</span>
              <select
                value={sourceNode}
                onChange={(e) => {
                  setSourceNode(e.target.value);
                  if (onHighlightPath) onHighlightPath(computedPath);
                }}
                className="bg-[#0f172a] border border-indigo-500/50 rounded px-2.5 py-1 text-slate-100 text-[10px] focus:outline-none focus:border-indigo-400 font-bold"
              >
                {Object.values(substations).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.voltageLevelKV}kV)</option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-indigo-400" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px]">Destination Substation:</span>
              <select
                value={targetNode}
                onChange={(e) => {
                  setTargetNode(e.target.value);
                  if (onHighlightPath) onHighlightPath(computedPath);
                }}
                className="bg-[#0f172a] border border-indigo-500/50 rounded px-2.5 py-1 text-slate-100 text-[10px] focus:outline-none focus:border-indigo-400 font-bold"
              >
                {Object.values(substations).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.voltageLevelKV}kV)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-indigo-300 font-bold">
              Path Hops: {computedPath.length - 1} | Interconnecting Nodes: {computedPath.join(' ➔ ')}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Graph SVG Topology Surface */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-4">
        
        {/* Topology Background Grid Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <svg viewBox="0 0 840 540" className="w-full h-full relative z-10">
          <defs>
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>

            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Graph Edges / Transmission Interconnections */}
          {graphState.lines.map(line => {
            const fromSub = substations[line.fromSubstationId];
            const toSub = substations[line.toSubstationId];
            if (!fromSub || !toSub) return null;

            const isPathEdge = computedPath.includes(line.fromSubstationId) && computedPath.includes(line.toSubstationId);
            
            const strokeColor = 
              line.state === 'CRITICAL' ? '#f43f5e' :
              line.voltageKV === 500 ? '#fbbf24' :
              line.voltageKV === 400 ? '#00e1ff' :
              line.voltageKV === 220 ? '#c084fc' : '#34d399';

            return (
              <g key={line.id} className="cursor-pointer">
                {/* Edge line */}
                <line
                  x1={fromSub.coordinates.x * 1.35}
                  y1={fromSub.coordinates.y * 1.15}
                  x2={toSub.coordinates.x * 1.35}
                  y2={toSub.coordinates.y * 1.15}
                  stroke={isPathEdge ? '#6366f1' : strokeColor}
                  strokeWidth={isPathEdge ? 3.5 : line.voltageKV >= 400 ? 2.2 : 1.5}
                  strokeOpacity={isPathEdge ? 1.0 : 0.65}
                  strokeDasharray={line.state === 'WARNING' ? '4 2' : 'none'}
                />

                {/* Animated Flow Pulse along active transmission line */}
                {line.currentLoadMW > 0 && (
                  <circle r={line.voltageKV >= 400 ? 2.5 : 1.8} fill={isPathEdge ? '#a5b4fc' : '#ffffff'}>
                    <animateMotion
                      path={`M ${fromSub.coordinates.x * 1.35} ${fromSub.coordinates.y * 1.15} L ${toSub.coordinates.x * 1.35} ${toSub.coordinates.y * 1.15}`}
                      dur={`${Math.max(1.8, 6 - (line.currentLoadMW / 350))}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Midline Load Badge */}
                <text
                  x={(fromSub.coordinates.x * 1.35 + toSub.coordinates.x * 1.35) / 2}
                  y={(fromSub.coordinates.y * 1.15 + toSub.coordinates.y * 1.15) / 2 - 4}
                  fill="#94a3b8"
                  fontSize="7.5"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                >
                  {line.voltageKV}kV ({line.currentLoadMW}MW)
                </text>
              </g>
            );
          })}

          {/* Graph Nodes / Substations */}
          {graphState.nodes.map(node => {
            const isSelected = selectedAssetId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isPathNode = computedPath.includes(node.id);

            const nodeColor = 
              node.state === 'CRITICAL' ? '#f43f5e' :
              node.state === 'CONGESTED' ? '#f97316' :
              node.state === 'WARNING' ? '#eab308' :
              node.voltageLevelKV === 500 ? '#fbbf24' :
              node.voltageLevelKV === 400 ? '#00e1ff' :
              node.voltageLevelKV === 220 ? '#c084fc' : '#34d399';

            return (
              <g
                key={node.id}
                transform={`translate(${node.coordinates.x * 1.35}, ${node.coordinates.y * 1.15})`}
                onClick={() => onSelectAsset(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer group"
              >
                {/* Outer Selection Highlight Ring */}
                {(isSelected || isPathNode) && (
                  <circle 
                    r="22" 
                    fill="none" 
                    stroke={isSelected ? '#00e1ff' : '#6366f1'} 
                    strokeWidth="2" 
                    strokeDasharray="4 2" 
                    className="animate-spin" 
                  />
                )}

                {/* SPOF Indicator Badge */}
                {node.singlePointOfFailure && (
                  <circle r="4" cy="-18" fill="#e11d48" className="animate-ping" />
                )}

                {/* Node Box */}
                <rect
                  x="-38"
                  y="-16"
                  width="76"
                  height="32"
                  rx="6"
                  fill="#0b1320"
                  stroke={nodeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter="url(#node-glow)"
                />

                {/* Substation Name */}
                <text
                  textAnchor="middle"
                  y="-2"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {node.name?.split(' ')?.[0] || node.name || 'Substation'}
                </text>

                {/* Voltage & Capacity Stats */}
                <text
                  textAnchor="middle"
                  y="9"
                  fill={nodeColor}
                  fontSize="7.5"
                  fontWeight="600"
                >
                  {node.voltageLevelKV}kV | {node.currentLoadMW}MW
                </text>

                {/* Hover Popover */}
                {isHovered && (
                  <g transform="translate(-75, -80)" className="pointer-events-none z-30">
                    <rect
                      width="150"
                      height="60"
                      rx="6"
                      fill="#0c1626"
                      stroke={nodeColor}
                      strokeWidth="1.5"
                      fillOpacity="0.98"
                    />
                    <text x="8" y="16" fill="#ffffff" fontSize="9" fontWeight="bold">
                      {node.name}
                    </text>
                    <text x="8" y="30" fill="#94a3b8" fontSize="8">
                      Load: {node.currentLoadMW} MW / {node.ratedCapacityMVA} MVA
                    </text>
                    <text x="8" y="42" fill="#94a3b8" fontSize="8">
                      Connected Substations: {node.connectedSubstations.length}
                    </text>
                    <text x="8" y="54" fill="#06b6d4" fontSize="7.5">
                      SPOF Risk: {node.singlePointOfFailure ? 'YES (High)' : 'NO (Redundant)'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
