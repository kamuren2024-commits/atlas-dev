// GridLearningEngine - KETRACO Phase 06 Closed-Loop Outcome Verification & Intelligence Learning Loop

import { LearningRecord, DecisionLedgerEntry } from './types';

export class GridLearningEngine {
  private static learningRecords: LearningRecord[] = [
    {
      id: 'LRN-2026-08-01',
      modelType: 'DEMAND_FORECAST',
      modelVersion: 'v4.2.1-PROB-ENSEMBLE',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      prediction: {
        target: 'National System Demand (14:00 EAT)',
        predictedValue: 2185.0,
        predictedHorizon: '1_HOUR',
        confidence: 94.8
      },
      actual: {
        observedValue: 2174.6,
        observedAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      error: {
        absoluteError: 10.4,
        percentageError: 0.48,
        withinTolerance: true
      },
      driftStatus: 'STABLE',
      calibrationAdjustmentApplied: 'No adjustment needed (Error < 1.0%)'
    },
    {
      id: 'LRN-2026-08-02',
      modelType: 'THERMAL_CONGESTION',
      modelVersion: 'v3.8.0-IEEE738-DLR',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      prediction: {
        target: 'Suswa-Isinya 400kV Conductor Core Temp',
        predictedValue: 78.4,
        predictedHorizon: '15_MIN',
        confidence: 92.1
      },
      actual: {
        observedValue: 76.9,
        observedAt: new Date(Date.now() - 5.75 * 3600000).toISOString()
      },
      error: {
        absoluteError: 1.5,
        percentageError: 1.95,
        withinTolerance: true
      },
      driftStatus: 'STABLE',
      calibrationAdjustmentApplied: 'Convective cooling coefficient alpha adjusted by +0.02'
    },
    {
      id: 'LRN-2026-08-03',
      modelType: 'VOLTAGE_STABILITY',
      modelVersion: 'v2.4.4-WAMS-LYAPUNOV',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      prediction: {
        target: 'Suswa-Lessos Phase Angle Delta',
        predictedValue: 22.8,
        predictedHorizon: '6_HOURS',
        confidence: 89.6
      },
      actual: {
        observedValue: 24.2,
        observedAt: new Date(Date.now() - 6 * 3600000).toISOString()
      },
      error: {
        absoluteError: 1.4,
        percentageError: 6.14,
        withinTolerance: true
      },
      driftStatus: 'MINOR_DRIFT',
      calibrationAdjustmentApplied: 'Increased reactive impedance damping weight for Olkaria-Lessos corridor'
    },
    {
      id: 'LRN-2026-08-04',
      modelType: 'CONTINGENCY_SIM',
      modelVersion: 'v5.1.0-AC-NEWTON-RAPHSON',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      prediction: {
        target: 'Post-Trip Flow on Isinya-Embakasi (N-1)',
        predictedValue: 418.0,
        predictedHorizon: 'REALTIME_SIM',
        confidence: 95.5
      },
      actual: {
        observedValue: 412.3,
        observedAt: new Date(Date.now() - 23.9 * 3600000).toISOString()
      },
      error: {
        absoluteError: 5.7,
        percentageError: 1.38,
        withinTolerance: true
      },
      driftStatus: 'STABLE',
      calibrationAdjustmentApplied: 'Validated PTDF redistribution matrix with 98.6% fidelity'
    }
  ];

  /**
   * Returns all learning history records
   */
  public static getLearningHistory(): LearningRecord[] {
    return this.learningRecords;
  }

  /**
   * Logs a new verified outcome from human-in-the-loop action
   */
  public static logVerifiedOutcome(
    ledgerEntry: DecisionLedgerEntry,
    observedOutcomeValue: number,
    expectedOutcomeValue: number
  ): LearningRecord {
    const absError = Math.abs(observedOutcomeValue - expectedOutcomeValue);
    const pctError = Number(((absError / Math.max(1, expectedOutcomeValue)) * 100).toFixed(2));
    const withinTolerance = pctError <= 5.0;

    const newRecord: LearningRecord = {
      id: `LRN-${Date.now()}`,
      modelType: 'CONTINGENCY_SIM',
      modelVersion: 'v5.1.0-AC-NEWTON-RAPHSON',
      timestamp: new Date().toISOString(),
      prediction: {
        target: ledgerEntry.alertSummary,
        predictedValue: expectedOutcomeValue,
        predictedHorizon: 'POST_ACTION_VERIFY',
        confidence: 94.0
      },
      actual: {
        observedValue: observedOutcomeValue,
        observedAt: new Date().toISOString()
      },
      error: {
        absoluteError: Number(absError.toFixed(2)),
        percentageError: pctError,
        withinTolerance
      },
      driftStatus: pctError > 8 ? 'SIGNIFICANT_DRIFT' : pctError > 4 ? 'MINOR_DRIFT' : 'STABLE',
      calibrationAdjustmentApplied: withinTolerance 
        ? 'Simulation confirmed optimal; model weights locked' 
        : 'Discrepancy tagged for offline batch re-calibration with NCC operations engineer'
    };

    this.learningRecords.unshift(newRecord);
    return newRecord;
  }

  /**
   * Calculates overall model calibration and accuracy stats
   */
  public static getModelTrustMetrics() {
    const total = this.learningRecords.length;
    const stable = this.learningRecords.filter(r => r.driftStatus === 'STABLE').length;
    const avgError = this.learningRecords.reduce((acc, r) => acc + r.error.percentageError, 0) / Math.max(1, total);
    
    return {
      totalRecords: total,
      meanAbsolutePercentageErrorMAPE: Number(avgError.toFixed(2)),
      overallAccuracyPct: Number((100 - avgError).toFixed(1)),
      modelsInCalibrationCompliancePct: Number(((stable / Math.max(1, total)) * 100).toFixed(1)),
      activeModelVersion: 'v4.2.1-PROB-ENSEMBLE (Production Gold)',
      lastCalibrationAudit: new Date(Date.now() - 3600000 * 2).toISOString()
    };
  }
}
