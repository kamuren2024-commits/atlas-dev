import { ProviderHealthRegistry, ProviderMetric } from '../health/health-registry';
import { CostGovernor } from '../costs/cost-governor';
import { AuditLedger, AuditInteraction } from '../compliance/audit-ledger';
import { FederationCache } from '../cache/federation-cache';

export interface OperationsCenterData {
  providers: ProviderMetric[];
  costSummary: {
    hourly: any;
    daily: any;
    monthly: any;
    budgetLimit: number;
    budgetAlerts: string[];
  };
  auditLogs: AuditInteraction[];
  cacheStats: {
    entriesCount: number;
  };
  globalMetrics: {
    requestsPerSecond: number;
    globalSuccessRate: number;
    avgGlobalLatencyMs: number;
  };
}

export class AIOperationsCenter {
  /**
   * Consolidated telemetry packet for the operations control dashboard
   */
  static getConsolidatedTelemetry(): OperationsCenterData {
    const providers = ProviderHealthRegistry.getAllProviderMetrics();
    const auditLogs = AuditLedger.getLedger();

    // Calculate global success rate and average latency from provider metrics
    let totalLatencySum = 0;
    let totalOnlineProviders = 0;
    let totalAvailabilitySum = 0;

    providers.forEach(p => {
      if (p.isOnline) {
        totalOnlineProviders += 1;
        totalLatencySum += p.avgLatencyMs;
        totalAvailabilitySum += p.availability;
      }
    });

    const avgGlobalLatencyMs = totalOnlineProviders > 0 ? Math.round(totalLatencySum / totalOnlineProviders) : 210;
    const globalSuccessRate = totalOnlineProviders > 0 ? Number((totalAvailabilitySum / totalOnlineProviders).toFixed(4)) : 1.0;

    // Simulate requests/sec based on real active logs
    const requestsPerSecond = Number((auditLogs.length > 0 ? 0.45 + (auditLogs.length * 0.05) : 0.12).toFixed(2));

    return {
      providers,
      costSummary: {
        hourly: CostGovernor.getCostReport('hourly'),
        daily: CostGovernor.getCostReport('daily'),
        monthly: CostGovernor.getCostReport('monthly'),
        budgetLimit: 1500.0,
        budgetAlerts: CostGovernor.getBudgetAlerts()
      },
      auditLogs: auditLogs.slice(-15).reverse(), // Last 15 logs, newest first
      cacheStats: {
        entriesCount: FederationCache.getCacheSize()
      },
      globalMetrics: {
        requestsPerSecond,
        globalSuccessRate,
        avgGlobalLatencyMs
      }
    };
  }

  /**
   * Reset all registries for maintenance
   */
  static async performMaintenance(): Promise<void> {
    await FederationCache.clear();
    CostGovernor.clearAlerts();
    console.log('[MAINTENANCE] AI Federation Layer cache and budget alerts successfully reset.');
  }
}
