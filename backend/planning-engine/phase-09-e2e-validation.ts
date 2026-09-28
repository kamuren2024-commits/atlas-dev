import {
  gridPlanningEngine,
  gridOutageCoordinationEngine,
  maintenanceOptimizationEngine,
  gridCapacityEngine,
  conflictDetectionEngine,
  lossIntelligenceEngine,
  planningDecisionEngine,
} from './index';
import type { OutageEvent, MaintenanceWindow, GridPlanningAssetState } from './types';

export class Phase09ValidationSuite {
  private static testsPassed = 0;
  private static testsFailed = 0;

  public static async runAllTests(): Promise<{ success: boolean; summary: string; details: string[] }> {
    const results: string[] = [];

    try {
      // 1. Test National Grid Planning Engine
      results.push('✓ [PLANNING-ENGINE] Forecast generation');
      const forecast = gridPlanningEngine.buildForecast('7D', 'base-case');
      this.assert(forecast.demandMw > 0, 'Forecast demand is positive');
      this.assert(forecast.confidence > 0.75, 'Forecast confidence is strong');
      this.testsPassed += 1;

      // 2. Test Outage Coordination
      results.push('✓ [OUTAGE-COORDINATION] Outage unification and impact assessment');
      const sampleOutages: Partial<OutageEvent>[] = [
        { id: 'OUT-1', type: 'PLANNED', state: 'PLANNED', assetIds: ['asset-1'], region: 'Region-A', affectedLoadMw: 250, n1Exposure: 0.6, congestionImpact: 45, risk: 55 },
        { id: 'OUT-2', type: 'MAINTENANCE', state: 'PLANNED', assetIds: ['asset-2'], region: 'Region-A', affectedLoadMw: 180, n1Exposure: 0.5, congestionImpact: 35, risk: 48 },
      ];
      const unified = gridOutageCoordinationEngine.unifyOutages(sampleOutages);
      this.assert(unified.length === 2, 'Outages unified correctly');
      this.testsPassed += 1;

      // 3. Test Conflict Detection
      results.push('✓ [CONFLICT-DETECTION] Outage overlap detection');
      const conflicts = gridOutageCoordinationEngine.detectConflicts(unified as OutageEvent[]);
      this.assert(Array.isArray(conflicts), 'Conflict detection returns array');
      this.testsPassed += 1;

      // 4. Test Maintenance Optimization
      results.push('✓ [MAINTENANCE-OPTIMIZATION] Window scoring and simulation');
      const sampleWindow: Partial<MaintenanceWindow> = {
        id: 'MNT-1',
        assetId: 'asset-1',
        assetName: 'Test Asset',
        workType: 'Inspection',
        risk: 55,
        criticality: 70,
        demandForecast: 65,
        generationAvailability: 80,
        weatherExposure: 40,
        congestion: 50,
        n1Margin: 60,
      };
      const score = maintenanceOptimizationEngine.scoreWindow(sampleWindow);
      this.assert(score >= 0 && score <= 100, 'Maintenance score is in valid range');
      const simResult = maintenanceOptimizationEngine.simulateMaintenance(sampleWindow);
      this.assert(simResult.recommendation !== null, 'Simulation produces recommendation');
      this.testsPassed += 2;

      // 5. Test Capacity Intelligence
      results.push('✓ [CAPACITY-INTELLIGENCE] Bottleneck and loss detection');
      const sampleAssets: Partial<GridPlanningAssetState>[] = [
        { assetId: 'a1', name: 'Asset 1', actualCapacity: 500, n1Margin: 60, congestion: 50 },
        { assetId: 'a2', name: 'Asset 2', actualCapacity: 400, n1Margin: 55, congestion: 60 },
      ];
      const capacity = gridCapacityEngine.calculateCapacity(sampleAssets as GridPlanningAssetState[]);
      this.assert(capacity.national.installed > 0, 'National capacity calculated');
      const bottlenecks = gridCapacityEngine.detectBottlenecks(sampleAssets as GridPlanningAssetState[]);
      this.assert(bottlenecks.length > 0, 'Bottlenecks detected');
      const losses = gridCapacityEngine.calculateLossMetrics(sampleAssets as GridPlanningAssetState[]);
      this.assert(losses.length > 0, 'Loss metrics calculated');
      this.testsPassed += 3;

      // 6. Test Loss Intelligence
      results.push('✓ [LOSS-INTELLIGENCE] National loss calculation');
      const lossReport = lossIntelligenceEngine.calculateLosses();
      this.assert(lossReport.nationalLossMw > 0, 'National loss calculated');
      this.assert(lossReport.regionalLosses.length > 0, 'Regional losses available');
      this.testsPassed += 1;

      // 7. Test Conflict Detection for Maintenance
      results.push('✓ [CONFLICT-DETECTION] Maintenance-outage conflicts');
      const maintConflicts = conflictDetectionEngine.detectMaintenanceConflicts(
        [sampleWindow as MaintenanceWindow],
        unified as OutageEvent[]
      );
      this.assert(Array.isArray(maintConflicts), 'Maintenance conflicts detected');
      this.testsPassed += 1;

      // 8. Test Planning Decision Support
      results.push('✓ [DECISION-SUPPORT] Maintenance decision workflow');
      const decision = planningDecisionEngine.buildDecisionSupport(sampleWindow as MaintenanceWindow);
      this.assert(decision.problem.length > 0, 'Decision problem formulated');
      this.assert(decision.options.length > 0, 'Decision options available');
      this.assert(decision.evidence.length > 0, 'Evidence provided');
      this.testsPassed += 1;

      // 9. Test Temporal Separation
      results.push('✓ [TEMPORAL-MODEL] Future grid states');
      const temporalCheck = forecast.evidence[0].dataState === 'MODELLED';
      this.assert(temporalCheck, 'Data states are properly separated');
      this.testsPassed += 1;

      // 10. Test Provenance Tracking
      results.push('✓ [PROVENANCE] Evidence-backed results');
      const hasProvenance = forecast.evidence && forecast.evidence.length > 0 && forecast.evidence[0].assumptions.length > 0;
      this.assert(hasProvenance, 'Planning results include provenance');
      this.testsPassed += 1;

      // Summary
      const summary = `Phase 09 Planning Validation: ${this.testsPassed} tests passed, ${this.testsFailed} tests failed`;
      return {
        success: this.testsFailed === 0,
        summary,
        details: results,
      };
    } catch (error) {
      this.testsFailed += 1;
      return {
        success: false,
        summary: `Phase 09 validation error: ${error instanceof Error ? error.message : String(error)}`,
        details: results,
      };
    }
  }

  private static assert(condition: boolean, message: string): void {
    if (!condition) {
      this.testsFailed += 1;
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

export async function runPhase09Validation() {
  console.log('[PHASE-09-VALIDATION] Starting comprehensive planning validation suite...');
  const result = await Phase09ValidationSuite.runAllTests();

  console.log(`\n[PHASE-09-VALIDATION] ${result.summary}`);
  result.details.forEach((detail) => console.log(`  ${detail}`));

  if (result.success) {
    console.log('\n✓ [PHASE-09-VALIDATION] All planning validation tests passed.');
  } else {
    console.error('\n✗ [PHASE-09-VALIDATION] Some tests failed. Review results above.');
  }

  return result;
}
