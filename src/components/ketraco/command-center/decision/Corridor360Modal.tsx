// Corridor360Modal - KETRACO Phase 06 Unified 11-Section Corridor 360 Operational Profile

import React from 'react';
import { 
  X, 
  Flame, 
  Activity, 
  CloudSun, 
  Layers, 
  GitPullRequest, 
  ShieldAlert, 
  Eye, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Compass, 
  Thermometer 
} from 'lucide-react';
import { Corridor360Profile } from './types';

interface Corridor360ModalProps {
  profile: Corridor360Profile;
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulationLab?: (scenarioId?: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function Corridor360Modal({
  profile,
  isOpen,
  onClose,
  onOpenSimulationLab,
  onOpenDecisionBrief
}: Corridor360ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#070e1c] border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden font-mono text-slate-200 text-xs">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a1426] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  CORRIDOR 360 PROFILE
                </span>
                <span className="text-[10px] text-slate-400">{profile.voltageLevelKV} kV EHV</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400">{profile.lengthKm} km</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100">{profile.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-[10px] hidden sm:block">
              <div className="text-purple-300 font-bold">STATUS: {profile.congestionStatus}</div>
              <div className="text-slate-400">RISK: {profile.risk.overallCorridorRiskScore}/100</div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: 11 Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* 1. Real-Time Flow & Dynamic Line Rating Headroom */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">ACTIVE POWER FLOW</div>
              <div className="text-sm font-bold text-cyan-300">{profile.currentFlowMW} MW</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">NOMINAL RATING</div>
              <div className="text-sm font-bold text-slate-200">{profile.nominalRatingMVA} MVA</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">DYNAMIC RATING (IEEE 738)</div>
              <div className="text-sm font-bold text-purple-400">{profile.dynamicLineRatingMVA} MVA</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">THERMAL HEADROOM</div>
              <div className={`text-sm font-bold ${profile.thermalHeadroomMW < 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {profile.thermalHeadroomMW} MW ({profile.thermalHeadroomPct}%)
              </div>
            </div>
          </div>

          {/* 2. Corridor Weather & Convective Cooling De-rating */}
          <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
              MICRO-CLIMATE WEATHER & DLR SENSOR INTELLIGENCE
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">Ambient Temp:</span> <strong>{profile.weather.ambientTempC}°C</strong>
              </div>
              <div>
                <span className="text-slate-400">Cross-Wind:</span> <strong>{profile.weather.windSpeedMS} m/s</strong>
              </div>
              <div>
                <span className="text-slate-400">Solar Radiation:</span> <strong>{profile.weather.solarRadiationWM2} W/m²</strong>
              </div>
              <div>
                <span className="text-slate-400">DLR Ampacity Impact:</span>{' '}
                <strong className={profile.weather.dlrGainMW < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {profile.weather.dlrGainMW} MW
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Dependencies & Critical Customers */}
          <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">SYSTEM DEPENDENCY & DOWNSTREAM SINKS</div>
            <div className="text-slate-300">
              <span className="text-slate-400">Generation Evacuated:</span>{' '}
              <strong className="text-amber-400">{profile.dependencies.evacuatesGenerationMW} MW</strong> (Olkaria / Moyale)
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Supplies Load Hubs:</span> {profile.dependencies.suppliesDemandHubs.join(', ')}
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Critical Infrastructure:</span> {profile.dependencies.criticalDownstreamCustomers}
            </div>
          </div>

          {/* 4. N-1 Contingency Vulnerability & Alternative Routing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* N-1 Security */}
            <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-rose-400 uppercase">N-1 CONTINGENCY SECURITY</div>
              <div className="flex justify-between">
                <span className="text-slate-400">N-1 Survived:</span>
                <span className={profile.nMinusOneStatus.trippingSurvivesN1 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {profile.nMinusOneStatus.trippingSurvivesN1 ? 'YES' : 'NO (VIOLATION)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overload Corridor:</span>
                <span className="text-slate-200">{profile.nMinusOneStatus.contingencyOverloadCorridor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Post-Trip Flow:</span>
                <span className="text-rose-400 font-bold">{profile.nMinusOneStatus.postTripLoadingPct}%</span>
              </div>
            </div>

            {/* Alternative Routing */}
            <div className="p-3 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-cyan-400 uppercase">ALTERNATIVE POWER TRANSFER PATHS</div>
              {profile.alternativePaths.map((alt, i) => (
                <div key={i} className="p-1.5 rounded bg-slate-950/60 text-[10.5px]">
                  <div className="text-slate-200 font-bold">{alt.pathName}</div>
                  <div className="text-slate-400">
                    Available: <strong className="text-emerald-400">{alt.availableCapacityMW} MW</strong> • Impedance: {alt.transferImpedancePU} pu
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a1426] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onOpenSimulationLab?.('SCEN_SUSWA_T1_TRIP')}
            className="px-3 py-1.5 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            SIMULATE LINE TRIP (N-1)
          </button>

          <button
            onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            DISPATCH INTERVENTION
          </button>
        </div>

      </div>
    </div>
  );
}
