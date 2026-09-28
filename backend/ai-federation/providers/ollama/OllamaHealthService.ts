// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA HEALTH SERVICE
// Derives provider status from REAL runtime health. Provides polling and
// a cached snapshot so status is available without repeated network calls.
// ============================================================================

import { OllamaClient, OllamaError } from './OllamaClient';
import { OllamaHealth } from './types';

export type OllamaStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'DISABLED' | 'UNKNOWN';

export interface OllamaStatusSnapshot {
  status: OllamaStatus;
  reachable: boolean;
  modelCount: number;
  modelNames: string[];
  latencyMs: number;
  lastCheckedAt?: string;
  error?: string;
}

export class OllamaHealthService {
  private client: OllamaClient;
  private snapshot: OllamaStatusSnapshot = {
    status: 'UNKNOWN',
    reachable: false,
    modelCount: 0,
    modelNames: [],
    latencyMs: 0,
  };
  private checkTimer: ReturnType<typeof setInterval> | null = null;
  private checking = false;
  private checkIntervalMs: number;

  constructor(client: OllamaClient, checkIntervalMs?: number) {
    this.client = client;
    this.checkIntervalMs =
      checkIntervalMs ??
      (() => {
        const v = Number(process.env.OLLAMA_HEALTH_INTERVAL_MS);
        return Number.isFinite(v) && v > 0 ? v : 30_000;
      })();
  }

  /**
   * Perform a single health check and update the internal snapshot.
   */
  async check(): Promise<OllamaStatusSnapshot> {
    if (this.checking) return this.snapshot;
    this.checking = true;
    try {
      const health = await this.client.health();
      this.snapshot = {
        ...this.toSnapshot(health),
        lastCheckedAt: health.checkedAt,
      };
    } catch (err: any) {
      this.snapshot = {
        status: 'UNHEALTHY',
        reachable: false,
        modelCount: 0,
        modelNames: [],
        latencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        error: err instanceof OllamaError ? err.message : String(err?.message || err),
      };
    } finally {
      this.checking = false;
    }
    return this.snapshot;
  }

  /**
   * Start periodic health checks.
   */
  start(): void {
    if (this.checkTimer) return;
    // Immediate check on start
    this.check().catch(() => {});
    this.checkTimer = setInterval(() => {
      this.check().catch(() => {});
    }, this.checkIntervalMs);
  }

  /**
   * Stop periodic health checks.
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Get the current cached status snapshot (non-blocking).
   */
  getSnapshot(): OllamaStatusSnapshot {
    return this.snapshot;
  }

  private toSnapshot(health: OllamaHealth): OllamaStatusSnapshot {
    if (!health.reachable) {
      return {
        status: 'UNHEALTHY',
        reachable: false,
        modelCount: 0,
        modelNames: [],
        latencyMs: health.latencyMs,
        error: health.error,
      };
    }
    // Runtime reachable: HEALTHY if models present, DEGRADED if runtime up but empty
    return {
      status: health.modelCount > 0 ? 'HEALTHY' : 'DEGRADED',
      reachable: true,
      modelCount: health.modelCount,
      modelNames: health.modelNames,
      latencyMs: health.latencyMs,
    };
  }
}
