import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface OptimizationPanelProps {
  onAskCopilot: (prompt: string) => void;
}

export default function OptimizationPanel({ onAskCopilot }: OptimizationPanelProps) {
  const [serviceLevel, setServiceLevel] = useState<number>(95);
  const [leadTimeVariance, setLeadTimeVariance] = useState<number>(1.2);
  const [dailyDemandSigma, setDailyDemandSigma] = useState<number>(45);

  // Compute Safety Stock: Safety Factor Z * Daily Demand SD * Sqrt(Lead Time Std Dev)
  // Use simple Z-factor scaling approximations
  const zFactors: Record<number, number> = { 90: 1.28, 95: 1.65, 98: 2.05, 99: 2.33, 99.9: 3.09 };
  const z = zFactors[serviceLevel] || 1.65;
  const calculatedSafetyQty = Math.round(z * dailyDemandSigma * Math.sqrt(leadTimeVariance * 30));

  const handleUpdateSafetyConfig = () => {
    onAskCopilot(`Configured Safety Buffer weights inside Salience Atlas. Service Level target = ${serviceLevel}%, Lead Time Variance coefficient = ${leadTimeVariance}. Calculated safety buffer requirement = ${calculatedSafetyQty} units.`);
  };

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-405" />
          Safety Stock & Volu-Metric Buffer Optimization
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic calculations of safety thresholds and Economic Order Quantity (EOQ) targets derived from daily demand standard deviations and supplier variance indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side Tweak Parameters Sliders (7 columns) */}
        <div className="xl:col-span-7 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-5">
          <span className="text-[10px] font-mono text-cyan-405 uppercase font-bold tracking-wider block">
            BUFFER FORMULA TUNERS
          </span>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-300 font-sans">Required Service Level Target (Z-factor)</span>
                <span className="font-mono text-[#00D9FF] font-bold">{serviceLevel}% (Z={z})</span>
              </div>
              <div className="flex gap-2">
                {[90, 95, 98, 99, 99.9].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setServiceLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-mono font-bold border transition-colors ${
                      serviceLevel === lvl 
                        ? 'bg-[#00D9FF] border-cyan-500 text-black' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-300 font-sans">Lead Time Standard Variance (Supplier Risk)</span>
                <span className="font-mono text-amber-500 font-bold">{leadTimeVariance}x multiplier</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={leadTimeVariance}
                onChange={e => setLeadTimeVariance(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[9px] text-slate-500 block leading-tight">
                Controls protection against port delays and strike variances. Higher numbers raise safety threshold requirements.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-300 font-sans">Daily Consumptive Demand Deviation (Sigma)</span>
                <span className="font-mono text-[#00D9FF] font-bold">{dailyDemandSigma} Units/Day</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={dailyDemandSigma}
                onChange={e => setDailyDemandSigma(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <button
            onClick={handleUpdateSafetyConfig}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-mono font-bold cursor-pointer"
          >
            DEPLOY OPTIME BUFFER RULES TO NATIONAL SYSTEM
          </button>
        </div>

        {/* Right Side: Active Math Formulas output (5 columns) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-wider font-extrabold pb-2 border-b border-indigo-950/25">
              BUFFER CALCULATION CONSOLE
            </span>

            <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-1 text-center">
              <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">CALCULATED SAFETY STOCK</span>
              <span className="font-mono text-[#00D9FF] font-bold text-lg block mt-1">{calculatedSafetyQty} Units</span>
              <p className="text-[9px] text-slate-500 font-sans">Formula: Z × σD × √L</p>
            </div>

            <div className="p-4 bg-slate-900/15 border border-slate-900 rounded-2xl text-xs space-y-3 leading-relaxed">
              <span className="text-[9.5px] font-mono text-cyan-405 block uppercase font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Economic Order Quantity (EOQ) Model
              </span>
              <div className="text-slate-350">
                Determines the optimal reorder size that minimizes total carrying costs and ordering fees.
                <div className="font-mono text-[#00D9FF] bg-slate-950/60 p-2 border border-slate-800 rounded-lg text-center mt-2.5">
                  Q* = \sqrt(2DS / H)
                </div>
                <div className="text-[9.5px] text-slate-500 mt-2">
                  D: Annual Demand, S: Fixed order cost per PO, H: Carrying cost per unit/annum.
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/15 border border-cyan-500/10 rounded-2xl flex items-center gap-3 text-xs text-[#00D9FF]">
              <ShieldCheck className="w-5 h-5 text-cyan-450 shrink-0" />
              <span>Safety margins are continuous synchronized audit targets. Safe from service outages.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
