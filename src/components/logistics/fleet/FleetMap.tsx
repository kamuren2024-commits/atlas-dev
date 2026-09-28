/**
 * KETRACO Transmission Grid & Fleet Live Map
 * Implements Section 04, 05, 07: Live Fleet Map with Substation Nodes,
 * Corridor Bottlenecks, and Vehicle Telemetry Beacons
 */

import React, { useState } from 'react';
import {
  MapPin, ShieldAlert, Navigation, Zap, Layers, Info, CheckCircle2, AlertTriangle
} from 'lucide-react';
import type { VehicleOperationalState } from '../../../../backend/domains/logistics/providers/types';

interface SubstationNode {
  code: string;
  name: string;
  voltageKv: number;
  region: string;
  lat: number;
  lng: number;
  isConverterStation: boolean;
}

interface CorridorBottleneck {
  id: string;
  name: string;
  corridorName: string;
  lat: number;
  lng: number;
  maxWeightTons: number;
  maxClearanceM: number;
  restrictionType: string;
}

interface FleetMapProps {
  vehicles: VehicleOperationalState[];
  selectedVehicle: VehicleOperationalState | null;
  onSelectVehicle: (v: VehicleOperationalState) => void;
  substations: SubstationNode[];
  bottlenecks: CorridorBottleneck[];
  providerMetadata?: { mode: string; apiKeyConfigured: boolean };
}

