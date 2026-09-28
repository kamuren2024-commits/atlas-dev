import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Minus,
  Navigation,
  MapPin,
  CheckSquare,
  Square
} from 'lucide-react';
import { MapLayerOption } from './types';

interface LiveProjectMapProps {
  layers: MapLayerOption[];
  onToggleLayer?: (layerId: string) => void;
  selectedProjectName?: string;
  selectedProgress?: number;
  onSelectProject?: (projectName: string) => void;
}

export const LiveProjectMap: React.FC<LiveProjectMapProps> = ({
  layers: initialLayers,
  onToggleLayer,
  selectedProjectName = 'Mombasa 400kV',
  selectedProgress = 53,
  onSelectProject
}) => {
  const [layers, setLayers] = useState<MapLayerOption[]>(initialLayers);
  const [zoom, setZoom] = useState(1);

  const toggle = (id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
    onToggleLayer?.(id);
  };

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 z-10">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Live Project Map
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">
            GIS spatial transmission corridors
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 1.8))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Reset Zoom"
          >
            1x
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-[180px] my-2 bg-[#05080e] rounded border border-slate-900 overflow-hidden">
        {/* Kenya stylized geography outline & grid */}
        <svg
          className="w-full h-full transition-transform duration-300 ease-out"
          viewBox="0 0 200 120"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Subtle territory contour */}
          <path
            d="M 50,20 Q 90,10 130,25 Q 170,40 160,80 Q 140,110 90,115 Q 40,100 35,60 Z"
            fill="#09111c"
            stroke="#17253b"
            strokeWidth="1"
          />

          {/* Grid lines */}
          <line x1="20" y1="30" x2="180" y2="30" stroke="#0e1726" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="20" y1="60" x2="180" y2="60" stroke="#0e1726" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="20" y1="90" x2="180" y2="90" stroke="#0e1726" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Major Transmission Corridors (Lines) */}
          <path
            d="M 60,70 L 95,65 L 145,95"
            fill="none"
            stroke="#00d9ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 95,65 L 110,40 L 140,35"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2 1"
          />
          <path
            d="M 75,50 L 95,65"
            fill="none"
            stroke="#34d399"
            strokeWidth="1"
          />

          {/* Nodes (Substations / Cities) */}
          <g
            transform="translate(60, 70)"
            className="cursor-pointer group"
            onClick={() => onSelectProject?.('Kisumu 220kV')}
          >
            <circle r="3" fill="#00d9ff" fillOpacity="0.4" />
            <circle r="1.5" fill="#00d9ff" />
            <text x="0" y="-4" fill="#94a3b8" fontSize="4" fontFamily="monospace" textAnchor="middle">
              Kisumu
            </text>
          </g>

          <g
            transform="translate(75, 50)"
            className="cursor-pointer group"
            onClick={() => onSelectProject?.('Rift Valley 220kV')}
          >
            <circle r="3" fill="#f59e0b" fillOpacity="0.5" />
            <circle r="1.5" fill="#f59e0b" />
            <text x="0" y="-4" fill="#cbd5e1" fontSize="4" fontFamily="monospace" textAnchor="middle">
              Rift Valley
            </text>
          </g>

          <g
            transform="translate(95, 65)"
            className="cursor-pointer group"
            onClick={() => onSelectProject?.('Nairobi Ring 132kV')}
          >
            <circle r="4" fill="#a855f7" fillOpacity="0.5" className="animate-ping" />
            <circle r="2.5" fill="#a855f7" />
            <text x="0" y="-5" fill="#f1f5f9" fontSize="4.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              Nairobi Hub
            </text>
          </g>

          <g
            transform="translate(145, 95)"
            className="cursor-pointer group"
            onClick={() => onSelectProject?.('Mombasa 400kV')}
          >
            <circle r="4" fill="#00d9ff" fillOpacity="0.6" className="animate-pulse" />
            <circle r="2" fill="#00d9ff" />
            <text x="0" y="-4" fill="#ffffff" fontSize="4.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              Mombasa
            </text>
          </g>

          <g
            transform="translate(140, 35)"
            className="cursor-pointer group"
            onClick={() => onSelectProject?.('Garissa-Isiolo 132kV')}
          >
            <circle r="2.5" fill="#38bdf8" fillOpacity="0.5" />
            <circle r="1.2" fill="#38bdf8" />
            <text x="0" y="-4" fill="#94a3b8" fontSize="3.8" fontFamily="monospace" textAnchor="middle">
              Garissa
            </text>
          </g>
        </svg>

        {/* Selected Project Callout Overlay */}
        <div className="absolute top-2 left-2 bg-slate-950/90 border border-cyan-500/40 rounded px-2.5 py-1 text-[10px] font-mono text-slate-200 shadow-md">
          <div className="text-cyan-400 font-bold">{selectedProjectName}</div>
          <div className="text-slate-400 flex items-center justify-between gap-2 mt-0.5">
            <span>Physical Progress</span>
            <span className="text-white font-bold">{selectedProgress}%</span>
          </div>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
          <span className="w-8 h-0.5 bg-slate-600 inline-block" />
          <span>50 km</span>
        </div>
      </div>

      {/* Layer Toggle Checkboxes */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => toggle(layer.id)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              layer.enabled
                ? 'bg-slate-900 text-slate-200 border border-slate-700'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: layer.color }}
            />
            <span>{layer.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
