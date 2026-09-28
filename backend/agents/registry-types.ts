// ===============================================
// PHASE 01: AGENT REGISTRY TYPES & INTERFACES
// ===============================================

/**
 * Agent registry type definitions for distributed registry service
 * Follows enterprise pattern: identity → versioning → status → lifecycle
 */

export type AgentStatus = 'registered' | 'active' | 'idle' | 'offline' | 'failed';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type RegistryEventType = 'register' | 'heartbeat' | 'status_change' | 'health_change' | 'deregister' | 'failover';

/**
 * Agent registry entry - persistent representation
 * Backed by PostgreSQL agents table
 */
export interface RegisteredAgent {
  // Identity
  agentId: string;
  agentName: string;
  agentDomain: string;

  // Versioning
  version: string;
  revisionNumber: number;

  // Status
  status: AgentStatus;
  healthStatus: HealthStatus;

  // Ownership & Multi-tenancy
  ownerId?: string;
  tenantId?: string;

  // Lifecycle
  lastHeartbeat?: Date;
  heartbeatIntervalSecs: number;
  healthCheckWindowSecs: number;

  // Capabilities
  capabilities: string[];
  memoryTypes: string[];
  toolIds: string[];

  // Regional & Cost
  region?: string;
  costEstimatePerHour?: number;

  // Phase 02 Enterprise Runtime Extensions
  agentType?: string;
  permissions?: string[];
  modelPolicy?: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  ontologyScope?: string[];
  tenantScope?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executionLimits?: {
    maxIterations?: number;
    timeoutSeconds?: number;
  };

  // Audit
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
}

/**
 * Agent lifecycle event - audit trail entry
 * Backed by PostgreSQL agent_registry_events table
 */
export interface AgentRegistryEvent {
  eventId: string;
  agentId: string;
  eventType: RegistryEventType;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  triggeredBy?: string;
  region?: string;
  errorMessage?: string;
  createdAt: Date;
  tenantId?: string;
}

/**
 * Lease handle returned on agent registration
 * Manages TTL and renewal
 */
export interface LeaseHandle {
  agentId: string;
  leaseId: string;
  ttlSeconds: number;
  createdAt: Date;
  expiresAt: Date;
  renewInterval: number; // milliseconds
  leaseOwner?: string;
  fencingToken?: number;
  status?: 'ACTIVE' | 'EXPIRED' | 'RELEASED';
}

/**
 * Heartbeat metrics sent by agents
 */
export interface HeartbeatMetrics {
  agentId: string;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  latencyMs: number;
  tasksProcessed: number;
  errorsCount: number;
  lastTaskTime?: Date;
  customMetrics?: Record<string, any>;
}

/**
 * Query filter for agent discovery
 */
export interface AgentQueryFilter {
  domain?: string;
  status?: AgentStatus;
  healthStatus?: HealthStatus;
  region?: string;
  tenantId?: string;
  ownerId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalAgents: number;
  activeAgents: number;
  healthyAgents: number;
  offlineAgents: number;
  byDomain: Record<string, number>;
  byRegion: Record<string, number>;
  avgHeartbeatLatencyMs: number;
  lastUpdated: Date;
}

/**
 * Registry health check result
 */
export interface RegistryHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  postgresql: boolean;
  etcd: boolean;
  cache: boolean;
  lastCheck: Date;
  metrics: RegistryStats;
}

/**
 * Agent registry service interface
 * Defines all registry operations
 */
export interface IAgentRegistry {
  // ============ Lifecycle ============
  register(agent: RegisteredAgent, leaseSeconds?: number): Promise<LeaseHandle>;
  deregister(agentId: string): Promise<void>;

  // ============ Query ============
  getAgent(agentId: string): Promise<RegisteredAgent | null>;
  queryAgents(filter: AgentQueryFilter): Promise<RegisteredAgent[]>;
  getAgentsByDomain(domain: string): Promise<RegisteredAgent[]>;
  getAgentsByStatus(status: AgentStatus): Promise<RegisteredAgent[]>;

  // ============ Status Management ============
  updateStatus(agentId: string, status: AgentStatus): Promise<void>;
  updateHealthStatus(agentId: string, health: HealthStatus): Promise<void>;
  recordHeartbeat(agentId: string, metrics: HeartbeatMetrics): Promise<void>;

  // ============ Multi-Region ============
  getRegionalAgents(region: string): Promise<RegisteredAgent[]>;
  failoverAgent(agentId: string, fromRegion: string, toRegion: string): Promise<void>;

  // ============ Lease Management ============
  renewLease(agentId: string, ttlSeconds: number): Promise<void>;
  releaseLease(agentId: string): Promise<void>;

  // ============ Discovery & Observability ============
  getRegistryEvents(agentId: string, limit?: number): Promise<AgentRegistryEvent[]>;
  getRegistryStats(): Promise<RegistryStats>;
  checkHealth(): Promise<RegistryHealthCheck>;
}

/**
 * Distributed registry configuration
 */
export interface RegistryConfig {
  // PostgreSQL connection
  postgresUrl: string;

  // etcd configuration
  etcdEndpoints: string[];
  etcdUsername?: string;
  etcdPassword?: string;

  // Heartbeat settings
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  ttlWindowMultiplier: number; // TTL = heartbeat * multiplier

  // Cache settings
  cacheEnabled: boolean;
  cacheTtlSeconds: number;

  // Regional configuration
  regions: string[];
  preferredRegion: string;

  // Observability
  enableMetrics: boolean;
  enableAuditLogging: boolean;
}

/**
 * Connection state for registry service
 */
export interface ConnectionState {
  postgresql: {
    connected: boolean;
    latencyMs: number;
    lastCheck: Date;
  };
  etcd: {
    connected: boolean;
    leader: string | null;
    members: number;
    lastCheck: Date;
  };
  cache: {
    enabled: boolean;
    size: number;
    hitRate: number;
  };
}