export const FleetMap: React.FC<FleetMapProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  substations,
  bottlenecks,
  providerMetadata
}) => {
  const [showSubstations, setShowSubstations] = useState(true);
  const [showBottlenecks, setShowBottlenecks] = useState(true);
  const [showTrafficCorridors, setShowTrafficCorridors] = useState(true);

  // Kenya Bounds for Map Canvas Projection
  // Latitude: -4.8 to 4.2 (South to North)
  // Longitude: 33.8 to 41.8 (West to East)
  const minLat = -4.8;
  const maxLat = 4.2;
  const minLng = 33.8;
  const maxLng = 41.8;

  const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
    // Normalization to 0-100 percentage
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y))
    };
  };

  return (
    <div className="relative w-full h-full bg-[#05111d] rounded-xl overflow-hidden border border-slate-800/80 flex flex-col select-none">
      {/* Map Control Bar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/70 rounded-lg p-1.5 text-xs text-slate-300 shadow-xl">
        <button
          onClick={() => setShowSubstations(!showSubstations)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            showSubstations ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Zap size={13} className="text-cyan-400" />
          <span>Substations ({substations.length})</span>
        </button>

        <button
          onClick={() => setShowBottlenecks(!showBottlenecks)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            showBottlenecks ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <ShieldAlert size={13} className="text-amber-400" />
          <span>Bridges & Bottlenecks ({bottlenecks.length})</span>
        </button>

        <button
          onClick={() => setShowTrafficCorridors(!showTrafficCorridors)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            showTrafficCorridors ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Layers size={13} className="text-indigo-400" />
          <span>National Grid Corridors</span>
        </button>
      </div>

      {/* Provider Metadata Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${providerMetadata?.apiKeyConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
        <span className="font-medium">
          {providerMetadata?.apiKeyConfigured ? 'Live Google Maps Platform' : 'KETRACO High-Fidelity GIS Engine'}
        </span>
      </div>

      {/* Map Interactive Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Kenya Cartographic Base Grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 58, 95, 0.25)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Kenya Boundary outline hint */}
          <path
            d="M 28% 15% L 48% 10% L 62% 22% L 75% 35% L 85% 55% L 72% 85% L 65% 92% L 50% 88% L 35% 82% L 22% 70% L 15% 50% Z"
            fill="rgba(6, 30, 56, 0.28)"
            stroke="rgba(14, 165, 233, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Major High-Voltage Grid Lines & Transport Corridors */}
          {showTrafficCorridors && (
            <g strokeWidth="2" opacity="0.65">
              {/* Mombasa-Nairobi-Suswa 400kV line */}
              <line x1="72%" y1="88%" x2="42%" y2="60%" stroke="#0ea5e9" strokeDasharray="3 3" />
              <line x1="42%" y1="60%" x2="35%" y2="56%" stroke="#0ea5e9" strokeDasharray="3 3" />
              {/* Suswa-Lessos-Kisumu line */}
              <line x1="35%" y1="56%" x2="25%" y2="44%" stroke="#0ea5e9" strokeDasharray="3 3" />
              <line x1="25%" y1="44%" x2="18%" y2="48%" stroke="#0ea5e9" strokeDasharray="3 3" />
              {/* Suswa-Loiyangalani 400kV Line */}
              <line x1="35%" y1="56%" x2="40%" y2="18%" stroke="#10b981" strokeDasharray="4 4" />
            </g>
          )}

          {/* Selected Vehicle Route Vector if in transit */}
          {selectedVehicle?.telemetry && (
            <circle
              cx={`${projectCoords(selectedVehicle.telemetry.latitude, selectedVehicle.telemetry.longitude).x}%`}
              cy={`${projectCoords(selectedVehicle.telemetry.latitude, selectedVehicle.telemetry.longitude).y}%`}
              r="24"
              fill="rgba(14, 165, 233, 0.15)"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              className="animate-ping"
            />
          )}
        </svg>

        {/* Transmission Substations */}
        {showSubstations && substations.map(s => {
          const pos = projectCoords(s.lat, s.lng);
          return (
            <div
              key={s.code}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-125 transition-transform">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-cyan-500/40 rounded px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                  <div className="font-bold text-cyan-300">{s.name}</div>
                  <div className="text-slate-400">{s.voltageKv}kV • {s.region}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Corridor Bottlenecks & Bridge Load Limits */}
        {showBottlenecks && bottlenecks.map(b => {
          const pos = projectCoords(b.lat, b.lng);
          return (
            <div
              key={b.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-125 transition-transform">
                  <AlertTriangle size={10} className="text-amber-300" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-amber-500/40 rounded px-2.5 py-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl max-w-xs text-left">
                  <div className="font-bold text-amber-300">{b.name}</div>
                  <div className="text-slate-300 text-[10px]">Max Load: {b.maxWeightTons} Tons • Clearance: {b.maxClearanceM}m</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">{b.corridorName}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Fleet Vehicles Markers */}
        {vehicles.map(v => {
          const pos = projectCoords(v.telemetry.latitude, v.telemetry.longitude);
          const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
          const isLive = v.telemetry.freshness === 'LIVE';
          const isMoving = v.status === 'IN_TRANSIT' || v.status === 'MOVING';

          return (
            <div
              key={v.vehicleId}
              onClick={() => onSelectVehicle(v)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform z-20 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div className="relative flex flex-col items-center">
                {/* Heading Arrow indicator if moving */}
                {isMoving && (
                  <div
                    style={{ transform: `rotate(${v.telemetry.heading || 0}deg)` }}
                    className="absolute -top-3 text-cyan-400 transition-transform"
                  >
                    <Navigation size={10} className="fill-cyan-400" />
                  </div>
                )}

                {/* Marker Body */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shadow-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-500/40'
                      : isMoving
                      ? 'bg-cyan-600 text-white border-cyan-300'
                      : v.status === 'MAINTENANCE'
                      ? 'bg-rose-600 text-white border-rose-300'
                      : 'bg-emerald-600 text-white border-emerald-300'
                  }`}
                >
                  {v.code.replace('KET-FLT-', '')}
                </div>

                {/* Live Telemetry Freshness Pulse Beacon */}
                {isLive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900"></span>
                  </span>
                )}

                {/* Callout Tag */}
                <div
                  className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap border shadow-md ${
                    isSelected
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 font-bold'
                      : 'bg-slate-900/85 text-slate-300 border-slate-700'
                  }`}
                >
                  {v.licensePlate}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Footer Legend */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available / Staged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Bridge Weight Limitation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>Lat: -4.8° to +4.2° • Lng: 33.8° to 41.8°</span>
        </div>
      </div>
    </div>
  );
};
