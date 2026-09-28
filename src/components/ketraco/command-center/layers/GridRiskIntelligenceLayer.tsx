import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Zap, 
  ChevronRight, 
  Activity, 
  Search,
  ExternalLink,
  Target,
  Share2
} from 'lucide-react';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import ProvenanceTag from '../primitives/ProvenanceTag';
import { GridAsset, TransmissionLine } from '../types';
import { gridDataProvider } from '../providers/GridDataProvider';

interface GridRiskIntelligenceLayerProps {
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onTraceCorridor?: (corridorCode: string) => void;
}

export default function GridRiskIntelligenceLayer({
  substations,
  lines,
  selectedAssetId,
  onSelectAsset,
  onTraceCorridor
}: GridRiskIntelligenceLayerProps) {
  const [riskTab, setRiskTab] = useState<'MATRIX' | 'TOP_ASSETS' | 'TOP_CORRIDORS' | 'REGIONAL'>('MATRIX');
  const regionalMetrics = gridDataProvider.getRegionalHealth();

  // Top Critical Assets (ranked by combined Risk × Impact × Criticality)
  const criticalAssetsList = [
    { rank: '01', id: 'suswa', name: 'Suswa 500kV / 400kV Hub', type: 'SUBSTATION', location: 'Rift Valley (Narok)', health: 78, risk: 68, loadPct: 81.4, dependencies: 8, alarms: 2, confidence: 98.4 },
    { rank: '02', id: 'nairobi_ring', name: 'Nairobi 220kV Ring (Embakasi)', type: 'SUBSTATION', location: 'Nairobi Metro', health: 64, risk: 78, loadPct: 89.2, dependencies: 12, alarms: 3, confidence: 96.0 },
    { rank: '03', id: 'isinya', name: 'Isinya 400kV / 220kV Hub', type: 'SUBSTATION', location: 'Kajiado', health: 91, risk: 42, loadPct: 62.0, dependencies: 6, alarms: 0, confidence: 99.0 },
    { rank: '04', id: 'lessos', name: 'Lessos 400kV / 220kV Hub', type: 'SUBSTATION', location: 'Nandi (Western)', health: 88, risk: 48, loadPct: 69.5, dependencies: 5, alarms: 0, confidence: 97.8 },
    { rank: '05', id: 'loiyangalani', name: 'Loiyangalani 400kV Substation', type: 'SUBSTATION', location: 'Marsabit', health: 84, risk: 54, loadPct: 77.5, dependencies: 2, alarms: 0, confidence: 98.2 },
    { rank: '06', id: 'mariakani', name: 'Mariakani 400kV / 220kV Hub', type: 'SUBSTATION', location: 'Kilifi (Coast)', health: 94, risk: 32, loadPct: 54.0, dependencies: 4, alarms: 0, confidence: 99.1 },
    { rank: '07', id: 'olkaria', name: 'Olkaria 400kV Geothermal Ingest', type: 'GENERATOR', location: 'Nakuru', health: 96, risk: 14, loadPct: 64.2, dependencies: 3, alarms: 0, confidence: 99.2 },
    { rank: '08', id: 'moyale_hvdc', name: 'Moyale 500kV HVDC Terminal', type: 'HVDC_CONVERTER', location: 'Marsabit/Eth', health: 89, risk: 38, loadPct: 50.0, dependencies: 2, alarms: 0, confidence: 96.8 },
    { rank: '09', id: 'nairobi_north', name: 'Nairobi North 400kV Substation', type: 'SUBSTATION', location: 'Kiambu', health: 82, risk: 62, loadPct: 78.4, dependencies: 7, alarms: 1, confidence: 97.5 },
    { rank: '10', id: 'kamburu', name: 'Kamburu 220kV Hydro Interface', type: 'GENERATOR', location: 'Embu', health: 92, risk: 24, loadPct: 48.0, dependencies: 4, alarms: 0, confidence: 98.0 },
  ];

  // Top Critical Corridors
  const criticalCorridorsList = [
    { rank: '01', code: 'tl_ssw_nbn', name: 'Suswa – Nairobi North', voltage: '400 kV', loading: 78.4, headroomMW: 324, congestion: 'MODERATE', redundancy: 'N-1 Redundant', risk: 68 },
    { rank: '02', code: 'tl_emb_dan', name: 'Embakasi – Dandora Ring', voltage: '220 kV', loading: 89.2, headroomMW: 48, congestion: 'HIGH', redundancy: 'Single Tie Exposed', risk: 78 },
    { rank: '03', code: 'tl_loy_ssw', name: 'Loiyangalani – Suswa', voltage: '400 kV', loading: 77.5, headroomMW: 270, congestion: 'NORMAL', redundancy: 'Radial SPOF', risk: 62 },
    { rank: '04', code: 'tl_olk_ssw', name: 'Olkaria – Suswa Double Circuit', voltage: '400 kV', loading: 64.2, headroomMW: 859, congestion: 'LOW', redundancy: 'Dual Circuit', risk: 28 },
    { rank: '05', code: 'tl_ssw_isy', name: 'Suswa – Isinya Interconnect', voltage: '400 kV', loading: 62.0, headroomMW: 456, congestion: 'LOW', redundancy: 'N-1 Redundant', risk: 36 },
    { rank: '06', code: 'tl_isy_mar', name: 'Isinya – Mariakani Coastal Trunk', voltage: '400 kV', loading: 54.0, headroomMW: 552, congestion: 'LOW', redundancy: 'Dual Circuit', risk: 32 },
    { rank: '07', code: 'tl_olk_les', name: 'Olkaria – Lessos Western Trunk', voltage: '400 kV', loading: 69.5, headroomMW: 366, congestion: 'MODERATE', redundancy: 'Dual Circuit', risk: 48 },
    { rank: '08', code: 'tl_les_ksm', name: 'Lessos – Kisumu Regional', voltage: '220 kV', loading: 72.0, headroomMW: 98, congestion: 'MODERATE', redundancy: 'Single Line', risk: 54 },
    { rank: '09', code: 'tl_hvdc_eth_ken', name: 'Ethiopia – Kenya 500kV HVDC', voltage: '500 kV', loading: 50.0, headroomMW: 1000, congestion: 'LOW', redundancy: 'Bipole Redundant', risk: 38 },
    { rank: '10', code: 'tl_kam_nbn', name: 'Kamburu – Nairobi North', voltage: '220 kV', loading: 48.0, headroomMW: 187, congestion: 'LOW', redundancy: 'N-1 Redundant', risk: 24 },
  ];

  // Risk matrix points (Impact 1-10 vs Likelihood 1-10)
  const matrixPoints = [
    { id: 'nairobi_ring', label: 'Nairobi 220kV Ring', impact: 9.2, likelihood: 8.4, risk: 78, type: 'SUBSTATION' },
    { id: 'suswa', label: 'Suswa 500kV EHV Hub', impact: 9.8, likelihood: 6.8, risk: 68, type: 'SUBSTATION' },
    { id: 'nairobi_north', label: 'Nairobi North 400kV', impact: 8.5, likelihood: 7.2, risk: 62, type: 'SUBSTATION' },
    { id: 'loiyangalani', label: 'Loiyangalani 400kV Radial', impact: 7.8, likelihood: 6.9, risk: 54, type: 'SPOF' },
    { id: 'lessos', label: 'Lessos 400kV Hub', impact: 8.2, likelihood: 5.8, risk: 48, type: 'SUBSTATION' },
    { id: 'isinya', label: 'Isinya 400kV Hub', impact: 8.4, likelihood: 4.8, risk: 42, type: 'SUBSTATION' },
    { id: 'moyale_hvdc', label: 'Moyale 500kV HVDC', impact: 7.5, likelihood: 5.1, risk: 38, type: 'HVDC' },
    { id: 'mariakani', label: 'Mariakani 400kV Hub', impact: 7.9, likelihood: 4.0, risk: 32, type: 'SUBSTATION' },
    { id: 'kamburu', label: 'Kamburu 220kV Hydro', impact: 6.5, likelihood: 3.8, risk: 24, type: 'GENERATOR' },
    { id: 'olkaria', label: 'Olkaria 400kV Geothermal', impact: 9.0, likelihood: 1.6, risk: 14, type: 'GENERATOR' },
  ];

  return (
    <div id="level-4-risk" className="w-full bg-[#050913] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 4
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            National Grid Risk Matrix & Critical Asset Prioritization
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // 2D Likelihood × Impact Distribution, Top 10 Criticality & Regional Resilience
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setRiskTab('MATRIX')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              riskTab === 'MATRIX' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Risk Matrix
          </button>
          <button
            onClick={() => setRiskTab('TOP_ASSETS')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              riskTab === 'TOP_ASSETS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top 10 Assets
          </button>
          <button
            onClick={() => setRiskTab('TOP_CORRIDORS')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              riskTab === 'TOP_CORRIDORS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top 10 Corridors
          </button>
          <button
            onClick={() => setRiskTab('REGIONAL')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              riskTab === 'REGIONAL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Regional Grid Health
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {riskTab === 'MATRIX' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Interactive 2D Likelihood vs Impact Matrix Canvas (8 Cols) */}
          <div className="lg:col-span-8 bg-[#090e1a] border border-slate-800/90 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                National Grid Risk Coordinates (Likelihood vs Impact)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Click node to focus 2D Map & Asset Diagnostics
              </span>
            </div>

            {/* Matrix Visual Frame */}
            <div className="relative w-full h-80 bg-slate-950 rounded border border-slate-800/80 p-6 overflow-hidden">
              
              {/* Quadrant Background Colors */}
              <div className="absolute inset-6 grid grid-cols-2 grid-rows-2 opacity-20 pointer-events-none">
                <div className="border-r border-b border-slate-700 bg-amber-500/10" />
                <div className="border-b border-slate-700 bg-red-500/20" />
                <div className="border-r border-slate-700 bg-emerald-500/10" />
                <div className="bg-amber-500/10" />
              </div>

              {/* Y-Axis Label: Likelihood */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                ↑ LIKELIHOOD (PROBABILITY)
              </div>

              {/* X-Axis Label: Impact */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                IMPACT (SYSTEM SEVERITY) →
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-6 border border-slate-800">
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-slate-800/80 border-dashed" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-slate-800/80 border-dashed" />
              </div>

              {/* Matrix Points */}
              <div className="absolute inset-6">
                {matrixPoints.map((pt) => {
                  const xPct = ((pt.impact - 1) / 9) * 90 + 5;
                  const yPct = 95 - (((pt.likelihood - 1) / 9) * 90 + 5);
                  const isSelected = selectedAssetId === pt.id;

                  let color = 'bg-emerald-400 text-emerald-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
                  if (pt.risk > 70) color = 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse';
                  else if (pt.risk > 50) color = 'bg-amber-400 text-amber-950 shadow-[0_0_8px_rgba(245,158,11,0.8)]';

                  return (
                    <button
                      key={pt.id}
                      onClick={() => onSelectAsset(pt.id)}
                      style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform ${
                        isSelected ? 'scale-150 z-30' : 'hover:scale-125'
                      }`}
                      title={`${pt.label}: Impact ${pt.impact}/10 | Likelihood ${pt.likelihood}/10 (Risk Index: ${pt.risk})`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] font-mono ${color} border border-white/40`}>
                        {pt.risk}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-100 rounded text-[10px] font-mono whitespace-nowrap shadow-xl z-40 pointer-events-none">
                        <strong>{pt.label}</strong>
                        <div className="text-[9px] text-slate-400">Risk Score: {pt.risk} | Impact: {pt.impact}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Right Side Risk Breakdown Card (4 Cols) */}
          <div className="lg:col-span-4 bg-[#090e1a] border border-slate-800/90 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Critical Risk Exposures
            </h3>

            <div className="space-y-2">
              <div 
                onClick={() => onSelectAsset('nairobi_ring')}
                className="p-2.5 rounded bg-red-950/30 border border-red-500/40 hover:bg-red-950/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-300">Nairobi 220kV Ring</span>
                  <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950 px-1.5 py-0.5 rounded border border-red-500/50">
                    RISK 78 · EXTREME
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Transformer T1 winding at 72.8°C with 89.2% metro load concentration.
                </p>
              </div>

              <div 
                onClick={() => onSelectAsset('suswa')}
                className="p-2.5 rounded bg-amber-950/30 border border-amber-500/40 hover:bg-amber-950/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300">Suswa 500kV / 400kV Hub</span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/50">
                    RISK 68 · ELEVATED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  1,145 MW national power routing nexus with 500kV transient harmonic ingest.
                </p>
              </div>

              <div 
                onClick={() => onSelectAsset('loiyangalani')}
                className="p-2.5 rounded bg-slate-900/80 border border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">Loiyangalani Wind Substation</span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950 px-1.5 py-0.5 rounded border border-sky-500/50">
                    RISK 54 · SPOF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Single 435km radial line connecting 310 MW wind farm into Suswa.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Top 10 Critical Assets Table */}
      {riskTab === 'TOP_ASSETS' && (
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Substation / Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-center">Health</th>
                  <th className="p-3 text-center">Risk</th>
                  <th className="p-3 text-right">Loading</th>
                  <th className="p-3 text-center">Deps</th>
                  <th className="p-3 text-center">Alarms</th>
                  <th className="p-3 text-center">Confidence</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {criticalAssetsList.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  return (
                    <tr 
                      key={asset.id}
                      onClick={() => onSelectAsset(asset.id)}
                      className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-400">{asset.rank}</td>
                      <td className="p-3 font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{asset.name}</span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">{asset.type}</td>
                      <td className="p-3 text-[11px] text-slate-400 font-sans">{asset.location}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          asset.health > 85 ? 'text-emerald-400 bg-emerald-950/40' : asset.health > 70 ? 'text-amber-400 bg-amber-950/40' : 'text-red-400 bg-red-950/40'
                        }`}>
                          {asset.health}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          asset.risk > 70 ? 'text-red-400 bg-red-950/40' : asset.risk > 40 ? 'text-amber-400 bg-amber-950/40' : 'text-emerald-400 bg-emerald-950/40'
                        }`}>
                          {asset.risk}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-200">{asset.loadPct}%</td>
                      <td className="p-3 text-center text-slate-400">{asset.dependencies}</td>
                      <td className="p-3 text-center">
                        {asset.alarms > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                            {asset.alarms} P{asset.alarms === 3 ? '1' : '2'}
                          </span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <ConfidenceBadge status="VERIFIED" score={asset.confidence} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] flex items-center gap-1 ml-auto">
                          Focus <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top 10 Critical Corridors Table */}
      {riskTab === 'TOP_CORRIDORS' && (
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Corridor Name</th>
                  <th className="p-3">Voltage</th>
                  <th className="p-3 text-right">Loading</th>
                  <th className="p-3 text-right">Headroom</th>
                  <th className="p-3 text-center">Congestion</th>
                  <th className="p-3 text-center">Redundancy</th>
                  <th className="p-3 text-center">Risk</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {criticalCorridorsList.map((corridor) => (
                  <tr 
                    key={corridor.code}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="p-3 font-bold text-slate-400">{corridor.rank}</td>
                    <td className="p-3 font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{corridor.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[11px]">
                        {corridor.voltage}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-200">
                      <span className={corridor.loading > 85 ? 'text-red-400' : corridor.loading > 70 ? 'text-amber-400' : 'text-emerald-400'}>
                        {corridor.loading}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">+{corridor.headroomMW} MW</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        corridor.congestion === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-500/40' : corridor.congestion === 'MODERATE' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {corridor.congestion}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-300 font-sans text-[11px]">{corridor.redundancy}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-200">{corridor.risk}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => onTraceCorridor?.(corridor.code)}
                        className="px-2 py-1 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-500/30 text-sky-300 text-[10px] flex items-center gap-1 ml-auto"
                      >
                        <Share2 className="w-3 h-3" /> Trace Path
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regional Grid Health (Small Multiples) */}
      {riskTab === 'REGIONAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regionalMetrics.map((reg) => (
            <div 
              key={reg.regionId}
              className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
                <span className="font-semibold text-slate-100 text-xs">{reg.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  reg.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}>
                  {reg.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Regional Load</span>
                  <span className="text-slate-100 font-bold">{reg.loadMW} MW</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Generation Ingest</span>
                  <span className="text-emerald-400 font-bold">{reg.generationMW} MW</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Grid Availability</span>
                  <span className="text-cyan-300 font-bold">{reg.availabilityPct}%</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Risk Index</span>
                  <span className={`font-bold ${reg.riskScore > 60 ? 'text-red-400' : 'text-slate-200'}`}>
                    {reg.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-[10px] font-mono text-slate-400 block">Key Primary Backbone Nodes:</span>
                <span className="text-slate-300 font-sans">{reg.keyNodes.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
