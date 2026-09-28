import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Sliders, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';

interface ForecastingPanelProps {
  onAskCopilot: (prompt: string) => void;
}

export default function ForecastingPanel({ onAskCopilot }: ForecastingPanelProps) {
  const [forecastModel, setForecastModel] = useState<'SMOOTHING' | 'LSTM_NEURAL'>('SMOOTHING');
  const [timeHorizon, setTimeHorizon] = useState<number>(90);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const handleRunForecastSim = () => {
    setIsRunningSim(true);
    setTimeout(() => {
      setIsRunningSim(false);
      onAskCopilot(`Triggered ${forecastModel} model demand simulation under a ${timeHorizon}-day temporal horizon. Generated 5 reorder replenishment recommendations.`);
    }, 1200);
  };

  // Static Data lists representing demand curves
  const baselineDemand = [30, 45, 60, 52, 70, 85, 95, 80, 110, 125, 140, 130];
  const neuralDemand = [32, 49, 58, 62, 78, 92, 105, 99, 124, 138, 155, 162];
  const Months = ['Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26'];

  const activeDemandCurve = forecastModel === 'SMOOTHING' ? baselineDemand : neuralDemand;

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-405" />
            Demand Forecasting & Replenishment Neural Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            LSTM neural network models to predict seasonal shortages, grid expansion demands, and logistics bottlenecks across Active Laydown Yards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={forecastModel}
            onChange={e => setForecastModel(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 p-2 text-white text-xs font-mono rounded-lg focus:outline-none focus:border-[#00D9FF]/20"
          >
            <option value="SMOOTHING">EXPONENTIAL HOLT-WINTERS SMOOTHING</option>
            <option value="LSTM_NEURAL">LSTM RECURRENT NEURAL PROJECTION</option>
          </select>

          <button
            onClick={handleRunForecastSim}
            disabled={isRunningSim}
            className="p-2.5 px-4 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-cyan-405 font-mono text-xs font-bold border border-cyan-500/25 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isRunningSim ? 'PRODUCE NODAL INBOUND ESTIMATIONS...' : 'RUN TEMPORAL SIMULATION'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side Forecast Chart (7 columns) */}
        <div className="xl:col-span-8 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 relative flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-405 uppercase font-bold tracking-wider">
            {forecastModel} TEMPORAL DEMAND CURVES FOR NEXT {timeHorizon} DAYS
          </span>

          <div className="w-full h-64 mt-4 relative flex items-end justify-between border-b border-l border-indigo-950/30 pb-5 pl-8 pr-4">
            {/* Custom SVG Line Chart */}
            <svg className="absolute inset-0 w-full h-full p-8 pl-12 pb-12 overflow-visible">
              {/* Grid Lines */}
              <line x1="0%" y1="20%" x2="100%" y2="20%" stroke="#0e1630" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0%" y1="40%" x2="100%" y2="40%" stroke="#0e1630" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="#0e1630" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0%" y1="80%" x2="100%" y2="80%" stroke="#0e1630" strokeWidth="1" strokeDasharray="3 3" />

              {/* Draw Polyline Line */}
              <polyline
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2.5"
                points={activeDemandCurve.map((val, index) => {
                  const x = (index / (activeDemandCurve.length - 1)) * 100;
                  const y = 100 - (val / 185) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
              />

              {/* Interactive Point labels */}
              {activeDemandCurve.map((val, index) => {
                const x = (index / (activeDemandCurve.length - 1)) * 100;
                const y = 100 - (val / 185) * 100;
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#00D9FF"
                    className="hover:r-6 cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Render Bottom Month Labels */}
            {Months.map((m, index) => (
              <span key={index} className="text-[8.5px] font-mono text-slate-500 transform rotate-12 mt-2">
                {m}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-baseline text-[9px] font-mono text-slate-650 pt-3">
            <span>Projection Model Capacity Variance = ±2.3%</span>
            <span>Real-time SAP transactional feedback loop active</span>
          </div>
        </div>

        {/* Right Side: Reorder Thresholds & Actions (4 columns) */}
        <div className="xl:col-span-12 lg:xl:col-span-4 space-y-4">
          <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-wider font-extrabold pb-2 border-b border-indigo-950/25">
              TEMPORAL DEPLETIION RADAR
            </span>

            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-extrabold text-white block">Shortage Alerts in 14 Days</span>
                <p className="text-slate-350 font-sans mt-1">
                  Mombasa Marine HV cables Depot buffer stock of XLPE conductor ranges below safety reorder line. Critical risk of site stoppage.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Horizon Forecast Controls</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Temporal range span:</span>
                <span className="text-[#00D9FF] font-mono text-xs font-bold">{timeHorizon} Days</span>
              </div>
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={timeHorizon}
                onChange={e => setTimeHorizon(Number(e.target.value))}
                className="w-full accent-[#00D9FF]"
              />
            </div>

            <div className="border border-indigo-950/20 rounded-2xl p-4 bg-slate-900/10 space-y-2 text-xs">
              <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Recommended Procure Action</span>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400">XLPE Conductor reorder size</span>
                <span className="font-mono text-white font-bold">3,000 m</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400">Target Supplier (Prequal)</span>
                <span className="font-mono text-cyan-400 font-bold">Shanghai Metal</span>
              </div>
            </div>

            <button 
              onClick={() => onAskCopilot(`Explain current shortage forecasting models active under Mombasa laydown yard, recommend procurement steps with PPADA compliance.`)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-[#00D9FF] border border-cyan-500/20 rounded-xl text-xs font-mono font-bold cursor-pointer"
            >
              GENERATE PROCUREMENT MEMORANDUM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
