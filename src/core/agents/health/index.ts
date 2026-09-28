/**
 * Enterprise Agent Framework (EAF) — Health monitoring service
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentHealth } from '../types';
import { AgentTelemetryCollector } from '../telemetry';

export class AgentHealthTracker {
  private static instance: AgentHealthTracker;
  private collector: AgentTelemetryCollector;

  private constructor() {
    this.collector = AgentTelemetryCollector.getInstance();
  }

  public static getInstance(): AgentHealthTracker {
    if (!AgentHealthTracker.instance) {
      AgentHealthTracker.instance = new AgentHealthTracker();
    }
    return AgentHealthTracker.instance;
  }

  public getHealth(agentId: string): AgentHealth {
    const metrics = this.collector.getMetrics(agentId);
    if (metrics) return metrics;

    // Default initialization if no executions recorded yet
    return {
      status: 'HEALTHY',
      availability: 100,
      executionCount: 0,
      successRate: 1,
      failureRate: 0,
      averageLatencyMs: 0,
      errorCount: 0,
      memoryUsageBytes: 0
    };
  }
}
