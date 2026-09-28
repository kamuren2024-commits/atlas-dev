// ===============================================
// PHASE 01: AGENT HEARTBEAT MONITOR SERVICE
// ===============================================

import { getAgentRegistry } from './registry';
import { HeartbeatMetrics, HealthStatus } from './registry-types';

/**
 * HeartbeatMonitor - Manages agent liveness and health detection
 *
 * Mechanism:
 * 1. Agent starts heartbeat timer on registration
 * 2. Every `heartbeatInterval` seconds, agent sends metrics
 * 3. Registry renews lease in etcd
 * 4. If lease expires → etcd notifies → Registry marks as offline
 * 5. Orchestrator detects offline → rebalances
 */
export class HeartbeatMonitor {
  private intervalHandles: Map<string, NodeJS.Timeout> = new Map();
  private agentMetrics: Map<string, HeartbeatMetrics> = new Map();
  private readonly maxConsecutiveFailures = 3;
  private failureCount: Map<string, number> = new Map();

  /**
   * Start monitoring an agent
   * Called when agent registers with registry
   */
  async startMonitoring(
    agentId: string,
    intervalSeconds: number = 30,
    timeoutSeconds: number = 90
  ): Promise<void> {
    // Stop existing monitor if any
    this.stopMonitoring(agentId);

    const intervalMs = intervalSeconds * 1000;

    // Initial heartbeat
    await this.sendHeartbeat(agentId);

    // Set up recurring heartbeat
    const handle = setInterval(async () => {
      try {
        await this.sendHeartbeat(agentId);
        this.failureCount.set(agentId, 0);
      } catch (error) {
        const failures = (this.failureCount.get(agentId) || 0) + 1;
        this.failureCount.set(agentId, failures);

        console.error(`Heartbeat failed for ${agentId} (${failures}/${this.maxConsecutiveFailures}):`, error);

        if (failures >= this.maxConsecutiveFailures) {
          await this.markAgentUnhealthy(agentId, 'degraded');
        }
      }
    }, intervalMs);

    this.intervalHandles.set(agentId, handle);

    // Set up timeout to detect stalled agents
    setTimeout(async () => {
      const lastHeartbeat = this.agentMetrics.get(agentId)?.lastTaskTime;
      if (!lastHeartbeat) {
        await this.markAgentUnhealthy(agentId, 'unhealthy');
      }
    }, timeoutSeconds * 1000);

    console.log(`✅ Started monitoring agent ${agentId} (heartbeat every ${intervalSeconds}s)`);
  }

  /**
   * Stop monitoring an agent
   */
  stopMonitoring(agentId: string): void {
    const handle = this.intervalHandles.get(agentId);
    if (handle) {
      clearInterval(handle);
      this.intervalHandles.delete(agentId);
    }

    this.agentMetrics.delete(agentId);
    this.failureCount.delete(agentId);

    console.log(`✅ Stopped monitoring agent ${agentId}`);
  }

  /**
   * Send heartbeat for an agent
   * Collects metrics and updates registry
   */
  private async sendHeartbeat(agentId: string): Promise<void> {
    const registry = getAgentRegistry();
    const agent = await registry.getAgent(agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    // Collect metrics (simplified - in production, would query agent runtime)
    const metrics: HeartbeatMetrics = {
      agentId,
      memoryUsagePercent: Math.random() * 80, // Simulated
      cpuUsagePercent: Math.random() * 60,
      latencyMs: Math.random() * 50,
      tasksProcessed: Math.floor(Math.random() * 1000),
      errorsCount: Math.random() < 0.95 ? 0 : Math.floor(Math.random() * 3),
      lastTaskTime: new Date(),
    };

    // Determine health based on metrics
    let health: HealthStatus = 'healthy';
    if (metrics.memoryUsagePercent > 85 || metrics.cpuUsagePercent > 90) {
      health = 'degraded';
    }
    if (metrics.memoryUsagePercent > 95 || metrics.cpuUsagePercent > 99 || metrics.errorsCount > 10) {
      health = 'unhealthy';
    }

    // Update registry
    await registry.recordHeartbeat(agentId, metrics);
    this.agentMetrics.set(agentId, metrics);

    // Update health if changed
    if (agent.healthStatus !== health) {
      await registry.updateHealthStatus(agentId, health);
    }

    console.log(`💓 Heartbeat: ${agentId} - CPU: ${metrics.cpuUsagePercent.toFixed(1)}% MEM: ${metrics.memoryUsagePercent.toFixed(1)}% LAT: ${metrics.latencyMs.toFixed(1)}ms`);
  }

  /**
   * Mark agent as unhealthy (degraded or unhealthy)
   */
  private async markAgentUnhealthy(agentId: string, status: HealthStatus): Promise<void> {
    const registry = getAgentRegistry();

    try {
      await registry.updateHealthStatus(agentId, status);
      console.warn(`⚠️ Agent ${agentId} marked as ${status}`);

      // If unhealthy, also mark status as failed
      if (status === 'unhealthy') {
        await registry.updateStatus(agentId, 'failed');
        this.stopMonitoring(agentId);
        console.error(`❌ Agent ${agentId} marked as FAILED - monitoring stopped`);
      }
    } catch (error) {
      console.error(`Failed to update health status for ${agentId}:`, error);
    }
  }

  /**
   * Get metrics for an agent
   */
  getAgentMetrics(agentId: string): HeartbeatMetrics | undefined {
    return this.agentMetrics.get(agentId);
  }

  /**
   * Get all monitored agents
   */
  getMonitoredAgents(): string[] {
    return Array.from(this.intervalHandles.keys());
  }

  /**
   * Get heartbeat statistics
   */
  getHeartbeatStats(): {
    monitoredCount: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
    avgLatencyMs: number;
  } {
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    let totalLatency = 0;
    let latencyCount = 0;

    for (const metrics of this.agentMetrics.values()) {
      if (metrics.errorsCount === 0 && metrics.cpuUsagePercent < 80) {
        healthyCount++;
      } else if (metrics.errorsCount < 5 || metrics.cpuUsagePercent < 90) {
        degradedCount++;
      } else {
        unhealthyCount++;
      }

      totalLatency += metrics.latencyMs;
      latencyCount++;
    }

    return {
      monitoredCount: this.intervalHandles.size,
      healthyCount,
      degradedCount,
      unhealthyCount,
      avgLatencyMs: latencyCount > 0 ? totalLatency / latencyCount : 0,
    };
  }

  /**
   * Stop all monitoring
   * Called on shutdown
   */
  stopAll(): void {
    for (const agentId of this.intervalHandles.keys()) {
      this.stopMonitoring(agentId);
    }
    this.intervalHandles.clear();
    this.agentMetrics.clear();
    this.failureCount.clear();
    console.log('✅ All heartbeat monitoring stopped');
  }
}

// Singleton instance
let monitorInstance: HeartbeatMonitor | null = null;

export function getHeartbeatMonitor(): HeartbeatMonitor {
  if (!monitorInstance) {
    monitorInstance = new HeartbeatMonitor();
  }
  return monitorInstance;
}

export function setHeartbeatMonitor(monitor: HeartbeatMonitor): void {
  monitorInstance = monitor;
}
