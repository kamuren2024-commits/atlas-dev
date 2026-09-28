import React, { useState } from 'react';
import {
  Maximize2,
  Globe,
  Box,
  Plus,
  Minus,
  Crosshair,
  MoreHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { ConstellationNode, ConstellationEdge } from './types';

interface PortfolioConstellationProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  selectedNodeId?: string;
  onSelectNode?: (node: ConstellationNode) => void;
}

const TABS = [
  'Health',
  'Schedule',
  'Financial',
  'Supply',
  'Risk',
  'Geographic',
  'Strategic',
  'Dependencies'
];

export const PortfolioConstellation: React.FC<PortfolioConstellationProps> = ({
  nodes,
  edges,
  selectedNodeId = 'mombasa',
  onSelectNode
}) => {
  const [activeTab, setActiveTab] = useState('Health');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [showNodeDetail, setShowNodeDetail] = useState(false);

  const activeSelected = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Filter or highlight nodes based on active tab
  const getFilteredNodes = () => {
    if (activeTab === 'Risk') {
      return nodes.filter(n => n.status === 'CRITICAL' || n.status === 'AT_RISK');
    }
    if (activeTab === 'Schedule') {
      return nodes.filter(n => (n.delta && n.delta.includes('▼')) || n.progress < 70);
    }
    return nodes;
  };

  const displayedNodes = getFilteredNodes();

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Header & Controls */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div>
            <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Portfolio Constellation</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Project relationships, risk and strategic alignment
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                is3DMode
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Tactical 3D Projection"
            >
              3D {is3DMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Reset View"
            >
              <Crosshair className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowNodeDetail(prev => !prev)}
              className={`p-1 rounded border text-slate-400 hover:text-slate-200 cursor-pointer ${
                showNodeDetail ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800'
              }`}
              title="Toggle Selected Node Inspector"
            >
              <Layers className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar text-[10px] font-mono">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Topology Graph SVG Canvas */}
      <div
        className="relative w-full h-[220px] md:h-[240px] my-1 bg-[#06090e]/60 rounded border border-slate-900 overflow-hidden select-none"
        style={{ perspective: is3DMode ? '800px' : 'none' }}
      >
        {/* Subtle grid background lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0, 217, 255, 0.25) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg
          className="w-full h-full transition-transform duration-500 ease-out"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: `scale(${zoomLevel}) ${is3DMode ? 'rotateX(20deg) rotateY(-5deg) scale(0.95)' : ''}`,
            transformOrigin: 'center'
          }}
        >
          <defs>
            <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="dashedBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Render edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isDependency = edge.type === 'dependency';

            return (
              <line
                key={edge.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isDependency ? 'url(#cyanLine)' : 'url(#dashedBlue)'}
                strokeWidth={isDependency ? '0.6' : '0.5'}
                strokeDasharray={isDependency ? 'none' : '1.5 1'}
              />
            );
          })}

          {/* Render nodes */}
          {displayedNodes.map(node => {
            const isSelected = node.id === selectedNodeId;
            const isHovered = hoveredNode?.id === node.id;

            let haloColor = 'rgba(16, 185, 129, 0.4)';
            let coreColor = '#10b981';

            if (node.status === 'CRITICAL') {
              haloColor = 'rgba(244, 63, 94, 0.5)';
              coreColor = '#f43f5e';
            } else if (node.status === 'AT_RISK') {
              haloColor = 'rgba(245, 158, 11, 0.5)';
              coreColor = '#f59e0b';
            } else if (node.id === 'nairobi') {
              haloColor = 'rgba(0, 217, 255, 0.5)';
              coreColor = '#00d9ff';
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform"
                onClick={() => {
                  onSelectNode?.(node);
                  setShowNodeDetail(true);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Glow Halo */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 4.5 : isHovered ? 3.5 : 2.5}
                  fill={haloColor}
                  className="animate-pulse"
                />

                {/* Core Node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 2 : 1.4}
                  fill={coreColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '0.4' : '0.2'}
                />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 3.8}
                  fill={isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize="2.2"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.name}
                </text>

                {node.delta && (
                  <text
                    x={node.x}
                    y={node.y + 6.2}
                    fill={node.delta.includes('▲') ? '#34d399' : '#f87171'}
                    fontSize="1.7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.delta}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip Overlay */}
        {hoveredNode && !showNodeDetail && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-950/90 border border-cyan-500/40 rounded px-2 py-1 text-[10px] font-mono text-slate-200 shadow-lg backdrop-blur-sm"
            style={{
              left: `${Math.min(hoveredNode.x, 75)}%`,
              top: `${Math.min(hoveredNode.y - 10, 65)}%`
            }}
          >
            <div className="font-bold text-cyan-400">{hoveredNode.name}</div>
            <div className="text-slate-400 text-[9px]">
              {hoveredNode.voltage} • {hoveredNode.stage}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span>Confidence: {hoveredNode.confidence}%</span>
              <span>Progress: {hoveredNode.progress}%</span>
            </div>
          </div>
        )}

        {/* Selected Node Inspector Drawer / Flyout */}
        {showNodeDetail && activeSelected && (
          <div className="absolute top-2 right-2 z-20 w-52 bg-slate-950/95 border border-cyan-500/50 rounded-lg p-2.5 shadow-2xl backdrop-blur-md text-xs font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-400 truncate">{activeSelected.name}</span>
              <button
                onClick={() => setShowNodeDetail(false)}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ×
              </button>
            </div>
            <div className="space-y-1.5 mt-2 text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>Voltage Rating:</span>
                <span className="text-white font-semibold">{activeSelected.voltage}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PDS Stage:</span>
                <span className="text-cyan-300 font-semibold">{activeSelected.stage}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Confidence:</span>
                <span className="text-emerald-400 font-bold">{activeSelected.confidence}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Physical Progress:</span>
                <span className="text-white font-bold">{activeSelected.progress}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Risks:</span>
                <span className={activeSelected.activeRiskCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {activeSelected.activeRiskCount}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectNode?.(activeSelected)}
              className="w-full mt-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[10px] text-cyan-300 font-bold transition-colors cursor-pointer"
            >
              Focus in Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Healthy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            At Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Critical
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            Dependency
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-3 h-0.5 border-t border-dashed border-blue-400 inline-block" />
            Strategic Link
          </span>
        </div>
      </div>
    </div>
  );
};
