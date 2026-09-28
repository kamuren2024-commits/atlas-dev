import React, { useState } from 'react';
import { Map, Pin, Compass, Info, Warehouse, Activity, CheckCircle, RefreshCw } from 'lucide-react';

interface WarehouseMapPanelProps {
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  onAskCopilot: (prompt: string) => void;
}

export default function WarehouseMapPanel({
  selectedWarehouseId,
  setSelectedWarehouseId,
  onAskCopilot
}: WarehouseMapPanelProps) {
  // Interactive warehouse nodes coordinates matching KETRACO regional map depots
  const warehouseNodes = [
    { id: 'central-wh', name: 'Nairobi Infill National Hub', type: 'NATIONAL_HUB', capacityTotal: 12000, capacityUsed: 8160, latitude: -1.2921, longitude: 36.8219, status: 'optimal', details: 'Holds all central high tension transformers and circuit breakers.' },
    { id: 'cable-depot', name: 'Mombasa Marine Port Depot', type: 'REGIONAL_DEPOT', capacityTotal: 8000, capacityUsed: 6560, latitude: -4.0435, longitude: 39.6682, status: 'warning', details: 'Corrosion isolation protocols active. Holds major XLPE conductor imports.' },
    { id: 'transformer-yard', name: 'Isinya Grid Terminal Yard', type: 'SITE_LAYDOWN', capacityTotal: 5000, capacityUsed: 3700, latitude: -1.6789, longitude: 36.8524, status: 'optimal', details: 'Continuous nitrogen charging security bays for gantry parts.' },
    { id: 'project-a', name: 'Suswa Lot-4 Link Laydown', type: 'SITE_LAYDOWN', capacityTotal: 3000, capacityUsed: 1050, latitude: -1.1444, longitude: 36.3211, status: 'normal', details: 'Active high transmission assembly steel yard. Rapid consumption.' },
    { id: 'project-b', name: 'Mariakani Excavation Site Store', type: 'BIN_ZONE', capacityTotal: 2000, capacityUsed: 440, latitude: -3.8562, longitude: 39.4791, status: 'critical', details: 'Auxiliary grounding spares. Severe local buffer stock depletion.' }
  ];

  const activeNode = warehouseNodes.find(node => node.id === selectedWarehouseId) || warehouseNodes[0];

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Map className="w-5 h-5 text-cyan-405" />
          Warehouse Network Hierarchy & Spatial Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Geospatial layer routing and volumetric capacity monitoring across KETRACO warehouses (National Hub → Regional Depot → Laydown Site → Storage Bin).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Hand: Geospatial Node Map (7 columns) */}
        <div className="xl:col-span-7 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 relative min-h-[350px] flex flex-col justify-between">
          <div className="flex justify-between items-baseline z-10">
            <span className="text-[10px] font-mono text-cyan-405 uppercase font-bold tracking-wider">
              INTERACTIVE GEOSPATIAL VECTOR PLANE (KENYA GRID)
            </span>
            <span className="text-[9.5px] font-mono text-slate-500">MERCATOR REF = EPSG:3857</span>
          </div>

          {/* Graphical Mock Grid representation representing the National Grid Layout */}
          <div className="absolute inset-0 m-12 border border-dashed border-indigo-950/25 rounded-2xl bg-[#0c1223] overflow-hidden flex items-center justify-center">
            {/* Visual grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a2647_1px,transparent_1px),linear-gradient(to_bottom,#1a2647_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />
            
            {/* Vector connect lines between nodes just for decoration */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <line x1="25%" y1="55%" x2="44%" y2="32%" stroke="#00D9FF" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="44%" y1="32%" x2="62%" y2="45%" stroke="#00D9FF" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="62%" y1="45%" x2="74%" y2="64%" stroke="#00D9FF" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="62%" y1="45%" x2="50%" y2="78%" stroke="#00D9FF" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Render Nodes as Map pins on grid coordinates */}
            {warehouseNodes.map((node, i) => {
              // Custom map coordinators positioning matching mockup aesthetics
              const positioning = [
                { id: 'central-wh', left: '25%', top: '55%' },
                { id: 'cable-depot', left: '44%', top: '32%' },
                { id: 'transformer-yard', left: '62%', top: '45%' },
                { id: 'project-a', left: '74%', top: '64%' },
                { id: 'project-b', left: '50%', top: '78%' }
              ];
              const coords = positioning.find(p => p.id === node.id) || { left: '50%', top: '50%' };
              const isSelected = selectedWarehouseId === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedWarehouseId(node.id)}
                  style={{ left: coords.left, top: coords.top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10 transition-all cursor-pointer"
                >
                  <Pin className={`w-6 h-6 transition-transform group-hover:scale-125 ${
                    isSelected 
                      ? 'text-[#00D9FF] drop-shadow-[0_0_10px_#00d9ff]' 
                      : node.status === 'warning'
                        ? 'text-amber-500'
                        : node.status === 'critical'
                          ? 'text-rose-500'
                          : 'text-indigo-400'
                  }`} />
                  <span className={`text-[7.5px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded uppercase border whitespace-nowrap ${
                    isSelected 
                      ? 'bg-slate-950 text-[#00D9FF] border-[#00D9FF]/40' 
                      : 'bg-slate-900/90 text-slate-400 border-slate-800'
                  }`}>
                    {node.id.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="z-10 flex justify-between items-baseline text-[10px] font-mono text-slate-500 pt-72">
            <span>Coordinates: Equidistant Projections</span>
            <span>Map Grid Ready: GIS Layers Loaded</span>
          </div>
        </div>

        {/* Right Hand: Volumetric Vol and Layout metadata (5 columns) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-wider font-extrabold pb-2 border-b border-indigo-950/25">
              WAREHOUSE CONTEXT METADATA
            </span>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-950 to-slate-900 border border-cyan-500/20 rounded-xl">
                <Warehouse className="text-cyan-405 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-extrabold text-white uppercase">{activeNode.id}</h3>
                <span className="text-[10.5px] font-extrabold text-slate-200 mt-1 block">{activeNode.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {activeNode.details}
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Volumetric Utilization Capacity</span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-[11px] font-mono text-slate-400">
                  <span>Usage density</span>
                  <span className="text-white font-bold">{Math.round((activeNode.capacityUsed / activeNode.capacityTotal) * 100)}% Used</span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      activeNode.status === 'critical' ? 'bg-rose-500' : activeNode.status === 'warning' ? 'bg-amber-500' : 'bg-cyan-405'
                    }`} 
                    style={{ width: `${(activeNode.capacityUsed / activeNode.capacityTotal) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-baseline text-[9.5px] font-mono text-slate-500">
                  <span>{activeNode.capacityUsed} m³ Used</span>
                  <span>{activeNode.capacityTotal} m³ Total Volume</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-500 block">TIER CLASSIFICATION</span>
                <span className="text-white font-bold tracking-wider font-mono text-[10.5px]">{activeNode.type}</span>
              </div>
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-500 block">GEOLOCATION DATA</span>
                <span className="text-cyan-400 font-bold font-mono text-[10px]">{activeNode.latitude}° N, {activeNode.longitude}° E</span>
              </div>
            </div>

            <button 
              onClick={() => onAskCopilot(`Provide safety stock audit summaries and capacity forecast for warehouse yard: ${activeNode.name}`)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-[#00D9FF] border border-cyan-500/20 rounded-xl text-xs font-mono font-bold"
            >
              RETRIEVE DEPOT PERFORMANCE REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
