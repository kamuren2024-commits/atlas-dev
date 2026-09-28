import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart4, ArrowUpRight, TrendingUp, AlertTriangle, 
  Cpu, Sliders, PlayCircle, Sparkles
} from 'lucide-react';
import { processAIRequest } from '../utils/ai';

export default function AnalyticsIntelligence() {
  const [forecastGrowth, setForecastGrowth] = useState(45);
  const [anomalyThreshold, setAnomalyThreshold] = useState(70);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Dynamic coordinates generator for the custom SVG Line charts
  const makePointsString = () => {
    const points = [];
    // Generating 7 dynamic coordinate intervals based on the growth slider
    const baseValues = [180, 160, 140, 190, 110, 80, 50];
    for (let i = 0; i < baseValues.length; i++) {
      const x = (i * 90) + 30;
      // Growth variable dynamically alters coordinates downwards (which displays as upwards on screen!)
      const factor = 1 - (forecastGrowth / 100);
      const yStrValue = baseValues[i] * factor + 40;
      points.push(`${x},${Math.max(20, yStrValue)}`);
    }
    return points.join(' ');
  };

  const executeAnalyticsForecasting = async () => {
    setLoading(true);
    setAiInsights(null);

    const response = await processAIRequest({
      module: 'analytics',
      prompt: `Forecast growth selected: ${forecastGrowth}%. Current Anomaly Threshold configured: ${anomalyThreshold}%. Assess quarterly operational synergy and compute strategic recommendations based on these variables.`,
      systemInstruction: "You are the Chief Enterprise Analytics Mind. Evaluate the user's metrics, outline a predictive trajectory, identify potential risk hurdles, and suggest remediation steps."
    });

    setAiInsights(response.text);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="analytics-module">
      {/* Interactive Controls & Live custom SVG Chart */}
      <div className="flex-[2] glass-panel rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-h-[500px]">
        <div>
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
                <BarChart4 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Quantum Forecast Engine</h3>
                <p className="text-[11px] text-slate-400">Live dynamic predictive curves reflecting trajectory multipliers</p>
              </div>
            </div>

            <button
              onClick={executeAnalyticsForecasting}
              disabled={loading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-[11px] uppercase rounded-lg flex items-center gap-1 font-semibold transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Synthesize Forecast
            </button>
          </div>

          {/* Variables Sliders Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/45 p-4 rounded-xl border border-slate-900 mb-6">
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-300">GROWTH MULTIPLIER:</span>
                <span className="text-white font-bold">{forecastGrowth}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={forecastGrowth}
                onChange={e => setForecastGrowth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-pink-400">ANOMALY TOLERANCE CAP:</span>
                <span className="text-white font-bold">{anomalyThreshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={anomalyThreshold}
                onChange={e => setAnomalyThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Premium custom SVG predictive graph displaying coords */}
          <div className="relative w-full h-64 bg-slate-950/80 rounded-xl border border-slate-900 flex justify-center items-center py-4 px-2 overflow-hidden">
            {/* Ambient graph grid lines */}
            <div className="absolute inset-0 grid grid-cols-7 grid-rows-4 pointer-events-none opacity-20">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="border-t border-l border-indigo-500/25"></div>
              ))}
            </div>

            {/* Dynamic Vector path */}
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points={`30,200 ${makePointsString()} 570,200`}
                fill="url(#glowGrad)"
              />

              {/* Connected Line points */}
              <polyline
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                points={makePointsString()}
                className="transition-all duration-300"
              />

              {/* Glow node circles */}
              {makePointsString().split(' ').map((pt, idx) => {
                const [cx, cy] = pt.split(',');
                const isAnomaly = parseFloat(cy) < (220 * (1 - anomalyThreshold / 100));
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isAnomaly ? "4.5" : "3"}
                    fill={isAnomaly ? "#EF4444" : "#A855F7"}
                    className="transition-all duration-300 cursor-pointer"
                    title={`Interval ${idx+1}: Coordinates ${cx}, ${cy}`}
                  />
                );
              })}
            </svg>

            {/* Threshold line alert markers */}
            <div 
              className="absolute w-full border-t border-dashed border-pink-500/40 pointer-events-none transition-all duration-300 text-[10px] font-mono pl-3 text-pink-400"
              style={{ bottom: `${anomalyThreshold}%` }}
            >
              ANOMALY TRIGGER MARKER
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-900 mt-2 shrink-0">
          <span>MODEL: MULTI-STEP BAYES REGRESSION G-14</span>
          <span>COMPUTE REFRESH CLOCK: ACTIVE (60FPS)</span>
        </div>
      </div>

      {/* Synthesis Analytical report */}
      <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col justify-between max-h-[500px] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-sm font-display font-semibold text-white tracking-wide border-b border-indigo-500/10 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> AI Strategic Analysis Report
          </h3>

          <AnimatePresence mode="wait">
            {loading && (
              <div className="py-16 text-center text-slate-400 text-xs space-y-1.5 font-mono">
                <Cpu className="w-8 h-8 text-cyan-400 animate-spin mx-auto scale-90 mb-2" />
                <p>RUNNING RECURSIVE TREND INTEGRATION...</p>
                <p className="text-[10px] text-slate-500">Estimating long-term context trajectories</p>
              </div>
            )}

            {!loading && aiInsights && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed"
              >
                {aiInsights.split('\n').map((line, i) => {
                  if (line.startsWith('###')) {
                    return <h4 key={i} className="text-sm font-display font-medium text-white tracking-tight border-b border-slate-800 pb-1 mt-4 mb-2">{line.replace('###', '')}</h4>;
                  }
                  if (line.startsWith('*')) {
                    return (
                      <div key={i} className="flex gap-2 items-start mt-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1"></span>
                        <p>{line.replace('*', '').trim()}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="mb-2 text-slate-400 leading-relaxed">{line}</p>;
                })}
              </motion.div>
            )}

            {!loading && !aiInsights && (
              <div className="py-24 text-center space-y-1 text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Analytical insights empty.</p>
                <p className="text-[10px] font-mono uppercase">Click "Synthesize Forecast" to trigger predictive model analyses.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
