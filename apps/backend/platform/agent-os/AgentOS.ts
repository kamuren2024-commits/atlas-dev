import { EventEmitter } from 'events';
import { ObservabilityEngine } from '../../../../platform/observability/Observability';

/**
 * Standard Capabilities for Enterprise Agents (conforms to Salience V2 standards)
 */
export type Capability = 
  | 'tender.formulation'
  | 'bid.evaluation'
  | 'supplier.risk'
  | 'contract.ocr'
  | 'contract.milestone'
  | 'inventory.replenishment'
  | 'logistics.demurrage'
  | 'project.bom'
  | 'compliance.regulation'
  | 'sourcing.cost'
  | 'digital.twin'
  | 'executive.synthesis';

export interface EnterpriseAgent {
  id: string;
  name: string;
  version: string;
  tenantId: string;
  capabilities: Capability[];
  status: 'idle' | 'busy' | 'offline' | 'error';
  memoryLimitBytes: number;
  cpuShares: number;

  execute(task: string, context: Record<string, any>): Promise<any>;
  observe(event: { type: string; payload: any }, context: Record<string, any>): Promise<void>;
  plan(prompt: string, context: Record<string, any>): Promise<string[]>;
  learn(feedback: string, context: Record<string, any>): Promise<void>;
  
  reportHealth(): { status: string; memoryUsed: number; cpuUsage: number; activeThreads: number };
  reportMetrics(): { tasksExecuted: number; errorsCount: number; averageLatencyMs: number };
}

/**
 * Decoupled High-Speed Broker for Multi-Agent Communication
 */
export class AgentCommunicationBus extends EventEmitter {
  private static instance: AgentCommunicationBus;
  private messageHistory: Array<{
    id: string;
    from: string;
    to: string;
    messageType: string;
    payload: any;
    traceId: string;
    timestamp: string;
  }> = [];

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): AgentCommunicationBus {
    if (!AgentCommunicationBus.instance) {
      AgentCommunicationBus.instance = new AgentCommunicationBus();
    }
    return AgentCommunicationBus.instance;
  }

  /**
   * Send a targeted point-to-point payload to an agent via the Bus
   */
  public async sendDirect(
    from: string,
    to: string,
    messageType: string,
    payload: any,
    traceId: string
  ): Promise<any> {
    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();
    const eventId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    this.messageHistory.push({
      id: eventId,
      from,
      to,
      messageType,
      payload,
      traceId: correlationId,
      timestamp: new Date().toISOString()
    });

    const targetAgent = AgentRegistry.getInstance().getAgent(to);
    if (!targetAgent) {
      throw new Error(`Target Agent [${to}] not found in Platform Registry.`);
    }

    if (targetAgent.status === 'offline') {
      throw new Error(`Target Agent [${to}] is current offline.`);
    }

    // Execute through observability wrapper
    return await ObservabilityEngine.traceAction(
      'AGENT_COMMUNICATION_SEND',
      from,
      { to, messageType, eventId },
      async () => {
        return await targetAgent.execute(messageType, { payload, traceId: correlationId });
      },
      correlationId
    );
  }

  /**
   * Broadcast a state event to all agents expressing compatibility
   */
  public broadcast(from: string, type: string, payload: any, traceId: string): void {
    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    this.messageHistory.push({
      id: eventId,
      from,
      to: 'ALL_BROADCAST',
      messageType: type,
      payload,
      traceId: correlationId,
      timestamp: new Date().toISOString()
    });

    const agents = AgentRegistry.getInstance().getAllAgents();
    for (const agent of agents) {
      if (agent.id === from) continue;
      
      // Async emission to avoid blocking standard runtime channels
      setImmediate(async () => {
        try {
          await agent.observe({ type, payload }, { traceId: correlationId });
        } catch (err) {
          console.error(`Agent ${agent.id} failed to observe broadcast status.`, err);
        }
      });
    }
  }

  public getBusHistory() {
    return this.messageHistory;
  }
}

/**
 * Registry & Lifecycle Manager of all active Agent Nodes
 */
export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents = new Map<string, EnterpriseAgent>();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  public register(agent: EnterpriseAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with duplicate ID [${agent.id}] already registered in Fabric.`);
    }
    this.agents.set(agent.id, agent);
  }

  public unregister(id: string): void {
    this.agents.delete(id);
  }

  public getAgent(id: string): EnterpriseAgent | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): EnterpriseAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentsByCapability(capability: Capability): EnterpriseAgent[] {
    return this.getAllAgents().filter(a => a.capabilities.includes(capability));
  }
}

/**
 * Core Agent OS Scheduler executing cron jobs
 */
export class AgentScheduler {
  private static instance: AgentScheduler;
  private scheduledJobs: Array<{
    id: string;
    cronExpression: string;
    task: string;
    targetAgentId: string;
    lastRun?: string;
  }> = [];

  private constructor() {}

  public static getInstance(): AgentScheduler {
    if (!AgentScheduler.instance) {
      AgentScheduler.instance = new AgentScheduler();
    }
    return AgentScheduler.instance;
  }

  public schedule(cronExpression: string, task: string, targetAgentId: string): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.scheduledJobs.push({ id: jobId, cronExpression, task, targetAgentId });
    return jobId;
  }

  public getJobs() {
    return this.scheduledJobs;
  }
}

/**
 * Agent OS resource allocation limits monitor
 */
export class AgentResourceManager {
  private static limits = new Map<string, { maxMemoryBytes: number; maxCpuShares: number }>();

  static setLimits(agentId: string, maxMemoryBytes: number, maxCpuShares: number) {
    this.limits.set(agentId, { maxMemoryBytes, maxCpuShares });
  }

  static getLimits(agentId: string) {
    return this.limits.get(agentId) || { maxMemoryBytes: 512 * 1024 * 1024, maxCpuShares: 1024 };
  }
}
