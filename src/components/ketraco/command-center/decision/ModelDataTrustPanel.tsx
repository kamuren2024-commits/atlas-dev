// ModelDataTrustPanel - KETRACO Phase 06 Accuracy Command Center & Model Trust Intelligence

import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Lock 
} from 'lucide-react';
import { LearningRecord } from './types';
import { GridLearningEngine } from './learning-engine';

interface ModelDataTrustPanelProps {
  learningHistory: LearningRecord[];
}

export default function ModelDataTrustPanel({ learningHistory }: ModelDataTrustPanelProps) {
  const metrics = GridLearningEngine.getModelTrustMetrics();

  const getDriftBadge = (drift: LearningRecord['driftStatus']) => {
    switch (drift) {
      case 'STABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            STABLE
          </span>
        );
      case 'MINOR_DRIFT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
            MINOR DRIFT (Calibrated)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40">
            SIGNIFICANT DRIFT
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl font-mono text-xs text-slate-200">
      
      {/* Header */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              ACCURACY COMMAND CENTER & MODEL DATA TRUST
            </h2>
            <p className="text-[10px] text-slate-400">
              Closed-Loop Machine Learning Calibration, Drift Tracking & Evidence Provenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">ACTIVE ENGINE:</span>
          <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            {metrics.activeModelVersion}
          </span>
        </div>
      </div>

      {/* Top 4 Trust KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#070d18] border-b border-slate-800/80 text-center">
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400">OVERALL PREDICTIVE ACCURACY</div>
          <div className="text-lg font-bold text-emerald-400">{metrics.overallAccuracyPct}%</div>
          <div className="text-[9px] text-slate-400">Target &gt; 95.0%</div>
        </div>
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400">MEAN ABSOLUTE ERROR (MAPE)</div>
          <div className="text-lg font-bold text-cyan-300">{metrics.meanAbsolutePercentageErrorMAPE}%</div>
          <div className="text-[9px] text-slate-400">Error ceiling &lt; 3.0%</div>
        </div>
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400">CALIBRATION COMPLIANCE</div>
          <div className="text-lg font-bold text-purple-300">{metrics.modelsInCalibrationCompliancePct}%</div>
          <div className="text-[9px] text-slate-400">Audited every 4 hours</div>
        </div>
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400">VERIFIED OUTCOMES LOGGED</div>
          <div className="text-lg font-bold text-amber-300">{metrics.totalRecords} Events</div>
          <div className="text-[9px] text-slate-400">Feedback Loop Active</div>
        </div>
      </div>

      {/* Historical Model Learning & Drift Ledger */}
      <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase">
          RECENT CLOSED-LOOP VERIFICATION & RETRAINING AUDITS
        </div>

        {learningHistory.map(record => (
          <div
            key={record.id}
            className="p-3 rounded-lg bg-[#0a1222]/80 border border-slate-800 space-y-1.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{record.prediction.target}</span>
                <span className="text-[10px] text-slate-400">({record.modelType})</span>
              </div>
              <div className="flex items-center gap-2">
                {getDriftBadge(record.driftStatus)}
                <span className="text-[10px] text-slate-400">
                  {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[10px]">
              <div>
                <span className="text-slate-400">PREDICTED:</span>{' '}
                <strong className="text-cyan-300">{record.prediction.predictedValue}</strong>
              </div>
              <div>
                <span className="text-slate-400">ACTUAL OBSERVED:</span>{' '}
                <strong className="text-emerald-300">{record.actual.observedValue}</strong>
              </div>
              <div>
                <span className="text-slate-400">ERROR VARIANCE:</span>{' '}
                <strong className={record.error.withinTolerance ? 'text-emerald-400' : 'text-rose-400'}>
                  {record.error.percentageError}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400">CONFIDENCE:</span>{' '}
                <strong className="text-slate-200">{record.prediction.confidence}%</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400 font-bold">CALIBRATION ADJUSTMENT:</span> {record.calibrationAdjustmentApplied}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
