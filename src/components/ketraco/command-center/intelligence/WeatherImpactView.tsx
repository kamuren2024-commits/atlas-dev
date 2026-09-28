import React, { useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Sun, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Radio, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { WeatherGridImpact, DynamicLineRating } from './types';
import { GridWeatherImpactEngine } from './weather-impact-engine';
import { TransmissionLine } from '../types';

interface WeatherImpactViewProps {
  lines: Record<string, TransmissionLine>;
}

export default function WeatherImpactView({ lines }: WeatherImpactViewProps) {
  const [impactData] = useState<WeatherGridImpact>(() =>
    GridWeatherImpactEngine.evaluateWeatherImpact(lines)
  );

  const getClassificationBadge = (type: 'OBSERVED' | 'CORRELATED' | 'MODELLED' | 'PREDICTED') => {
    switch (type) {
      case 'OBSERVED':
        return <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">OBSERVED (TELEMETERED)</span>;
      case 'CORRELATED':
        return <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40">CORRELATED (STATISTICAL)</span>;
      case 'MODELLED':
        return <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">MODELLED (IEEE 738)</span>;
      case 'PREDICTED':
        return <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">PREDICTED (EARLY WARNING)</span>;
    }
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-[#090e1a] border border-cyan-900/50 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-base font-bold tracking-wider text-slate-100">
              WEATHER-TO-GRID PHYSICS & DYNAMIC LINE RATING (DLR)
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              IEEE 738 THERMAL AMPACITY MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time meteorological fusion: Conductor wind cooling expansion, Turkana wind dispatch correlation, and lightning trip forecasting.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
          Region: <strong className="text-cyan-400">{impactData.region}</strong>
        </div>
      </div>

      {/* Environmental Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Ambient Temp</div>
            <div className="text-xl font-bold font-mono text-slate-100">{impactData.ambientTempC} °C</div>
            <div className="text-[9px] text-slate-400">AWS Switchyard Sensor</div>
          </div>
        </div>

        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Wind Cross-Flow</div>
            <div className="text-xl font-bold font-mono text-cyan-400">{impactData.windSpeedKmh} km/h</div>
            <div className="text-[9px] text-emerald-400 font-semibold">+13.1% DLR Cooling</div>
          </div>
        </div>

        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Solar Irradiance</div>
            <div className="text-xl font-bold font-mono text-slate-100">{impactData.solarIrradianceWm2} W/m²</div>
            <div className="text-[9px] text-slate-400">Garissa Solar: 46.2 MW</div>
          </div>
        </div>

        <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Lightning Trip Risk</div>
            <div className="text-xl font-bold font-mono text-amber-400">{impactData.lightningTripRiskIndex} / 100</div>
            <div className="text-[9px] text-slate-400">{impactData.lightningStrikeCount} strikes / hr</div>
          </div>
        </div>
      </div>

      {/* Dynamic Line Rating (DLR) Ampacity Expansion Table */}
      <div className="bg-[#090e1a] border border-slate-800 rounded-lg overflow-hidden shadow-lg space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase">
              DYNAMIC LINE RATING (DLR) REAL-TIME THERMAL HEADROOM
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Standard Static Design: 40°C Still Air (0.6 m/s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050913] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Corridor Line</th>
                <th className="py-2.5 px-3">Static Rating</th>
                <th className="py-2.5 px-3">DLR Effective Rating</th>
                <th className="py-2.5 px-3">Thermal Gain Δ</th>
                <th className="py-2.5 px-3">Wind Speed</th>
                <th className="py-2.5 px-3">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {impactData.dlrLineCapacities.map(dlr => (
                <tr key={dlr.lineId} className="hover:bg-slate-900/60 text-slate-300">
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{dlr.lineName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{dlr.nominalMVA} MVA</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{dlr.dlrMVA} MVA</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">+{dlr.deltaPct}%</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{dlr.windSpeedKmh} km/h</td>
                  <td className="py-2.5 px-3">{getClassificationBadge(dlr.classification)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explicit Data Classification & Provenance Ledger */}
      <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase">
            DATA PROVENANCE & METHODOLOGICAL CLASSIFICATION LEDGER
          </span>
        </div>

        <div className="space-y-2">
          {impactData.classifications.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded bg-[#050913] border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{item.factor}</span>
                {getClassificationBadge(item.classification)}
              </div>
              <p className="text-slate-400 text-[11px]">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
