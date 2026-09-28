/**
 * Enterprise Agent Framework (EAF) — Telemetry Collector
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentResult, AgentTelemetry, AgentHealth } from '../types';
import { IAgentTelemetryCollector } from '../contracts';
import { AgentEventPublisher } from '../events';

export class AgentTelemetryCollector implements IAgentTelemetryCollector {
  private static instance: AgentTelemetryCollector;
  private telemetryStore = new Map<string, AgentTelemetry[]>();
  private metricsMap = new Map<string, AgentHealth>();

  private constructor() {}

  public static getInstance(): AgentTelemetryCollector {
    if (!AgentTelemetryCollector.instance) {
      AgentTelemetryCollector.instance = new AgentTelemetryCollector();
    }
    return AgentTelemetryCollector.instance;
  }

  public recordExecution(result: AgentResult): void {
    const { agentId, telemetry, success, latencyMs } = result;

    if (!this.telemetryStore.has(agentId)) {
      this.telemetryStore.set(agentId, []);
    }
    this.telemetryStore.get(agentId)!.push(telemetry);

    // Update derived health metrics
    let health = this.metricsMap.get(agentId);
    if (!health) {
      health = {
        status: 'HEALTHY',
        availability: 100,
        executionCount: 0,
        successRate: 0,
        failureRate: 0,
        averageLatencyMs: 0,
        errorCount: 0,
        memoryUsageBytes: 4096000 // In-memory reference placeholder
      };
    }

    health.executionCount += 1;
    health.lastExecutionTime = Date.now();

    if (!success) {
      health.errorCount += 1;
    }

    // Recompute ratios
    health.successRate = (health.executionCount - health.errorCount) / health.executionCount;
    health.failureRate = health.errorCount / health.executionCount;
    
    // Average Latency moving average
    health.averageLatencyMs = Number(
      ((health.averageLatencyMs * (health.executionCount - 1) + latencyMs) / health.executionCount).toFixed(2)
    );

    // Determine status
    if (health.failureRate > 0.5) {
      health.status = 'UNHEALTHY';
    } else if (health.failureRate > 0.15) {
      health.status = 'DEGRADED';
    } else {
      health.status = 'HEALTHY';
    }

    this.metricsMap.set(agentId, health);

    // Notify listeners of health dynamics
    AgentEventPublisher.publish('AgentHealthChanged', agentId, {
      status: health.status,
      executionCount: health.executionCount,
      successRate: health.successRate
    }, telemetry);
  }

  public recordFailure(agentId: string, error: string): void {
    let health = this.metricsMap.get(agentId);
    if (!health) {
      health = {
        status: 'HEALTHY',
        availability: 100,
        executionCount: 0,
        successRate: 0,
        failureRate: 0,
        averageLatencyMs: 0,
        errorCount: 0
      };
    }

    health.executionCount += 1;
    health.errorCount += 1;
    health.successRate = (health.executionCount - health.errorCount) / health.executionCount;
    health.failureRate = health.errorCount / health.executionCount;
    
    if (health.failureRate > 0.5) {
      health.status = 'UNHEALTHY';
    } else if (health.failureRate > 0.15) {
      health.status = 'DEGRADED';
    }

    this.metricsMap.set(agentId, health);
  }

  public getMetrics(agentId: string): AgentHealth | undefined {
    return this.metricsMap.get(agentId);
  }

  public getHistory(agentId: string): AgentTelemetry[] {
    return this.telemetryStore.get(agentId) || [];
  }

  public clearAll(): void {
    this.telemetryStore.clear();
    this.metricsMap.clear();
  }
}
