export interface ProviderInfo {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  model: string;
  fallbackPriority: number;
  apiBase?: string;
}

export interface CostGovernanceConfig {
  monthlyBudgetUsd: number;
  dailyBudgetUsd: number;
  requestLimitPerMinute: number;
  maxRetries: number;
  maxAgentDepth: number;
  maxConcurrentWorkflows: number;
}

export interface TelemetryConfig {
  enableAiTelemetry: boolean;
  enableAiAuditLogging: boolean;
  enableProviderHealthMonitoring: boolean;
  enableCostTracking: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  ttlSeconds: number;
  backend: 'redis' | 'memory';
}

export interface SecurityConfig {
  enableSecretRotation: boolean;
  secretRotationDays: number;
  enableProviderIsolation: boolean;
}

export interface AIEnvironmentConfig {
  providers: Record<string, ProviderInfo>;
  forceProvider?: string;
  costGovernance: CostGovernanceConfig;
  telemetry: TelemetryConfig;
  caching: CachingConfig;
  security: SecurityConfig;
}
