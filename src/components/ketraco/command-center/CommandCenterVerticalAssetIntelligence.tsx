import React, { useState } from 'react';
import {
  Building2,
  Share2,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Layers,
  Thermometer,
  Flame
} from 'lucide-react';
import { SubstationEntity, TransmissionLineEntity, GridAsset, TransmissionLine } from './types';

interface CommandCenterVerticalAssetIntelligenceProps {
  substations: (SubstationEntity | GridAsset | any)[];
  lines: (TransmissionLineEntity | TransmissionLine | any)[];
  onSelectAsset: (assetId: string) => void;
  onOpenAsset360: (assetId: string) => void;
  onOpenCorridor360: (corridorId: string) => void;
}

export const CommandCenterVerticalAssetIntelligence: React.FC<CommandCenterVerticalAssetIntelligenceProps> = ({
  substations,
  lines,
  onSelectAsset,
  onOpenAsset360,
  onOpenCorridor360
}) => {
  const [activeTab, setActiveTab] = useState<'SUBSTATIONS' | 'LINES' | 'TRANSFORMERS' | 'CORRIDORS'>('SUBSTATIONS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubstations = substations.filter(s => {
    const name = (s.name || '').toLowerCase();
    const code = (s.code || s.id || '').toLowerCase();
    const voltage = (s.voltageKV || s.voltageLevelKV || '').toString();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || code.includes(query) || voltage.includes(query);
  });

  const filteredLines = lines.filter(l => {
    const name = (l.name || '').toLowerCase();
    const code = (l.code || l.id || '').toLowerCase();
    const voltage = (l.voltageKV || l.voltageLevelKV || '').toString();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || code.includes(query) || voltage.includes(query);
  });

  return (
    <section className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg select-text">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            GRID INFRASTRUCTURE & TOPOLOGY
          </span>
          <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
            Asset Intelligence & Fleet Health
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Synchronous operational status, thermal loading, and health index across all transmission asset classes
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#050913] border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('SUBSTATIONS')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'SUBSTATIONS'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Substations ({substations.length})
          </button>
          <button
            onClick={() => setActiveTab('LINES')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'LINES'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transmission Lines ({lines.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSFORMERS')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'TRANSFORMERS'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transformers (142)
          </button>
          <button
            onClick={() => setActiveTab('CORRIDORS')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'CORRIDORS'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Corridors (14)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by asset name, voltage (e.g. 400kV, 220kV), or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050913] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing readable vertical records with full engineering attributes
        </span>
      </div>

      {/* 1. SUBSTATIONS VIEW */}
      {activeTab === 'SUBSTATIONS' && (
        <div className="space-y-3 pt-2">
          {filteredSubstations.slice(0, 10).map((sub: any) => {
            const assetId = sub.canonicalId || sub.id || 'asset';
            const voltage = sub.voltageKV || sub.voltageLevelKV || 220;
            const region = sub.location?.region || sub.region || 'CENTRAL';
            const code = sub.code || sub.id || 'SUB';
            const capacity = sub.ratedCapacityMVA || 1500;
            const currentLoad = sub.currentLoadMW ?? sub.loadMW ?? 950;
            const health = sub.health ?? sub.healthScore ?? 88;
            const connCount = sub.connectedLines?.length || 4;

            return (
              <div
                key={assetId}
                className="bg-[#050914] border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {voltage} kV SUBSTATION
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Code: {code} • Region: {region}
                      </span>
                      {sub.nMinusOneRedundant && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> N-1 Compliant
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-display font-bold text-white">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectAsset(assetId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Focus on Grid Map</span>
                    </button>
                    <button
                      onClick={() => onOpenAsset360(assetId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      <span>Asset 360 Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">RATED CAPACITY</span>
                    <span className="text-white font-bold">{capacity} MVA</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">CURRENT LOAD FLOW</span>
                    <span className="text-cyan-300 font-bold">{currentLoad} MW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">HEALTH INDEX</span>
                    <span className="text-emerald-400 font-bold">{health} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">CONNECTED CIRCUITS</span>
                    <span className="text-slate-300 font-bold">{connCount} Transmission Lines</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TRANSMISSION LINES VIEW */}
      {activeTab === 'LINES' && (
        <div className="space-y-3 pt-2">
          {filteredLines.slice(0, 10).map((line: any) => {
            const lineId = line.canonicalId || line.id || 'line';
            const voltage = line.voltageKV || line.voltageLevelKV || 220;
            const length = line.lengthKM || line.lengthKm || 120;
            const conductor = line.conductorType || 'ACSR Zebra';
            const thermalRating = line.thermalRatingMVA || 950;
            const currentLoad = line.currentLoadMW || 380;
            const loadingPct = line.loadingPct || Math.round((currentLoad / thermalRating) * 100) || 68;
            const losses = line.lossesMW || 4.2;

            return (
              <div
                key={lineId}
                className="bg-[#050914] border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {voltage} kV OVERHEAD LINE
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Length: {length} km • Conductor: {conductor}
                      </span>
                      {loadingPct >= 85 && (
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                          <Flame className="w-3 h-3" /> High Thermal Loading
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-display font-bold text-white">
                      {line.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectAsset(lineId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Focus on Grid Map</span>
                    </button>
                    <button
                      onClick={() => onOpenAsset360(lineId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      <span>Line Loading & DLR Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">THERMAL RATING</span>
                    <span className="text-white font-bold">{thermalRating} MVA</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">CURRENT MW FLOW</span>
                    <span className="text-cyan-300 font-bold">{currentLoad} MW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">UTILIZATION LOADING</span>
                    <span className={`font-bold ${loadingPct >= 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {loadingPct}% Capacity
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">ACTIVE TRANSMISSION LOSSES</span>
                    <span className="text-slate-300 font-bold">{losses} MW</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. TRANSFORMERS VIEW */}
      {activeTab === 'TRANSFORMERS' && (
        <div className="space-y-3 pt-2">
          {[
            {
              id: 'tx_ssw_t1',
              name: 'Suswa 400/220kV Auto-Transformer T1',
              rating: '450 MVA',
              loading: '382 MVA (84.8%)',
              topOilTemp: '68.4°C (Normal < 85°C)',
              dgaStatus: 'Normal (H2: 18ppm, C2H2: 0.1ppm)',
              health: 91,
              substation: 'Suswa Substation'
            },
            {
              id: 'tx_ssw_t2',
              name: 'Suswa 400/220kV Auto-Transformer T2',
              rating: '450 MVA',
              loading: '394 MVA (87.5%)',
              topOilTemp: '76.2°C (Warning)',
              dgaStatus: 'Elevated Ethylene (C2H4: 84ppm)',
              health: 74,
              substation: 'Suswa Substation'
            },
            {
              id: 'tx_isy_t1',
              name: 'Isinya 400/220kV Auto-Transformer T1',
              rating: '450 MVA',
              loading: '320 MVA (71.1%)',
              topOilTemp: '61.8°C (Normal)',
              dgaStatus: 'Normal (H2: 12ppm)',
              health: 96,
              substation: 'Isinya Substation'
            },
            {
              id: 'tx_olk_t3',
              name: 'Olkaria II 220/132kV Generator Step-Up T3',
              rating: '150 MVA',
              loading: '128 MVA (85.3%)',
              topOilTemp: '65.0°C (Normal)',
              dgaStatus: 'Normal',
              health: 89,
              substation: 'Olkaria II'
            }
          ].map((tx) => (
            <div
              key={tx.id}
              className="bg-[#050914] border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    {tx.substation}
                  </span>
                  <h3 className="text-base font-display font-bold text-white mt-0.5">
                    {tx.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    tx.health >= 85 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    Health: {tx.health}/100
                  </span>
                  <button
                    onClick={() => onOpenAsset360('suswa')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    DGA & Thermal Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">RATED CAPACITY</span>
                  <span className="text-white font-bold">{tx.rating}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ACTIVE LOADING</span>
                  <span className="text-cyan-300 font-bold">{tx.loading}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">TOP OIL TEMPERATURE</span>
                  <span className="text-white font-bold">{tx.topOilTemp}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ONLINE DGA GAS DIAGNOSTIC</span>
                  <span className="text-amber-300 font-bold">{tx.dgaStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. CORRIDORS VIEW */}
      {activeTab === 'CORRIDORS' && (
        <div className="space-y-3 pt-2">
          {[
            {
              id: 'CORR-01',
              name: 'Suswa – Isinya Bulk Transmission Corridor',
              voltage: '400 kV Double-Circuit',
              headroom: '48 MW Headroom Remaining (94% Loading)',
              criticality: 'CRITICAL BACKBONE',
              status: 'HEAVY FLOW',
              lines: ['400kV Suswa-Isinya Circuit 1', '400kV Suswa-Isinya Circuit 2']
            },
            {
              id: 'CORR-02',
              name: 'Seven Forks – Nairobi Eastern Evacuation Corridor',
              voltage: '220 kV Quad Circuits',
              headroom: '280 MW Headroom Available (58% Loading)',
              criticality: 'HIGH PRIORITY HYDRO EVACUATION',
              status: 'NORMAL',
              lines: ['220kV Kamburu-Dandora C1/C2', '220kV Kiambere-Dandora']
            },
            {
              id: 'CORR-03',
              name: 'Olkaria Geothermal Evacuation Corridor',
              voltage: '220 / 400 kV Multi-Terminal',
              headroom: '160 MW Headroom Available (74% Loading)',
              criticality: 'CONTINUOUS BASELOAD',
              status: 'NORMAL',
              lines: ['220kV Olkaria II-Suswa C1/C2', '400kV Olkaria I-Suswa']
            },
            {
              id: 'CORR-04',
              name: 'Mombasa – Nairobi Coastal Interconnector',
              voltage: '400 kV Double-Circuit',
              headroom: 'Under Construction (Stage 9 - 72%)',
              criticality: 'STRATEGIC EXPANSION',
              status: 'PROJECT IN PROGRESS',
              lines: ['Mariakani-Dongo Kundu', 'Mariakani-Isinya 400kV']
            }
          ].map((corridor) => (
            <div
              key={corridor.id}
              className="bg-[#050914] border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    {corridor.voltage} • {corridor.criticality}
                  </span>
                  <h3 className="text-base font-display font-bold text-white mt-0.5">
                    {corridor.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCorridor360('tl_ssw_isy')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    <span>Corridor 360 Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-1 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">THERMAL CAPACITY & HEADROOM</span>
                  <span className="text-white font-bold">{corridor.headroom}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">CIRCUIT INVENTORY</span>
                  <span className="text-slate-300 font-bold">{corridor.lines.join(' • ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
};
