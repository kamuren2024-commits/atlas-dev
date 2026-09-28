// GridStateDriversModal - KETRACO Phase 06 Grid State Engine Decomposition & Mathematical Drivers

import React from 'react';
import { 
  X, 
  Activity, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  TrendingUp,
  Layers,
  Zap
} from 'lucide-react';
import { GridStateAssessment } from './types';

interface GridStateDriversModalProps {
  assessment: GridStateAssessment;
  isOpen: boolean;
  onClose: () => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function GridStateDriversModal({
  assessment,
  isOpen,
  onClose,
  onOpenDecisionBrief
}: GridStateDriversModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl max-h-[92vh] bg-[#070e1c] border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden font-mono text-slate-200 text-xs">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a1426] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                GRID STATE ENGINE DECOMPOSITION
              </span>
              <h2 className="text-sm font-bold text-slate-100">National Grid State: {assessment.state}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Top Level Health Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">STRESS SCORE</div>
              <div className="text-lg font-bold text-amber-400">{assessment.stressScore}%</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">VOLTAGE STABILITY</div>
              <div className="text-lg font-bold text-emerald-400">{assessment.voltageStabilityIndex}%</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">DYNAMIC RESERVE</div>
              <div className="text-lg font-bold text-cyan-300">{assessment.spinningReserveMW} MW</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-400">CONGESTION COUNT</div>
              <div className="text-lg font-bold text-purple-300">{assessment.congestedCorridorsCount} Lines</div>
            </div>
          </div>

          {/* Key Drivers Decomposition */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              TOP DETERMINING STATE DRIVERS (RANKED BY SEVERITY)
            </div>

            <div className="space-y-2">
              {assessment.topDrivers.map(driver => (
                <div
                  key={driver.id}
                  className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{driver.driver}</span>
                      <span className="text-[10px] text-slate-400">({driver.category})</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400">
                      Severity: {driver.severityScore}/100
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    {driver.explanation}
                  </p>

                  <div className="text-[10.5px] text-cyan-300">
                    <strong>Recommended Action:</strong> {driver.recommendedMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Boundaries Summary */}
          <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              CRITICAL OPERATIONAL BOUNDARIES
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <div>• System Frequency: <strong>{assessment.gridFrequencyHz.toFixed(3)} Hz</strong> (Nominal: 50.00 Hz)</div>
              <div>• System Total Demand: <strong>{assessment.systemDemandMW} MW</strong></div>
              <div>• Total Online Generation: <strong>{assessment.totalGenerationMW} MW</strong></div>
              <div>• N-1 Security Status: <strong className="text-amber-400">{assessment.n1ComplianceStatus}</strong></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a1426] border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            CLOSE DECOMPOSITION
          </button>
        </div>

      </div>
    </div>
  );
}
