/**
 * Enterprise Agent Framework (EAF) — Core Contracts
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import {
  AgentContext,
  AgentResult,
  AgentHealth,
  AgentMetadata,
  AgentConfiguration,
  AgentState,
  AgentCapability,
  AgentPermission
} from '../types';

export interface EnterpriseAgent {
  getMetadata(): AgentMetadata;
  getConfiguration(): AgentConfiguration;
  getState(): AgentState;
  execute(inputs: Record<string, any>, context: AgentContext): Promise<AgentResult>;
  getHealth(): AgentHealth;
}

export interface IAgentRegistry {
  register(agent: EnterpriseAgent): void;
  deregister(agentId: string): void;
  get(agentId: string): EnterpriseAgent | undefined;
  list(): EnterpriseAgent[];
  getHealth(agentId: string): AgentHealth | undefined;
}

export interface IAgentFactory {
  createAgent(config: AgentConfiguration): EnterpriseAgent;
}

export interface IAgentLifecycleManager {
  transitionTo(agentId: string, nextState: AgentState, reason?: string): void;
  getState(agentId: string): AgentState | undefined;
}

export interface IAgentDiscoveryService {
  findCapableOf(capability: string): EnterpriseAgent[];
  findWithPermissions(resource: string, permissionType: string): EnterpriseAgent[];
  query(filter: (agent: EnterpriseAgent) => boolean): EnterpriseAgent[];
}

export interface IAgentTelemetryCollector {
  recordExecution(result: AgentResult): void;
  recordFailure(agentId: string, error: string): void;
  getMetrics(agentId: string): any;
}
