import React, { useState } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Flame, 
  Clock, 
  Wrench, 
  Play, 
  Activity, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';
import { PredictiveAssetWatchItem } from './types';
import { GridPredictiveWatchlist } from './predictive-watchlist';
import { GridAsset } from '../types';

interface PredictiveWatchlistViewProps {
  substations: Record<string, GridAsset>;
  onSelectAsset?: (assetId: string) => void;
  onSimulateOutage?: (scenarioId: string) => void;
}

export default function PredictiveWatchlistView({
  substations,
  onSelectAsset,
  onSimulateOutage
}: PredictiveWatchlistViewProps) {
  const [watchlist] = useState<PredictiveAssetWatchItem[]>(() =>
    GridPredictiveWatchlist.getWatchlist(substations)
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>(watchlist[0]?.id || 'suswa_t1');

  const selectedItem = watchlist.find(item => item.id === selectedAssetId) || watchlist[0];

  const trendBadge = (trend: PredictiveAssetWatchItem['degradationTrend']) => {
    switch (trend) {
      case 'ACCELERATING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <TrendingDown className="w-3 h-3" /> ACCELERATING
          </span>
        );
      case 'STEADY':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Activity className="w-3 h-3" /> STEADY
          </span>
        );
      case 'STABLE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-3 h-3" /> STABLE
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 space-y-4 font-mono">
      {/* Top Header */}
      <div className="bg-[#090e1a] border border-cyan-900/50 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-base font-bold tracking-wider text-slate-100">
              PREDICTIVE ASSET EARLY-FAILURE WATCHLIST
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              ONLINE DGA & THERMAL HEALTH MONITOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactively ranks high-voltage transformers and switchgear facing accelerated degradation before forced outages occur.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
          Monitored Fleet: <strong className="text-cyan-400">{watchlist.length} High-Voltage Assets</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Watchlist Ranking */}
        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-3 space-y-2 lg:col-span-1">
          <div className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
            RANKED ASSET FLEET BY RISK SCORE
          </div>

          <div className="space-y-2">
            {watchlist.map(item => {
              const isSel = item.id === selectedAssetId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/20'
                      : 'bg-[#050913] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold text-slate-400">{item.criticality.replace('_', ' ')}</span>
                    {trendBadge(item.degradationTrend)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Health: <strong className={item.healthIndex < 70 ? 'text-red-400' : 'text-amber-400'}>{item.healthIndex}/100</strong></span>
                    <span>Horizon: <strong className="text-cyan-400">{item.failureHorizon}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed DGA & Diagnostic Panel */}
        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-4 lg:col-span-2 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{selectedItem.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedItem.voltageKV} kV
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedItem.location}</p>
            </div>

            <div className="flex items-center gap-2">
              {onSimulateOutage && (
                <button
                  onClick={() => onSimulateOutage('SCEN_SUSWA_T1_TRIP')}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  Simulate Outage in Lab →
                </button>
              )}
            </div>
          </div>

          {/* Core Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded bg-[#050913] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Health Index</span>
              <span className={`text-xl font-bold font-mono ${selectedItem.healthIndex < 70 ? 'text-red-400' : 'text-amber-400'}`}>
                {selectedItem.healthIndex} / 100
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#050913] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Top-Oil Temp</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {selectedItem.topOilTempC} °C
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#050913] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Winding Hotspot</span>
              <span className="text-xl font-bold font-mono text-red-400">
                {selectedItem.windingHotSpotC} °C
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#050913] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Thermal Load</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {selectedItem.thermalExposurePct}%
              </span>
            </div>
          </div>

          {/* DGA Dissolved Gas Breakdown */}
          {selectedItem.type === 'TRANSFORMER' && (
            <div className="bg-[#050913] border border-slate-800 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
                <span className="font-bold text-slate-200">ONLINE DISSOLVED GAS ANALYSIS (DGA) SENSORS</span>
                <span className="text-[10px] text-cyan-400 font-mono">IEEE C57.104 Compliant</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">H₂ (Hydrogen)</span>
                  <span className="font-bold text-slate-200">{selectedItem.dgaGasPpm.h2} ppm</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">CH₄ (Methane)</span>
                  <span className="font-bold text-slate-200">{selectedItem.dgaGasPpm.ch4} ppm</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">C₂H₂ (Acetylene)</span>
                  <span className={`font-bold ${selectedItem.dgaGasPpm.c2h2 > 2 ? 'text-red-400' : 'text-slate-200'}`}>
                    {selectedItem.dgaGasPpm.c2h2} ppm
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">C₂H₄ (Ethylene)</span>
                  <span className="font-bold text-amber-400">{selectedItem.dgaGasPpm.c2h4} ppm</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">C₂H₆ (Ethane)</span>
                  <span className="font-bold text-slate-200">{selectedItem.dgaGasPpm.c2h6} ppm</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Total Gas (TCG)</span>
                  <span className="font-bold text-cyan-400">{selectedItem.dgaGasPpm.totalCombustibleGas} ppm</span>
                </div>
              </div>
            </div>
          )}

          {/* Degradation Drivers & Recommended Action */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-300 block mb-1.5">Top Degradation Drivers:</span>
              <ul className="space-y-1 text-slate-300">
                {selectedItem.topDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded bg-cyan-950/30 border border-cyan-900 text-cyan-200">
              <span className="font-bold block mb-1">Recommended Operator Action:</span>
              <span>{selectedItem.recommendedAction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
