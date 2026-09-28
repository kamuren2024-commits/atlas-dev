import React from 'react';
import { 
  TrendingUp, 
  CloudRain, 
  Wind, 
  Sun, 
  Zap, 
  Thermometer, 
  Flame, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import { gridDataProvider } from '../providers/GridDataProvider';

export default function ForecastEnvironmentalLayer() {
  const forecastData = gridDataProvider.getForecastNext6Hours();

  const weatherStations = [
    { name: 'Lake Turkana / Loy Corridor', windSpeed: '14.2 m/s (High Yield)', temp: '34°C', risk: 'LOW', lightning: '0 strikes', dlrBoost: '+12.4% Headroom' },
    { name: 'Suswa Rift Backbone', windSpeed: '6.4 m/s (Moderate)', temp: '22°C', risk: 'LOW', lightning: '0 strikes', dlrBoost: '+4.2% Headroom' },
    { name: 'Nairobi Metropolitan Hub', windSpeed: '3.1 m/s (Low)', temp: '21°C', risk: 'MEDIUM', lightning: '1 strike (10km S)', dlrBoost: '+1.8% Headroom' },
    { name: 'Mombasa / Mariakani Coastal', windSpeed: '8.8 m/s (Sea Breeze)', temp: '30°C', risk: 'LOW', lightning: '0 strikes', dlrBoost: '+7.1% Headroom' },
  ];

  return (
    <div id="level-6-forecast" className="w-full bg-[#050913] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 6
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Forecast Horizon (6h) & Environmental Micro-Climate Telemetry
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Probabilistic Demand Forecasting, Dynamic Line Rating (DLR) & Severe Weather
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="WEATHER_MET" />
          <ConfidenceBadge status="HIGH_CONFIDENCE" score={95.4} />
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Next 6-Hour Forecast Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              6-Hour Probabilistic Demand & Reserve Horizon
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Peak Horizon at T+2h (3,125 MW)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Horizon</th>
                  <th className="p-2">Time (EAT)</th>
                  <th className="p-2 text-right">Forecast Demand</th>
                  <th className="p-2 text-right">Confidence Band (95%)</th>
                  <th className="p-2 text-right">Available Gen</th>
                  <th className="p-2 text-right">Reserve Margin</th>
                  <th className="p-2 text-center">Congestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {forecastData.map((f, idx) => (
                  <tr key={f.hourLabel} className={idx === 1 ? 'bg-amber-950/20 font-semibold' : 'hover:bg-slate-800/50'}>
                    <td className="p-2 font-sans font-medium text-slate-200">
                      {f.hourLabel}
                    </td>
                    <td className="p-2 text-slate-400">{f.timeEAT}</td>
                    <td className="p-2 text-right font-bold text-slate-100">{f.forecastDemandMW} MW</td>
                    <td className="p-2 text-right text-slate-400">
                      [{f.lowerConfidenceMW} – {f.upperConfidenceMW}]
                    </td>
                    <td className="p-2 text-right text-emerald-400">{f.generationAvailableMW} MW</td>
                    <td className="p-2 text-right font-bold text-cyan-300">+{f.reserveMarginMW} MW</td>
                    <td className="p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        f.projectedCongestionPct > 20 ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400'
                      }`}>
                        {f.projectedCongestionPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environmental & DLR Telemetry (5 Cols) */}
        <div className="lg:col-span-5 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Transmission Corridor Weather & Dynamic Line Ratings
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                DLR Active
              </span>
            </div>

            <div className="space-y-2 my-2">
              {weatherStations.map((st) => (
                <div key={st.name} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">{st.name}</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded">
                      {st.dlrBoost}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>Wind: <strong className="text-slate-200">{st.windSpeed}</strong></span>
                    <span>Ambient: <strong className="text-slate-200">{st.temp}</strong></span>
                    <span>Lightning: <strong className="text-slate-200">{st.lightning}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Severe Weather Alerts:</span>
            <span className="text-emerald-400 font-semibold">None (Clear Sky National)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
