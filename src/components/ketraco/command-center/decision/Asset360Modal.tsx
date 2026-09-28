// Asset360Modal - KETRACO Phase 06 Unified 14-Section Operational Asset 360 Dossier

import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Zap, 
  Clock, 
  Box, 
  Share2, 
  Layers, 
  Database, 
  Cpu, 
  CheckCircle2, 
  FileText,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Asset360Profile } from './types';

interface Asset360ModalProps {
  profile: Asset360Profile;
  isOpen: boolean;
  onClose: () => void;
  onOpen3DTwin?: (assetId: string) => void;
  onOpenMap?: (assetId: string) => void;
  onOpenGraph?: (assetId: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function Asset360Modal({
  profile,
  isOpen,
  onClose,
  onOpen3DTwin,
  onOpenMap,
  onOpenGraph,
  onOpenDecisionBrief
}: Asset360ModalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TELEMETRY' | 'MAINTENANCE' | 'TOPOLOGY' | 'CONTINGENCY'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#070e1c] border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden font-mono text-slate-200 text-xs">
        
        {/* Header */}
        <div className="px-5 py-3 bg-[#0a1426] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ASSET 360 PROFILE
                </span>
                <span className="text-[10px] text-slate-400">SCADA ID: {profile.provenance.scadaId}</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400">EAM: {profile.provenance.eamId}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100">{profile.identity.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-[10px] hidden sm:block">
              <div className="text-emerald-400 font-bold">HEALTH: {profile.health.overallHealthIndex}/100</div>
              <div className="text-slate-400">RUL: {profile.health.expectedRULMonths} months</div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-[#08101e] border-b border-slate-800/80 flex items-center gap-2 text-[11px] overflow-x-auto no-scrollbar">
          {(['OVERVIEW', 'TELEMETRY', 'MAINTENANCE', 'TOPOLOGY', 'CONTINGENCY'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 border-b-2 font-bold transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">VOLTAGE LEVEL</div>
                  <div className="text-sm font-bold text-cyan-400">{profile.identity.voltageLevelKV} kV</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">ACTIVE FLOW</div>
                  <div className="text-sm font-bold text-emerald-400">{profile.telemetry.activePowerMW} MW</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">THERMAL LOAD</div>
                  <div className={`text-sm font-bold ${profile.telemetry.thermalLoadingPct > 80 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {profile.telemetry.thermalLoadingPct}%
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">CRITICALITY TIER</div>
                  <div className="text-xs font-bold text-rose-400">{profile.identity.criticalityTier}</div>
                </div>
              </div>

              {/* Identity & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">ASSET SPECIFICATIONS</div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span>{profile.identity.manufacturer}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Model:</span>
                    <span>{profile.identity.model}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Commission Date:</span>
                    <span>{profile.identity.commissionDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Region / County:</span>
                    <span>{profile.identity.region} ({profile.identity.county})</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">GEOGRAPHY & TERRAIN</div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Coordinates:</span>
                    <span>{profile.location.latitude.toFixed(4)}, {profile.location.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Elevation:</span>
                    <span>{profile.location.elevationM} m ASL</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Terrain:</span>
                    <span>{profile.location.terrainType}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Nearest Hub:</span>
                    <span>{profile.location.nearestTown}</span>
                  </div>
                </div>
              </div>

              {/* Health & Risk */}
              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">HEALTH INDICES & PRIMARY THREAT</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-950/60">
                    <div className="text-slate-400 text-[10px]">DGA INDEX</div>
                    <div className="font-bold text-amber-400">{profile.health.dgaIndex} / 100</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60">
                    <div className="text-slate-400 text-[10px]">BREAKER WEAR</div>
                    <div className="font-bold text-slate-200">{profile.health.breakwearPct}%</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60">
                    <div className="text-slate-400 text-[10px]">DEGRADATION RATE</div>
                    <div className="font-bold text-rose-400">{profile.health.degradationRatePerYear}% / yr</div>
                  </div>
                </div>
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-800/40">
                  <strong>Primary Operational Threat:</strong> {profile.risk.primaryThreat}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TELEMETRY */}
          {activeTab === 'TELEMETRY' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">BUS VOLTAGE</div>
                  <div className="text-sm font-bold text-cyan-300">{profile.telemetry.voltageKV} kV</div>
                </div>
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">FREQUENCY</div>
                  <div className="text-sm font-bold text-emerald-300">{profile.telemetry.frequencyHz} Hz</div>
                </div>
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">REACTIVE POWER</div>
                  <div className="text-sm font-bold text-purple-300">{profile.telemetry.reactivePowerMVAR} MVAR</div>
                </div>
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">TOP OIL TEMP</div>
                  <div className="text-sm font-bold text-amber-400">{profile.telemetry.oilTempC}°C</div>
                </div>
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">WINDING HOTSPOT</div>
                  <div className="text-sm font-bold text-rose-400">{profile.telemetry.windingTempC}°C</div>
                </div>
                <div className="p-3 rounded bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">SF6 GAS PRESSURE</div>
                  <div className="text-sm font-bold text-slate-200">{profile.telemetry.sf6PressureBar} bar</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE (SAP EAM) */}
          {activeTab === 'MAINTENANCE' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400">SAP EAM WORK ORDER STATUS</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    profile.maintenance.serviceStatus === 'OVERDUE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {profile.maintenance.serviceStatus} ({profile.maintenance.daysOverdue} days)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400">Work Order No:</span> {profile.maintenance.sapWorkOrderNumber}
                  </div>
                  <div>
                    <span className="text-slate-400">Open Faults:</span> {profile.maintenance.openFaultNotificationsCount} notifications
                  </div>
                  <div>
                    <span className="text-slate-400">Last Serviced:</span> {profile.maintenance.lastServiceDate}
                  </div>
                  <div>
                    <span className="text-slate-400">Next Scheduled:</span> {profile.maintenance.nextScheduledServiceDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOPOLOGY */}
          {activeTab === 'TOPOLOGY' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-cyan-400 uppercase">CONNECTED CORRIDORS & ADJACENCIES</div>
                <div className="space-y-1 text-slate-300">
                  <div>
                    <span className="text-slate-400">Connected Lines:</span> {profile.topology.connectedLines.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-400">Connected Substations:</span> {profile.topology.connectedSubstations.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-400">Upstream Sources:</span> {profile.topology.upstreamSources.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-400">Downstream Sinks:</span> {profile.topology.downstreamSinks.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTINGENCY */}
          {activeTab === 'CONTINGENCY' && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">N-1 CONTINGENCY SIMULATION SCENARIOS</div>
              {profile.contingencies.map((c, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{c.scenario}</div>
                    <div className="text-slate-400 text-[10px]">
                      Voltage Drop: {c.voltageDropKV} kV • Redistribution: {c.lineLoadingRedistributionPct}%
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.cascadeRisk === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    Risk: {c.cascadeRisk}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Quick Links */}
        <div className="p-3 bg-[#0a1426] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenMap?.(profile.identity.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              GIS MAP
            </button>
            <button
              onClick={() => onOpen3DTwin?.(profile.identity.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Box className="w-3 h-3 text-purple-400" />
              3D TWIN
            </button>
            <button
              onClick={() => onOpenGraph?.(profile.identity.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-amber-400" />
              GRAPH
            </button>
          </div>

          <button
            onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            OPERATOR BRIEF
          </button>
        </div>

      </div>
    </div>
  );
}
