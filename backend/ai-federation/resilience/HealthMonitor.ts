// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — PROVIDER HEALTH MONITOR
// Periodic health checks with degraded/unhealthy state management
// ============================================================================

import { HEALTH } from '../core/constants';
import { ProviderHealth, ProviderStatus } from '../federation/types';

export interface HealthCheckResult {
  providerId: string;
  status: ProviderStatus;
  latencyMs: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface HealthMonitorEntry {
  providerId: string;
  status: ProviderStatus;
  lastCheck: string;
  latencyMs: number;
  failureCount: number;
  successCount: number;
  lastError?: string;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  /** Rolling window of recent results (true = success, false = failure) */
  history: boolean[];
  /** Timestamp when status last changed */
  statusChangedAt: string;
}

export interface HealthCheckFn {
  (providerId: string): Promise<ProviderHealth>;
}

/**
 * Monitors provider health with configurable check intervals.
 * Manages provider lifecycle states: HEALTHY → DEGRADED → UNHEALTHY → HEALTHY
 */
export class ProviderHealthMonitor {
  private static instance: ProviderHealthMonitor;
  private entries: Map<string, HealthMonitorEntry> = new Map();
  private checkFunctions: Map<string, HealthCheckFn> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private checkIntervalMs: number = HEALTH.CHECK_INTERVAL_MS;

  private constructor() {}

  static getInstance(): ProviderHealthMonitor {
    if (!ProviderHealthMonitor.instance) {
      ProviderHealthMonitor.instance = new ProviderHealthMonitor();
    }
    return ProviderHealthMonitor.instance;
  }

  /**
   * Register a provider with a health check function.
   */
  register(providerId: string, healthCheckFn: HealthCheckFn): void {
    this.entries.set(providerId, {
      providerId,
      status: 'ACTIVE',
      lastCheck: new Date().toISOString(),
      latencyMs: 0,
      failureCount: 0,
      successCount: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      history: [],
      statusChangedAt: new Date().toISOString(),
    });
    this.checkFunctions.set(providerId, healthCheckFn);
    console.log(`[HEALTH-MONITOR] Registered provider: ${providerId}`);
  }

  /**
   * Start periodic health checks for a provider.
   */
  startMonitoring(providerId: string, intervalMs?: number): void {
    if (this.intervals.has(providerId)) return;

    const interval = setInterval(async () => {
      await this.checkProvider(providerId);
    }, intervalMs || this.checkIntervalMs);

    this.intervals.set(providerId, interval);
    console.log(`[HEALTH-MONITOR] Started monitoring ${providerId} (interval: ${intervalMs || this.checkIntervalMs}ms)`);
  }

  /**
   * Stop monitoring a provider.
   */
  stopMonitoring(providerId: string): void {
    const interval = this.intervals.get(providerId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(providerId);
    }
  }

  /**
   * Perform a single health check for a provider.
   */
  async checkProvider(providerId: string): Promise<HealthCheckResult> {
    const entry = this.entries.get(providerId);
    const healthFn = this.checkFunctions.get(providerId);

    if (!entry || !healthFn) {
      return {
        providerId,
        status: 'UNAVAILABLE',
        latencyMs: 0,
        success: false,
        error: 'Provider not registered',
        timestamp: new Date().toISOString(),
      };
    }

    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    let health: ProviderHealth | undefined;

    try {
      health = await healthFn(providerId);
      success = health.status === 'ACTIVE';
      if (!success) {
        error = `Provider status: ${health.status}`;
      }
    } catch (err: any) {
      error = err.message || 'Health check failed';
    }

    const latencyMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Update history
    entry.history.push(success);
    if (entry.history.length > HEALTH.WINDOW_SIZE) {
      entry.history.shift();
    }

    // Update counters
    entry.lastCheck = timestamp;
    entry.latencyMs = latencyMs;

    if (success) {
      entry.consecutiveFailures = 0;
      entry.consecutiveSuccesses++;
      entry.successCount++;
      entry.lastError = undefined;
    } else {
      entry.consecutiveSuccesses = 0;
      entry.consecutiveFailures++;
      entry.failureCount++;
      entry.lastError = error;
    }

    // Determine new status
    const newStatus = this.determineStatus(entry);
    if (newStatus !== entry.status) {
      const oldStatus = entry.status;
      entry.status = newStatus;
      entry.statusChangedAt = timestamp;
      console.log(`[HEALTH-MONITOR] ${providerId}: ${oldStatus} → ${newStatus}`);
    }

    return {
      providerId,
      status: entry.status,
      latencyMs,
      success,
      error,
      timestamp,
    };
  }

  /**
   * Get health status for a provider.
   */
  getStatus(providerId: string): HealthMonitorEntry | undefined {
    return this.entries.get(providerId);
  }

  /**
   * Get all provider health statuses.
   */
  getAllStatuses(): HealthMonitorEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get provider health in the federation types format.
   */
  getProviderHealth(providerId: string): ProviderHealth | undefined {
    const entry = this.entries.get(providerId);
    if (!entry) return undefined;

    const recentSuccesses = entry.history.filter(Boolean).length;
    const availability = entry.history.length > 0
      ? Math.round((recentSuccesses / entry.history.length) * 100)
      : 0;

    return {
      status: this.mapToProviderStatus(entry.status),
      latencyMs: entry.latencyMs,
      availability,
      uptime: availability,
      lastCheck: entry.lastCheck,
      consecutiveFailures: entry.consecutiveFailures,
      errorRate: entry.history.length > 0
        ? Math.round(((entry.history.length - recentSuccesses) / entry.history.length) * 100)
        : 0,
    };
  }

  /**
   * Set a provider status manually (for external signals).
   */
  setProviderStatus(providerId: string, status: ProviderStatus): void {
    const entry = this.entries.get(providerId);
    if (entry) {
      entry.status = status;
      entry.statusChangedAt = new Date().toISOString();
    }
  }

  destroy(): void {
    for (const [id, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  private determineStatus(entry: HealthMonitorEntry): ProviderStatus {
    // UNHEALTHY: too many consecutive failures
    if (entry.consecutiveFailures >= HEALTH.UNHEALTHY_THRESHOLD) {
      return 'UNAVAILABLE';
    }

    // DEGRADED: history shows declining success rate
    if (entry.history.length >= 5) {
      const recentSuccessRate = entry.history.slice(-5).filter(Boolean).length / 5;
      if (recentSuccessRate < 0.5) {
        return 'DEGRADED';
      }
    }

    return 'ACTIVE';
  }

  private mapToProviderStatus(entryStatus: ProviderStatus): ProviderStatus {
    return entryStatus;
  }
}
