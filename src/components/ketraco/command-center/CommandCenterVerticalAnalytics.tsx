import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Gauge,
  Zap,
  Calendar,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const CommandCenterVerticalAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');

  // 24-Hour Synthetic Curve Data for National Load vs Generation vs Forecast
  const hours24 = [
    { hour: '00:00', demand: 2180, gen: 2240, forecast: 2200 },
    { hour: '02:00', demand: 1980, gen: 2050, forecast: 2000 },
    { hour: '04:00', demand: 1920, gen: 2000, forecast: 1950 },
    { hour: '06:00', demand: 2340, gen: 2420, forecast: 2360 },
    { hour: '08:00', demand: 2750, gen: 2840, forecast: 2780 },
    { hour: '10:00', demand: 2890, gen: 2980, forecast: 2900 },
    { hour: '12:00', demand: 2840, gen: 2940, forecast: 2850 },
    { hour: '14:00', demand: 2810, gen: 2910, forecast: 2830 },
    { hour: '16:00', demand: 2860, gen: 2970, forecast: 2880 },
    { hour: '18:00', demand: 3010, gen: 3120, forecast: 3020 },
    { hour: '20:00', demand: 3042, gen: 3150, forecast: 3050 }, // Peak
    { hour: '22:00', demand: 2680, gen: 2790, forecast: 2700 }
  ];

  // Frequency Deviation Samples across 12 intervals (Hz)
  const freqData = [
    { time: '11:00', hz: 50.02 },
    { time: '11:10', hz: 49.98 },
    { time: '11:20', hz: 50.01 },
    { time: '11:30', hz: 50.04 },
    { time: '11:40', hz: 49.95 },
    { time: '11:50', hz: 50.01 },
    { time: '12:00', hz: 50.03 },
    { time: '12:10', hz: 49.99 },
    { time: '12:20', hz: 50.00 },
    { time: '12:30', hz: 50.02 },
    { time: '12:40', hz: 50.01 },
    { time: '12:50', hz: 50.01 }
  ];

  return (
    <section className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg select-text space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            NATIONAL LOAD, GENERATION & DYNAMICS
          </span>
          <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
            Network Analytics & Operational Curves
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Spacious, high-resolution telemetry time-series: demand profiles, synchronous frequency compliance, and transmission availability
          </p>
        </div>

        {/* Time Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#050913] border border-slate-800 rounded-lg text-xs font-mono">
          {(['24H', '7D', '30D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range} Horizon
            </button>
          ))}
        </div>
      </div>

      {/* CHART 1: NATIONAL LOAD VS GENERATION DISPATCH (LARGE VERTICAL STACK) */}
      <div className="bg-[#050914] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block font-bold">
              CURVE 01 • NATIONAL SYNCHRONOUS DEMAND
            </span>
            <h3 className="text-base font-display font-bold text-white mt-0.5">
              System Demand vs Generation Dispatch vs AI Forecast (MW)
            </h3>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Actual Demand
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Dispatch Generation
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" /> Probabilistic Forecast
            </span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-[11px]">
              Peak Today: 3,042 MW (20:00)
            </span>
          </div>
        </div>

        {/* High-Resolution SVG Chart (Large height 220px, fully visible labels) */}
        <div className="w-full h-56 pt-2">
          <svg className="w-full h-full" viewBox="0 0 1000 220" preserveAspectRatio="none">
            {/* Gridlines */}
            {[0, 50, 100, 150, 200].map((y, i) => (
              <line
                key={i}
                x1="40"
                y1={y}
                x2="980"
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Y-Axis MW Labels */}
            <text x="35" y="10" fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">3,200 MW</text>
            <text x="35" y="60" fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">2,800 MW</text>
            <text x="35" y="110" fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">2,400 MW</text>
            <text x="35" y="160" fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">2,000 MW</text>
            <text x="35" y="210" fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">1,600 MW</text>

            {/* Dispatch Curve (Emerald) */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              points={hours24.map((pt, i) => {
                const x = 50 + (i * (930 / (hours24.length - 1)));
                const y = 210 - ((pt.gen - 1600) / 1600) * 200;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Demand Curve (Cyan) */}
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              points={hours24.map((pt, i) => {
                const x = 50 + (i * (930 / (hours24.length - 1)));
                const y = 210 - ((pt.demand - 1600) / 1600) * 200;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* AI Forecast Dotted Line (Slate) */}
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              points={hours24.map((pt, i) => {
                const x = 50 + (i * (930 / (hours24.length - 1)));
                const y = 210 - ((pt.forecast - 1600) / 1600) * 200;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Data points & time markers */}
            {hours24.map((pt, i) => {
              const x = 50 + (i * (930 / (hours24.length - 1)));
              const y = 210 - ((pt.demand - 1600) / 1600) * 200;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="#06b6d4" stroke="#050914" strokeWidth="1.5" />
                  <text
                    x={x}
                    y="218"
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {pt.hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Base dispatch: 92.4% renewable (Hydro + Geothermal + Lake Turkana Wind)</span>
          <span className="text-emerald-400">Spinning reserve headroom: +70 MW surplus</span>
        </div>
      </div>

      {/* CHART 2: SYSTEM FREQUENCY DEAD-BAND COMPLIANCE (LARGE VERTICAL STACK) */}
      <div className="bg-[#050914] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block font-bold">
              CURVE 02 • POWER SYSTEM FREQUENCY DYNAMICS
            </span>
            <h3 className="text-base font-display font-bold text-white mt-0.5">
              Grid Frequency Compliance (Nominal 50.00 Hz • Statutory Deadband 49.80 – 50.20 Hz)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              Current: 50.01 Hz (Normal)
            </span>
            <span className="text-slate-400">
              Compliance Rate: 99.94% in-band
            </span>
          </div>
        </div>

        {/* High-Resolution SVG Frequency Chart */}
        <div className="w-full h-44 pt-2">
          <svg className="w-full h-full" viewBox="0 0 1000 160" preserveAspectRatio="none">
            {/* Upper & Lower Statutory Limits */}
            <line x1="40" y1="20" x2="980" y2="20" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
            <text x="35" y="24" fill="#f43f5e" fontSize="10" textAnchor="end" fontFamily="monospace">50.20 Hz (High Limit)</text>

            <line x1="40" y1="80" x2="980" y2="80" stroke="#10b981" strokeWidth="1.5" />
            <text x="35" y="84" fill="#10b981" fontSize="10" textAnchor="end" fontFamily="monospace">50.00 Hz (Nominal)</text>

            <line x1="40" y1="140" x2="980" y2="140" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
            <text x="35" y="144" fill="#f43f5e" fontSize="10" textAnchor="end" fontFamily="monospace">49.80 Hz (Low Limit)</text>

            {/* Frequency Trace */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              points={freqData.map((pt, i) => {
                const x = 50 + (i * (930 / (freqData.length - 1)));
                // 50.20 = 20, 50.00 = 80, 49.80 = 140 -> 1 Hz = 300px, 0.01 Hz = 3px
                const y = 80 - ((pt.hz - 50.00) * 300);
                return `${x},${y}`;
              }).join(' ')}
            />

            {freqData.map((pt, i) => {
              const x = 50 + (i * (930 / (freqData.length - 1)));
              const y = 80 - ((pt.hz - 50.00) * 300);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3" fill="#38bdf8" />
                  <text x={x} y="156" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {pt.time}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Primary Frequency Response: 480 MW governor droop response active across hydro and geothermal units</span>
          <span className="text-cyan-400">RoCoF (Rate of Change of Frequency): &lt; 0.02 Hz/s</span>
        </div>
      </div>

    </section>
  );
};
