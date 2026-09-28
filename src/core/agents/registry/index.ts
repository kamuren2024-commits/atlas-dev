/**
 * Enterprise Agent Framework (EAF) — Centralized Registry
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { EnterpriseAgent, IAgentRegistry } from '../contracts';
import { AgentHealth, AgentState } from '../types';
import { AgentLifecycleManager } from '../lifecycle';
import { AgentHealthTracker } from '../health';

export class AgentRegistry implements IAgentRegistry {
  private static instance: AgentRegistry;
  private agents = new Map<string, EnterpriseAgent>();
  private lifecycleManager: AgentLifecycleManager;
  private healthTracker: AgentHealthTracker;

  private constructor() {
    this.lifecycleManager = AgentLifecycleManager.getInstance();
    this.healthTracker = AgentHealthTracker.getInstance();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  public register(agent: EnterpriseAgent): void {
    const meta = agent.getMetadata();
    this.agents.set(meta.id, agent);
    this.lifecycleManager.transitionTo(meta.id, AgentState.REGISTERED, 'Registered in Centralized Registry');
  }

  public deregister(agentId: string): void {
    const exists = this.agents.get(agentId);
    if (exists) {
      this.lifecycleManager.transitionTo(agentId, AgentState.DISABLED, 'Agent deregistered from system');
      this.agents.delete(agentId);
    }
  }

  public get(agentId: string): EnterpriseAgent | undefined {
    return this.agents.get(agentId);
  }

  public list(): EnterpriseAgent[] {
    return Array.from(this.agents.values());
  }

  public getHealth(agentId: string): AgentHealth | undefined {
    if (!this.agents.has(agentId)) return undefined;
    return this.healthTracker.getHealth(agentId);
  }

  public clear(): void {
    this.agents.clear();
  }
}
