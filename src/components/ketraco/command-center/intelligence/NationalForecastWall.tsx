import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Activity, 
  Flame, 
  Zap, 
  Gauge, 
  Radio, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { GridForecastSummary, ForecastHorizonKey, GridVariableForecast } from './types';
import { GridForecastEngine } from './forecast-engine';
import { GridAsset, TransmissionLine } from '../types';

interface NationalForecastWallProps {
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  onSelectAsset?: (assetId: string) => void;
  onLaunchScenario?: (scenarioName: string) => void;
}

export default function NationalForecastWall({
  substations,
  lines,
  onSelectAsset,
  onLaunchScenario
}: NationalForecastWallProps) {
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizonKey>('6_HOURS');
  const [forecastData] = useState<GridForecastSummary>(() => 
    GridForecastEngine.generateAllForecasts(substations, lines)
  );

  const horizonLabels: Record<ForecastHorizonKey, { label: string; sub: string }> = {
    '15_MIN': { label: '15 Minutes', sub: 'Real-Time Dispatch' },
    '1_HOUR': { label: '1 Hour', sub: 'Ramping & AGC' },
    '6_HOURS': { label: '6 Hours', sub: 'Evening Peak Horizon' },
    '24_HOURS': { label: '24 Hours', sub: 'Day-Ahead Commitment' }
  };

  const variables: { key: keyof Omit<GridForecastSummary, 'generatedAt' | 'evaluationHorizon'>; name: string; icon: any; color: string }[] = [
    { key: 'demand', name: 'System Demand (MW)', icon: Activity, color: '#38BDF8' },
    { key: 'generation', name: 'Total Generation (MW)', icon: Zap, color: '#10B981' },
    { key: 'reserve', name: 'Spinning Reserve (MW)', icon: ShieldCheck, color: '#F59E0B' },
    { key: 'frequency', name: 'System Frequency (Hz)', icon: Radio, color: '#A855F7' },
    { key: 'voltage', name: 'Min 400kV Bus Voltage (kV)', icon: Gauge, color: '#06B6D4' },
    { key: 'congestion', name: 'Max Corridor Loading (%)', icon: Flame, color: '#EC4899' },
    { key: 'transformerLoading', name: 'Max Transformer Load (%)', icon: Layers, color: '#EAB308' },
    { key: 'transmissionRisk', name: 'Transmission Risk Index', icon: AlertCircle, color: '#EF4444' }
  ];

  // Helper to render an SVG sparkline with P10/P90 confidence band
  const renderSparkline = (item: GridVariableForecast, color: string) => {
    const pts = item.timeSeries;
    if (!pts || pts.length < 2) return null;

    const width = 280;
    const height = 54;
    const padding = 6;

    const allValues = pts.flatMap(p => [p.p10, p.p50, p.p90]);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;

    const getX = (idx: number) => padding + (idx / (pts.length - 1)) * (width - 2 * padding);
    const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

    // Build P50 line path
    const p50Path = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.p50)}`).join(' ');

    // Build P10-P90 shaded polygon area
    const p90Coords = pts.map((p, idx) => `${getX(idx)},${getY(p.p90)}`);
    const p10Coords = pts.slice().reverse().map((p, idx) => `${getX(pts.length - 1 - idx)},${getY(p.p10)}`);
    const polygonPoints = [...p90Coords, ...p10Coords].join(' ');

    return (
      <svg className="w-full h-14 overflow-visible">
        <polygon points={polygonPoints} fill={color} fillOpacity="0.14" />
        <path d={p50Path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {pts.map((p, idx) => (
          <circle key={idx} cx={getX(idx)} cy={getY(p.p50)} r="2.5" fill={color} />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 space-y-4 font-mono">
      {/* Top Banner & Horizon Switcher */}
      <div className="bg-[#090e1a] border border-cyan-900/50 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-base font-bold tracking-wider text-slate-100">
              NATIONAL GRID FORECAST WALL
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              P10 / P50 / P90 PROBABILISTIC ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative 24-hour lookahead for national dispatch, congestion horizons, spinning reserves, and stability bounds.
          </p>
        </div>

        {/* Horizons Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-md border border-slate-800">
          {(['15_MIN', '1_HOUR', '6_HOURS', '24_HOURS'] as ForecastHorizonKey[]).map(hKey => {
            const isSel = selectedHorizon === hKey;
            return (
              <button
                key={hKey}
                onClick={() => setSelectedHorizon(hKey)}
                className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all flex flex-col items-center ${
                  isSel
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{horizonLabels[hKey].label}</span>
                <span className={`text-[9px] font-normal ${isSel ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {horizonLabels[hKey].sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 8 Variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {variables.map(({ key, name, icon: Icon, color }) => {
          const forecast = forecastData[key] as GridVariableForecast;
          if (!forecast) return null;

          const currentVal = forecast.currentMeasured;
          const horizonVal = forecast.horizons[selectedHorizon];
          const delta = horizonVal.p50 - currentVal;
          const deltaSign = delta > 0 ? '+' : '';

          return (
            <div
              key={key}
              className="bg-[#090e1a] border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md relative overflow-hidden"
            >
              {/* Top Row: Variable Name + Confidence Tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-1.5 rounded-md border"
                    style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {horizonVal.confidence}% CONF
                </span>
              </div>

              {/* Middle Row: Numbers (Current vs Forecast P50 + Delta) */}
              <div className="my-3 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {selectedHorizon.replace('_', ' ')} Expected (P50)
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white font-mono flex items-baseline gap-1.5">
                    <span>{forecast.unit === 'Hz' ? (horizonVal?.p50 ?? 0).toFixed(2) : (horizonVal?.p50 ?? 0).toLocaleString()}</span>
                    <span className="text-xs font-normal text-slate-400">{forecast.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Live Measured</div>
                  <div className="text-xs font-mono font-semibold text-slate-300">
                    {forecast.unit === 'Hz' ? (currentVal ?? 0).toFixed(2) : (currentVal ?? 0).toLocaleString()} {forecast.unit}
                  </div>
                  <div className={`text-[10px] font-mono font-bold ${delta >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {deltaSign}{forecast.unit === 'Hz' ? delta.toFixed(2) : delta.toFixed(1)} {forecast.unit}
                  </div>
                </div>
              </div>

              {/* Sparkline & Probabilistic Band */}
              <div className="bg-slate-950/60 rounded-md p-2 border border-slate-900 mb-2">
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>P10 (Low): <strong className="text-slate-200">{forecast.unit === 'Hz' ? horizonVal.p10.toFixed(2) : horizonVal.p10}</strong></span>
                  <span className="text-cyan-400 font-semibold">24-Hour Horizon Band</span>
                  <span>P90 (High): <strong className="text-slate-200">{forecast.unit === 'Hz' ? horizonVal.p90.toFixed(2) : horizonVal.p90}</strong></span>
                </div>
                {renderSparkline(forecast, color)}
              </div>

              {/* Bottom Footer: Source & Provenance */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[170px]" title={horizonVal.source}>
                  SRC: {horizonVal.source}
                </span>
                <span className="text-[9px] text-slate-400">
                  ±{horizonVal.uncertaintyBandPct.toFixed(1)}% unc
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Infographic Bar / Key Decision Takeaway */}
      <div className="bg-[#0b1222] border border-cyan-950 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Info className="w-4 h-4" />
            <span>OPERATIONAL OUTLOOK & ADVISORY NOTICE (NEXT 6 HOURS)</span>
          </div>
          <p className="text-slate-300">
            • <strong>Evening Peak Expected:</strong> 3,142 MW at 19:45 (+158 MW delta). Hydro dispatch at Seven Forks scheduled to ramp +180 MW from 18:00.
          </p>
          <p className="text-slate-300">
            • <strong>Western Transmission Corridor:</strong> Olkaria-Nairobi 220kV expected to reach 86.8% loading at 19:30. Dynamic Line Rating adds +13.1% thermal cushion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onLaunchScenario && (
            <button
              onClick={() => onLaunchScenario('SCEN_SUSWA_T1_TRIP')}
              className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Simulate Peak Outage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
