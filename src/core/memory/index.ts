/**
 * Enterprise Memory Fabric (EMF) — Runtime Export Entrypoint
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export { MemoryRuntime } from './runtime';
export { MemoryEventPublisher } from './events';
export { MemoryMetricsCollector } from './metrics';
export { MemoryGovernanceEngine } from './governance';
export { MemorySecurityGuard } from './security';
export { BaseMemoryProvider } from './providers';

export { MemoryLifecycleState } from './types';

export type {
  MemoryType,
  MemoryContext,
  MemoryEntry,
  MemoryVersion,
  MemorySnapshot,
  MemoryIndex,
  MemoryQuery,
  MemorySearchResult,
  MemoryPolicy,
  MemoryMetrics
} from './types';

export { MemoryIndexRegistry } from './index/index';

export type {
  IMemoryProvider,
  IMemoryLifecycle,
  IMemoryGovernance,
  IMemoryRuntime
} from './contracts';

export {
  WorkingMemoryProvider
} from './working';

export {
  SessionMemoryProvider
} from './session';

export {
  WorkflowMemoryProvider
} from './workflow';

export {
  AgentMemoryProvider
} from './agent';

export {
  SharedMemoryProvider
} from './shared';

export {
  OrganizationMemoryProvider,
  LongTermMemoryProvider
} from './organization';

export {
  deepClone,
  generateHash,
  generateUUID,
  sleep
} from './utils';

export {
  MemoryDiagnosticSuite
} from './testing/memory.test';
