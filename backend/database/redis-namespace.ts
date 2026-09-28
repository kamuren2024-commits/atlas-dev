/**
 * Canonical Redis key namespace.
 *
 * Tenant-owned values must use a tenant-scoped builder. The legacy builders
 * intentionally use the non-tenant `system` scope for existing platform
 * housekeeping keys and preserve the RedisService public API.
 */

export type RedisScope = 'system' | 'tenant';
export type RedisEnvironment = 'development' | 'test' | 'staging' | 'production';

export interface RedisNamespaceConfig {
  environment: RedisEnvironment;
  prefix?: string;
}

function segment(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized || !/^[A-Za-z0-9._-]+$/.test(normalized)) {
    throw new Error(`Invalid Redis ${label}: expected a non-empty safe identifier`);
  }
  return normalized;
}

export class RedisNamespace {
  private readonly prefix: string;
  private readonly environment: RedisEnvironment;

  constructor(config: RedisNamespaceConfig) {
    this.prefix = segment(config.prefix || 'atlas', 'prefix');
    this.environment = segment(config.environment, 'environment') as RedisEnvironment;
  }

  private key(
    scope: RedisScope,
    tenantId: string,
    domain: string,
    resource: string,
    id: string
  ): string {
    const tenant = scope === 'tenant' ? segment(tenantId, 'tenant id') : 'system';
    return [
      this.prefix,
      this.environment,
      tenant,
      segment(domain, 'domain'),
      segment(resource, 'resource'),
      segment(id, 'id'),
    ].join(':');
  }

  cache(region: string, id: string): string {
    return this.key('system', 'system', 'cache', region, id);
  }

  cachePrefix(region: string): string {
    return [
      this.prefix,
      this.environment,
      'system',
      'cache',
      segment(region, 'cache region'),
    ].join(':') + ':';
  }

  tenantCache(tenantId: string, region: string, id: string): string {
    return this.key('tenant', tenantId, 'cache', region, id);
  }

  session(sessionId: string): string {
    return this.key('system', 'system', 'session', 'session', sessionId);
  }

  tenantSession(tenantId: string, sessionId: string): string {
    return this.key('tenant', tenantId, 'session', 'session', sessionId);
  }

  lock(id: string): string {
    return this.key('system', 'system', 'coordination', 'lock', id);
  }

  tenantLock(tenantId: string, id: string): string {
    return this.key('tenant', tenantId, 'coordination', 'lock', id);
  }

  rateLimit(tenantId: string, subject: string, window: string): string {
    return this.key('tenant', tenantId, 'rate_limit', window, subject);
  }

  agentMemory(tenantId: string, agentId: string, memoryId: string): string {
    return this.key('tenant', tenantId, 'agent', `${agentId}-memory`, memoryId);
  }

  semanticCache(tenantId: string, hash: string): string {
    return this.key('tenant', tenantId, 'semantic_cache', 'response', hash);
  }

  realtime(tenantId: string, resource: string, id: string): string {
    return this.key('tenant', tenantId, 'realtime', resource, id);
  }

  queue(queueName: string): string {
    return this.key('system', 'system', 'queue', 'job', queueName);
  }

  deadLetterQueue(queueName: string): string {
    return this.key('system', 'system', 'queue', 'dlq', queueName);
  }

  workerNode(nodeId: string): string {
    return this.key('system', 'system', 'coordination', 'worker', nodeId);
  }

  pattern(domain: string, resource: string): string {
    return [
      this.prefix,
      this.environment,
      '*',
      segment(domain, 'domain'),
      resource === '*' ? '*' : segment(resource, 'resource'),
      '*',
    ].join(':');
  }
}

export function getRedisEnvironment(value: string | undefined): RedisEnvironment {
  const environment = (value || 'development').toLowerCase();
  if (
    environment !== 'development' &&
    environment !== 'test' &&
    environment !== 'staging' &&
    environment !== 'production'
  ) {
    throw new Error(`Unsupported REDIS_ENVIRONMENT: ${environment}`);
  }
  return environment;
}
