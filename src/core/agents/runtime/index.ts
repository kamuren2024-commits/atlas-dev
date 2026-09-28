/**
 * Enterprise Agent Framework (EAF) — Runtime Exports
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export { AgentRegistry } from '../registry';
export { AgentLifecycleManager } from '../lifecycle';
export { AgentTelemetryCollector } from '../telemetry';
export { AgentHealthTracker } from '../health';
export { AgentDiscoveryService } from '../discovery';
export { AgentFactory, BaseEnterpriseAgent } from '../factory';
export { AgentContextManager } from '../context';
export { AgentPermissionEngine } from '../permissions';
export { AgentGovernanceEngine } from '../governance';
export { AgentSecurityGuard } from '../security';
export { AgentEventPublisher } from '../events';

export { AgentState } from '../types';

export type {
  AgentMetadata,
  AgentCapabilityType,
  AgentCapability,
  AgentPolicy,
  AgentPermissionType,
  AgentPermission,
  AgentConfiguration,
  AgentHealth,
  AgentTelemetry,
  AgentContext,
  AgentResult
} from '../types';

export {
  TenderIntelligenceAgentAdapter,
  TenderIntelligenceAssistantAdapter,
  ProcurementIntelligenceAgentAdapter,
  SCMIntelligenceAgentAdapter,
  KnowledgeServicesAgentAdapter,
  DataSciencePlatformAgentAdapter,
  CyberOperationsAgentAdapter,
  AnalyticsAgentAdapter,
  DashboardServicesAgentAdapter
} from '../adapters';
