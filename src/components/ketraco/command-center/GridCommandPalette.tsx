import React, { useState, useEffect } from 'react';
import { 
  Search, Zap, Layers, Network, ShieldCheck, AlertTriangle, 
  MapPin, Sliders, X, ArrowRight, Activity, Cpu, Sparkles
} from 'lucide-react';
import { GridAsset, TransmissionLine, OperationalViewMode } from './types';

interface GridCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  onSelectAsset: (assetId: string) => void;
  onSetOperationalMode: (mode: OperationalViewMode) => void;
  onOpenResilienceModal: () => void;
  onOpenSystemHealth: () => void;
  onToggleSimulation: () => void;
}

export default function GridCommandPalette({
  isOpen,
  onClose,
  substations,
  lines,
  onSelectAsset,
  onSetOperationalMode,
  onOpenResilienceModal,
  onOpenSystemHealth,
  onToggleSimulation
}: GridCommandPaletteProps) {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subList = Object.values(substations);
  const lineList = Object.values(lines);

  // Filter actions and entities
  const filteredSubstations = subList.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.code.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLines = lineList.filter(l => 
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md p-4 select-none">
      
      {/* Modal Dialog */}
      <div className="w-full max-w-2xl bg-[#0b1424] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono flex flex-col">
        
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-[#0d182a]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search national grid asset... (e.g. 'Suswa', '400kV', 'Resilience', '3D')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list content */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3 text-xs">
          
          {/* Quick System Operational Actions */}
          <div className="space-y-1">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
              Grid Operations Commands
            </span>
            
            <button
              onClick={() => { onSetOperationalMode('NORMAL'); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Open 2D GIS National Map View</span>
              </div>
              <span className="text-[10px] text-slate-400">View</span>
            </button>

            <button
              onClick={() => { onSetOperationalMode('3D_TWIN'); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Open 3D Substation Digital Twin</span>
              </div>
              <span className="text-[10px] text-slate-400">Switchyard Twin</span>
            </button>

            <button
              onClick={() => { onSetOperationalMode('GRAPH_TOPOLOGY'); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span>Open Electrical Graph Topology & Path Tracer</span>
              </div>
              <span className="text-[10px] text-slate-400">Graph</span>
            </button>

            <button
              onClick={() => { onSetOperationalMode('DATA_QUALITY'); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Open Grid Data Quality & Multi-Source Reconciliation Engine</span>
              </div>
              <span className="text-[10px] text-slate-400">Reconciliation</span>
            </button>

            <button
              onClick={() => { onOpenResilienceModal(); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Run N-1 Grid Contingency & Resilience Analysis</span>
              </div>
              <span className="text-[10px] text-slate-400">Contingency</span>
            </button>

            <button
              onClick={() => { onToggleSimulation(); onClose(); }}
              className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>Toggle Live SCADA vs Simulation Mode</span>
              </div>
              <span className="text-[10px] text-slate-400">Mode</span>
            </button>
          </div>

          {/* Substations Results */}
          {filteredSubstations.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                Substations ({filteredSubstations.length})
              </span>
              {filteredSubstations.slice(0, 5).map(sub => (
                <button
                  key={sub.id}
                  onClick={() => { onSelectAsset(sub.id); onClose(); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-bold">{sub.name}</span>
                    <span className="text-[10px] text-slate-400">({sub.voltageLevelKV}kV)</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold">{sub.currentLoadMW} MW</span>
                </button>
              ))}
            </div>
          )}

          {/* Lines Results */}
          {filteredLines.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                Transmission Corridors ({filteredLines.length})
              </span>
              {filteredLines.slice(0, 4).map(line => (
                <button
                  key={line.id}
                  onClick={() => { onSelectAsset(line.fromSubstationId); onClose(); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold">{line.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-300">{line.currentLoadMW} MW ({line.loadingPct}%)</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#09101d] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
}
