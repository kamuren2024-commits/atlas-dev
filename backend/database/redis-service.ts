import Redis from 'ioredis';
import { ConfigService } from '../core/config/config-loader';
import { InfrastructurePolicyService } from '../core/config/infrastructure-policy';
import { randomBytes } from 'node:crypto';
import { getRedisEnvironment, RedisNamespace } from './redis-namespace';
import { generateId } from '../../src/core/shared/crypto';

// Initialize configuration loader
ConfigService.init();

export interface QueueJob {
  id: string;
  payload: any;
  priority: number;
  retries: number;
  maxRetries: number;
  error?: string;
  timestamp: number;
}

export interface WorkerStats {
  workerId: string;
  queueName: string;
  processedCount: number;
  failedCount: number;
  active: boolean;
  concurrency: number;
}

export interface RedisHealth {
  status: 'CONNECTED' | 'DEGRADED_FALLBACK' | 'DOWN';
  operationalStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  required: boolean;
  blocking: boolean;
  fallback: 'NONE' | 'IN_MEMORY';
  host: string;
  port: number;
  pingLatencyMs?: number;
  cacheKeysCount: number;
  activeSessionsCount: number;
  activeLocksCount: number;
  queueDepths: Record<string, number>;
  dlqDepths: Record<string, number>;
  activeWorkers: number;
  pubSubChannelsCount: number;
}

/**
 * Enterprise Centralized Redis & Runtime Platform Service
 */
export class RedisService {
  private static instance: RedisService;

  private client: Redis | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;

  private isEnabled = true;
  private isFallbackMode = false;
  private connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'FALLBACK' = 'DISCONNECTED';
  private readonly namespace: RedisNamespace;
  private maintenanceHandle?: NodeJS.Timeout;

  // In-Memory Fallback Storage
  private inMemoryCache = new Map<string, { value: any; expiresAt: number | null }>();
  private inMemorySessions = new Map<string, { value: any; expiresAt: number | null }>();
  private inMemoryLocks = new Map<string, { token: string; expiresAt: number }>();
  private inMemoryQueues = new Map<string, QueueJob[]>();
  private inMemoryDLQs = new Map<string, QueueJob[]>();
  private inMemoryFlags = new Map<string, any>();
  private inMemoryWorkerRegistry = new Map<string, { info: any; heartbeat: number }>();
  private inMemoryTenantCache = new Map<string, { value: any; expiresAt: number | null }>();
  private inMemoryAgentMemory = new Map<string, { value: any; expiresAt: number | null }>();
  private inMemoryRateLimits = new Map<string, { count: number; expiresAt: number }>();

  // Worker Processing
  private workers = new Map<string, {
    queueName: string;
    processor: (job: any) => Promise<void>;
    concurrency: number;
    maxRetries: number;
    stats: { processed: number; failed: number };
    active: boolean;
    intervalId?: NodeJS.Timeout;
  }>();

  // Pub/Sub Map
  private pubSubListeners = new Map<string, Set<(message: any) => void>>();
  private localSubscribers = new Map<string, { channel: string; callback: (message: any) => void }>();

  private constructor() {
    const policy = InfrastructurePolicyService.getPolicy();
    this.namespace = new RedisNamespace({
      environment: getRedisEnvironment(ConfigService.get('REDIS_ENVIRONMENT')),
      prefix: ConfigService.get('REDIS_KEY_PREFIX', 'atlas'),
    });

    if (process.env.REDIS_ENABLED === 'false') {
      if (policy.allowInMemoryFallback) {
        console.warn('[INFRA] Redis status: DEGRADED');
        console.warn('[INFRA] Redis fallback activated: IN_MEMORY');
        this.switchToFallback();
        return;
      } else {
        console.error('[REDIS-SERVICE] [CRITICAL] REDIS_ENABLED=false is forbidden in production policy.');
        this.connectionStatus = 'DISCONNECTED';
        this.isFallbackMode = false;
        return;
      }
    }

    this.initRedis();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Helper to check if the Redis client is fully connected and ready for traffic
   */
  public isClientReady(): boolean {
    return (
      !this.isFallbackMode &&
      this.connectionStatus === 'CONNECTED' &&
      this.client !== null &&
      this.client.status === 'ready'
    );
  }

  public isPubReady(): boolean {
    return (
      !this.isFallbackMode &&
      this.connectionStatus === 'CONNECTED' &&
      this.pubClient !== null &&
      this.pubClient.status === 'ready'
    );
  }

  public isSubReady(): boolean {
    return (
      !this.isFallbackMode &&
      this.connectionStatus === 'CONNECTED' &&
      this.subClient !== null &&
      this.subClient.status === 'ready'
    );
  }

  /**
   * Initialize actual Redis client with connection pooling, retries, and automatic failover fallback
   */
  private async initRedis() {
    const policy = InfrastructurePolicyService.getPolicy();
    const rawUrl = ConfigService.get('REDIS_URL');
    const rawHost = ConfigService.get('REDIS_HOST');
    const port = ConfigService.getNumber('REDIS_PORT', 6379);
    const password = ConfigService.get('REDIS_PASSWORD') || undefined;
    const db = ConfigService.getNumber('REDIS_DB', 0);
    const tlsEnabled = ConfigService.getBoolean('REDIS_TLS', false);

    // If no Redis host or URL is configured, activate in-memory fallback immediately in development/staging
    if (!rawUrl && !rawHost) {
      if (policy.allowInMemoryFallback) {
        this.switchToFallback();
        return;
      }
    }

    const url = rawUrl || `redis://${rawHost || 'localhost'}:${port}`;
    const host = rawHost || 'localhost';

    const options: import('ioredis').RedisOptions = {
      host,
      port,
      password,
      db,
      connectTimeout: 1500,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      ...(tlsEnabled ? { tls: {} } : {}),
    };

    try {
      this.client = new Redis(url, options);
      this.pubClient = new Redis(url, options);
      this.subClient = new Redis(url, options);

      this.setupEventHandlers(this.client, 'PRIMARY');
      this.setupEventHandlers(this.pubClient, 'PUB');
      this.setupEventHandlers(this.subClient, 'SUB');

      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1500))
      ]);
      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      this.connectionStatus = 'CONNECTED';
      this.isFallbackMode = false;
      console.log(`[INFRA] Redis connected successfully at ${host}:${port}. Status: HEALTHY`);
    } catch (err: any) {
      if (policy.allowInMemoryFallback) {
        console.warn('[INFRA] Redis status: DEGRADED');
        console.warn(`[INFRA] Redis unavailable (${err?.message || err}). Activating local fallback.`);
        this.switchToFallback();
      } else {
        console.error('[REDIS-SERVICE] [CRITICAL] Redis connection failed in production. Fail-closed enforced.');
        this.connectionStatus = 'DISCONNECTED';
        this.isFallbackMode = false;
        if (policy.redisBlocksStartup) {
          throw new Error(`Redis connection failed: Redis is required in production environment (${err?.message || err}).`);
        }
      }
    }
  }

  private setupEventHandlers(client: Redis, label: string) {
    client.on('connect', () => {
      console.log(`[REDIS-SERVICE] [${label}] Successfully connected to Redis.`);
      if (label === 'PRIMARY') {
        this.connectionStatus = 'CONNECTED';
        this.isFallbackMode = false;
      }
    });

    client.on('error', (err) => {
      const policy = InfrastructurePolicyService.getPolicy();
      if (this.connectionStatus !== 'FALLBACK') {
        if (policy.allowInMemoryFallback) {
          console.warn(`[INFRA] Redis error on [${label}]: ${err.message}. Marking DEGRADED.`);
          this.switchToFallback();
        } else {
          console.error(`[REDIS-SERVICE] [CRITICAL] Redis error on [${label}] in production:`, err.message);
          this.connectionStatus = 'DISCONNECTED';
          this.isFallbackMode = false;
        }
      }
    });

    client.on('reconnecting', () => {
      if (label === 'PRIMARY') {
        this.connectionStatus = 'RECONNECTING';
      }
    });

    client.on('close', () => {
      if (label === 'PRIMARY' && !this.isFallbackMode) {
        // Closed
      }
    });
  }

  private switchToFallback() {
    const policy = InfrastructurePolicyService.getPolicy();
    if (!policy.allowInMemoryFallback) {
      console.error('[SECURITY] Production Redis failure: in-memory fallback rejected.');
      this.connectionStatus = 'DISCONNECTED';
      this.isFallbackMode = false;
      return;
    }

    if (this.isFallbackMode) return;
    this.isFallbackMode = true;
    this.connectionStatus = 'FALLBACK';

    // Safely remove listeners & disconnect any pending ioredis clients so they don't retry or emit socket errors
    const cleanupClient = (cli: Redis | null) => {
      if (!cli) return;
      try {
        cli.removeAllListeners();
        cli.disconnect();
      } catch {}
    };

    cleanupClient(this.client);
    cleanupClient(this.pubClient);
    cleanupClient(this.subClient);
    this.client = null;
    this.pubClient = null;
    this.subClient = null;

    console.warn('[INFRA] Redis fallback activated: IN_MEMORY');

    // Setup background ticker to simulate distributed worker processing and lock expiration
    this.startFallbackMaintenanceEngine();
  }

  private startFallbackMaintenanceEngine() {
    // Periodically expire local locks and process background queues
    this.maintenanceHandle = setInterval(() => {
      const now = Date.now();

      // Expire locks
      for (const [key, lock] of this.inMemoryLocks.entries()) {
        if (now > lock.expiresAt) {
          this.inMemoryLocks.delete(key);
        }
      }

      // Expire cache entries
      for (const [key, cache] of this.inMemoryCache.entries()) {
        if (cache.expiresAt && now > cache.expiresAt) {
          this.inMemoryCache.delete(key);
        }
      }

      // Expire session entries
      for (const [key, sess] of this.inMemorySessions.entries()) {
        if (sess.expiresAt && now > sess.expiresAt) {
          this.inMemorySessions.delete(key);
        }
      }
    }, 1000);
  }

  // ============================================================================
  // ENTERPRISE CACHE LAYER
  // ============================================================================

  public async getCache<T>(region: string, key: string): Promise<T | null> {
    const fullKey = this.namespace.cache(region, key);
    if (this.isClientReady()) {
      try {
        const val = await this.client!.get(fullKey);
        return val ? JSON.parse(val) as T : null;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error reading ${fullKey}:`, err.message);
      }
    }

    // Fallback Mode
    const entry = this.inMemoryCache.get(fullKey);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.inMemoryCache.delete(fullKey);
      return null;
    }
    return entry.value as T;
  }

  public async setCache<T>(region: string, key: string, value: T, ttlSeconds?: number): Promise<void> {
    const fullKey = this.namespace.cache(region, key);
    const stringified = JSON.stringify(value);
    if (ttlSeconds !== undefined && (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0)) {
      throw new Error('Redis cache TTL must be a positive integer number of seconds');
    }

    if (this.isClientReady()) {
      try {
        if (ttlSeconds) {
          await this.client!.set(fullKey, stringified, 'EX', ttlSeconds);
        } else {
          await this.client!.set(fullKey, stringified);
        }
        return;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error writing ${fullKey}:`, err.message);
      }
    }

    // Fallback Mode
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemoryCache.set(fullKey, { value, expiresAt });
  }

  public async deleteCache(region: string, key: string): Promise<void> {
    const fullKey = this.namespace.cache(region, key);
    if (this.isClientReady()) {
      try {
        await this.client!.del(fullKey);
        return;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error deleting ${fullKey}:`, err.message);
      }
    }

    // Fallback Mode
    this.inMemoryCache.delete(fullKey);
  }

  public async clearCacheRegion(region: string): Promise<void> {
    const pattern = this.namespace.pattern('cache', region);
    if (this.isClientReady()) {
      try {
        const keys = await this.client!.keys(pattern);
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
        return;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error clearing region ${region}:`, err.message);
      }
    }

    // Fallback Mode
    for (const key of this.inMemoryCache.keys()) {
      if (key.startsWith(this.namespace.cachePrefix(region))) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  public async clearAllCache(): Promise<void> {
    if (this.isClientReady()) {
      try {
        const keys = await this.client!.keys('cache:*');
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
        return;
      } catch (err: any) {
        console.error('[REDIS-CACHE] Error clearing all cache:', err.message);
      }
    }

    // Fallback Mode
    this.inMemoryCache.clear();
  }

  public async getTenantCache<T>(tenantId: string, region: string, key: string): Promise<T | null> {
    const fullKey = this.namespace.tenantCache(tenantId, region, key);
    if (this.isClientReady()) {
      try {
        const value = await this.client!.get(fullKey);
        return value ? JSON.parse(value) as T : null;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error reading tenant cache ${fullKey}:`, err.message);
      }
    }
    const entry = this.inMemoryTenantCache.get(fullKey);
    if (entry) {
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.inMemoryTenantCache.delete(fullKey);
        return null;
      }
      return entry.value as T;
    }
    return null;
  }

  public async setTenantCache<T>(
    tenantId: string,
    region: string,
    key: string,
    value: T,
    ttlSeconds: number
  ): Promise<void> {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('Tenant cache TTL must be a positive integer number of seconds');
    }
    const fullKey = this.namespace.tenantCache(tenantId, region, key);
    if (this.isClientReady()) {
      try {
        await this.client!.set(fullKey, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        console.error(`[REDIS-CACHE] Error writing tenant cache ${fullKey}:`, err.message);
      }
    }
    const policy = InfrastructurePolicyService.getPolicy();
    if (policy.allowInMemoryFallback) {
      this.inMemoryTenantCache.set(fullKey, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    throw new Error('Tenant cache requires a connected Redis instance');
  }

  public async saveAgentMemory(
    tenantId: string,
    agentId: string,
    memoryId: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<void> {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('Agent memory TTL must be a positive integer number of seconds');
    }
    const key = this.namespace.agentMemory(tenantId, agentId, memoryId);
    if (this.isClientReady()) {
      try {
        await this.client!.set(key, JSON.stringify({
          schema_version: 1,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
          value,
        }), 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        console.error(`[REDIS-AGENT] Error saving memory ${key}:`, err.message);
      }
    }
    const policy = InfrastructurePolicyService.getPolicy();
    if (policy.allowInMemoryFallback) {
      this.inMemoryAgentMemory.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    throw new Error('Agent memory requires a connected Redis instance');
  }

  public async getAgentMemory<T>(
    tenantId: string,
    agentId: string,
    memoryId: string
  ): Promise<T | null> {
    const key = this.namespace.agentMemory(tenantId, agentId, memoryId);
    if (this.isClientReady()) {
      try {
        const raw = await this.client!.get(key);
        if (raw) {
          const envelope = JSON.parse(raw) as { value: T };
          return envelope.value;
        }
        return null;
      } catch (err: any) {
        console.error(`[REDIS-AGENT] Error getting memory ${key}:`, err.message);
      }
    }
    const entry = this.inMemoryAgentMemory.get(key);
    if (entry) {
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.inMemoryAgentMemory.delete(key);
        return null;
      }
      return entry.value as T;
    }
    return null;
  }

  public async incrementRateLimit(
    tenantId: string,
    subject: string,
    window: string,
    windowSeconds: number,
    limit: number
  ): Promise<{ allowed: boolean; count: number; remaining: number }> {
    if (!Number.isInteger(windowSeconds) || windowSeconds <= 0 || !Number.isInteger(limit) || limit <= 0) {
      throw new Error('Rate-limit window and limit must be positive integers');
    }
    const key = this.namespace.rateLimit(tenantId, subject, window);
    if (this.isClientReady()) {
      try {
        const count = await this.client!.incr(key);
        if (count === 1) await this.client!.expire(key, windowSeconds);
        return { allowed: count <= limit, count, remaining: Math.max(0, limit - count) };
      } catch (err: any) {
        console.error(`[REDIS-RATE-LIMIT] Error checking rate limit ${key}:`, err.message);
      }
    }

    const policy = InfrastructurePolicyService.getPolicy();
    if (policy.allowInMemoryFallback) {
      const now = Date.now();
      const existing = this.inMemoryRateLimits.get(key);
      let count = 1;
      if (existing && now < existing.expiresAt) {
        count = existing.count + 1;
        this.inMemoryRateLimits.set(key, { count, expiresAt: existing.expiresAt });
      } else {
        this.inMemoryRateLimits.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      }
      return { allowed: count <= limit, count, remaining: Math.max(0, limit - count) };
    }

    throw new Error('Distributed rate limiting requires a connected Redis instance');
  }

  // ============================================================================
  // DISTRIBUTED SESSION RUNTIME
  // ============================================================================

  public async saveSession(sessionId: string, sessionData: any, ttlSeconds?: number): Promise<void> {
    const fullKey = this.namespace.session(sessionId);
    if (ttlSeconds !== undefined && (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0)) {
      throw new Error('Redis session TTL must be a positive integer number of seconds');
    }
    const stringified = JSON.stringify(sessionData);

    if (this.isClientReady()) {
      try {
        if (ttlSeconds) {
          await this.client!.set(fullKey, stringified, 'EX', ttlSeconds);
        } else {
          await this.client!.set(fullKey, stringified);
        }
        return;
      } catch (err: any) {
        console.error(`[REDIS-SESSION] Error saving session ${sessionId}:`, err.message);
      }
    }

    // Fallback Mode
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemorySessions.set(fullKey, { value: sessionData, expiresAt });
  }

  public async getSession(sessionId: string): Promise<any | null> {
    const fullKey = this.namespace.session(sessionId);
    if (this.isClientReady()) {
      try {
        const val = await this.client!.get(fullKey);
        return val ? JSON.parse(val) : null;
      } catch (err: any) {
        console.error(`[REDIS-SESSION] Error retrieving session ${sessionId}:`, err.message);
      }
    }

    // Fallback Mode
    const entry = this.inMemorySessions.get(fullKey);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.inMemorySessions.delete(fullKey);
      return null;
    }
    return entry.value;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    const fullKey = this.namespace.session(sessionId);
    if (this.isClientReady()) {
      try {
        await this.client!.del(fullKey);
        return;
      } catch (err: any) {
        console.error(`[REDIS-SESSION] Error deleting session ${sessionId}:`, err.message);
      }
    }

    // Fallback Mode
    this.inMemorySessions.delete(fullKey);
  }

  // ============================================================================
  // DISTRIBUTED LOCKS
  // ============================================================================

  public async acquireLock(lockKey: string, ttlMs: number, acquireTimeoutMs = 1500): Promise<string | null> {
    if (!Number.isInteger(ttlMs) || ttlMs <= 0) {
      throw new Error('Redis lock TTL must be a positive integer number of milliseconds');
    }
    if (!Number.isInteger(acquireTimeoutMs) || acquireTimeoutMs < 0) {
      throw new Error('Redis lock acquisition timeout must be a non-negative integer');
    }
    const key = this.namespace.lock(lockKey);
    const token = randomBytes(32).toString('hex');
    const start = Date.now();

    while (Date.now() - start < acquireTimeoutMs) {
      if (this.isClientReady()) {
        try {
          // SET key value PX ttlMs NX
          const result = await this.client!.set(key, token, 'PX', ttlMs, 'NX');
          if (result === 'OK') {
            return token;
          }
        } catch (err: any) {
          console.error(`[REDIS-LOCK] Error acquiring lock on ${lockKey}:`, err.message);
          const policy = InfrastructurePolicyService.getPolicy();
          if (!policy.allowInMemoryFallback) {
            throw err;
          }
          this.switchToFallback();
        }
      }

      if (!this.isClientReady()) {
        const policy = InfrastructurePolicyService.getPolicy();
        if (policy.allowInMemoryFallback) {
          const existing = this.inMemoryLocks.get(key);
          if (!existing || Date.now() > existing.expiresAt) {
            this.inMemoryLocks.set(key, { token, expiresAt: Date.now() + ttlMs });
            return token;
          }
        } else {
          return null;
        }
      }

      // Stagger retry
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return null; // Could not acquire lock within timeout
  }

  public async releaseLock(lockKey: string, token: string): Promise<boolean> {
    const key = this.namespace.lock(lockKey);

    if (this.isClientReady()) {
      try {
        // Lua Script to release lock safely (ensures owner token matches)
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const result = await this.client!.eval(luaScript, 1, key, token);
        return result === 1;
      } catch (err: any) {
        console.error(`[REDIS-LOCK] Error releasing lock on ${lockKey}:`, err.message);
      }
    }

    // Fallback Mode Lock Release
    const existing = this.inMemoryLocks.get(key);
    if (existing && existing.token === token) {
      this.inMemoryLocks.delete(key);
      return true;
    }
    return false;
  }

  public async renewLock(lockKey: string, token: string, ttlMs: number): Promise<boolean> {
    if (!Number.isInteger(ttlMs) || ttlMs <= 0) {
      throw new Error('Redis lock TTL must be a positive integer number of milliseconds');
    }
    const key = this.namespace.lock(lockKey);

    if (this.isClientReady()) {
      try {
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("pexpire", KEYS[1], ARGV[2])
          else
            return 0
          end
        `;
        const result = await this.client!.eval(luaScript, 1, key, token, ttlMs);
        return result === 1;
      } catch (err: any) {
        console.error(`[REDIS-LOCK] Error renewing lock on ${lockKey}:`, err.message);
      }
    }

    // Fallback Mode Lock Renewal
    const existing = this.inMemoryLocks.get(key);
    if (existing && existing.token === token) {
      existing.expiresAt = Date.now() + ttlMs;
      this.inMemoryLocks.set(key, existing);
      return true;
    }
    return false;
  }

  // ============================================================================
  // ENTERPRISE QUEUE INFRASTRUCTURE
  // ============================================================================

  public async enqueueJob(queueName: string, jobPayload: any, priority = 0, existingJob?: QueueJob): Promise<string> {
    const jobId = existingJob ? existingJob.id : generateId('job');
    const job: QueueJob = existingJob || {
      id: jobId,
      payload: jobPayload,
      priority,
      retries: 0,
      maxRetries: 3,
      timestamp: Date.now()
    };

    if (this.isClientReady()) {
      try {
        // Enqueue to sorted set based on priority or list
        const queueKey = this.namespace.queue(queueName);
        // For prioritized queues, we can store in a sorted set or serial list
        // Simple list-based LPOP/RPUSH is extremely stable for standard FIFO
        await this.client!.rpush(queueKey, JSON.stringify(job));
        await this.publish(`event:queue:${queueName}`, { action: 'ENQUEUE', jobId });
        return jobId;
      } catch (err: any) {
        console.error(`[REDIS-QUEUE] Error enqueuing job to ${queueName}:`, err.message);
      }
    }

    // Fallback Mode
    if (!this.inMemoryQueues.has(queueName)) {
      this.inMemoryQueues.set(queueName, []);
    }
    const q = this.inMemoryQueues.get(queueName)!;
    q.push(job);
    // Sort descending by priority so high priority items are processed first
    q.sort((a, b) => b.priority - a.priority);

    // Fire event locally
    this.publish(`event:queue:${queueName}`, { action: 'ENQUEUE', jobId }).catch(() => {});

    return jobId;
  }

  public async dequeueJob(queueName: string): Promise<QueueJob | null> {
    if (this.isClientReady()) {
      try {
        const queueKey = `queue:${queueName}`;
        const raw = await this.client!.lpop(queueKey);
        return raw ? JSON.parse(raw) as QueueJob : null;
      } catch (err: any) {
        console.error(`[REDIS-QUEUE] Error dequeuing job from ${queueName}:`, err.message);
      }
    }

    // Fallback Mode
    const q = this.inMemoryQueues.get(queueName);
    if (!q || q.length === 0) return null;
    return q.shift() || null;
  }

  public async getQueueSize(queueName: string): Promise<number> {
    if (this.isClientReady()) {
      try {
        return await this.client!.llen(this.namespace.queue(queueName));
      } catch (err: any) {
        console.error(`[REDIS-QUEUE] Error getting size for ${queueName}:`, err.message);
      }
    }
    return this.inMemoryQueues.get(queueName)?.length || 0;
  }

  public async getDLQSize(queueName: string): Promise<number> {
    const dlqKey = this.namespace.deadLetterQueue(queueName);
    if (this.isClientReady()) {
      try {
        return await this.client!.llen(dlqKey);
      } catch (err: any) {
        console.error(`[REDIS-DLQ] Error getting size for DLQ ${queueName}:`, err.message);
      }
    }
    return this.inMemoryDLQs.get(queueName)?.length || 0;
  }

  public async moveJobToDLQ(queueName: string, job: QueueJob, errorReason: string): Promise<void> {
    const dlqKey = `dlq:${queueName}`;
    job.error = errorReason;

    console.error(`[REDIS-DLQ] Dead Letter Queue Triggered for Job ${job.id} on Queue "${queueName}". Error: ${errorReason}`);

    if (this.isClientReady()) {
      try {
        await this.client!.rpush(dlqKey, JSON.stringify(job));
        return;
      } catch (err: any) {
        console.error(`[REDIS-DLQ] Error putting job to DLQ ${queueName}:`, err.message);
      }
    }

    // Fallback Mode
    if (!this.inMemoryDLQs.has(queueName)) {
      this.inMemoryDLQs.set(queueName, []);
    }
    this.inMemoryDLQs.get(queueName)!.push(job);
  }

  // ============================================================================
  // BACKGROUND WORKER FRAMEWORK
  // ============================================================================

  public registerWorker(
    queueName: string,
    processor: (job: any) => Promise<void>,
    options?: { concurrency?: number; maxRetries?: number }
  ): string {
    const workerId = generateId('worker');
    const concurrency = options?.concurrency || 1;
    const maxRetries = options?.maxRetries || 3;

    console.log(`[REDIS-WORKER] Registering background worker node ${workerId} for queue "${queueName}" with concurrency: ${concurrency}`);

    const stats = { processed: 0, failed: 0 };
    const intervalId = setInterval(async () => {
      // Process up to concurrency count
      for (let i = 0; i < concurrency; i++) {
        try {
          const job = await this.dequeueJob(queueName);
          if (!job) break; // no more jobs available right now

          // Execute processing under Distributed Lock protection to guarantee exclusive transaction node boundaries
          const lockKey = `job_process_lock_${queueName}_${job.id}`;
          const lockToken = await this.acquireLock(lockKey, 15000, 100);

          if (!lockToken) {
            // Lock active elsewhere, re-queue
            console.warn(`[REDIS-WORKER] Lock collision detected on job ${job.id}. Staggering back to primary pool.`);
            if (this.isClientReady()) {
              await this.client!.rpush(this.namespace.queue(queueName), JSON.stringify(job));
            } else {
              this.inMemoryQueues.get(queueName)?.push(job);
            }
            continue;
          }

          try {
            // Run processing
            await processor(job.payload);
            stats.processed++;
            // Publish status updates
            this.publish(`event:job:${job.id}`, { status: 'COMPLETED', queueName }).catch(() => {});
          } catch (err: any) {
            console.error(`[REDIS-WORKER] Job ${job.id} execution failed on attempt ${job.retries + 1}/${maxRetries}. Error:`, err.message);
            job.retries++;
            if (job.retries >= maxRetries) {
              await this.moveJobToDLQ(queueName, job, err.message || 'Execution retries exhausted');
              stats.failed++;
              this.publish(`event:job:${job.id}`, { status: 'FAILED', error: err.message }).catch(() => {});
            } else {
              // Exponential backoff reschedule
              const backoffMs = Math.pow(2, job.retries) * 1000;
              setTimeout(() => {
                this.enqueueJob(queueName, job.payload, job.priority, job).catch(err => {
                  console.error('[REDIS-WORKER] Failback re-enqueue failed:', err);
                });
              }, backoffMs);
            }
          } finally {
            await this.releaseLock(lockKey, lockToken);
          }
        } catch (deqErr: any) {
          console.error('[REDIS-WORKER] Dequeue processing loop crash:', deqErr.message);
        }
      }
    }, 500); // Poll fast

    this.workers.set(workerId, {
      queueName,
      processor,
      concurrency,
      maxRetries,
      stats,
      active: true,
      intervalId
    });

    return workerId;
  }

  public unregisterWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      if (worker.intervalId) {
        clearInterval(worker.intervalId);
      }
      worker.active = false;
      this.workers.delete(workerId);
      console.log(`[REDIS-WORKER] Unregistered worker node ${workerId}.`);
    }
  }

  public getWorkerStats(): WorkerStats[] {
    const stats: WorkerStats[] = [];
    for (const [id, w] of this.workers.entries()) {
      stats.push({
        workerId: id,
        queueName: w.queueName,
        processedCount: w.stats.processed,
        failedCount: w.stats.failed,
        active: w.active,
        concurrency: w.concurrency
      });
    }
    return stats;
  }

  // ============================================================================
  // DISTRIBUTED PUB/SUB
  // ============================================================================

  public async publish(channel: string, message: any): Promise<void> {
    const payloadString = JSON.stringify(message);

    if (this.isPubReady()) {
      try {
        await this.pubClient!.publish(channel, payloadString);
        return;
      } catch (err: any) {
        console.error(`[REDIS-PUB] Error publishing to ${channel}:`, err.message);
      }
    }

    // Local Emulation Delivery
    const listeners = this.pubSubListeners.get(channel);
    if (listeners) {
      listeners.forEach(cb => {
        try {
          cb(message);
        } catch (err: any) {
          console.error(`[REDIS-SUB] Subscriber callback failed on channel ${channel}:`, err.message);
        }
      });
    }
  }

  public async subscribe(channel: string, callback: (message: any) => void): Promise<string> {
    const subscriptionId = generateId('sub');

    if (this.isSubReady()) {
      try {
        await this.subClient!.subscribe(channel);
        this.subClient!.on('message', (chan, msg) => {
          if (chan === channel) {
            try {
              callback(JSON.parse(msg));
            } catch (err) {
              callback(msg);
            }
          }
        });
      } catch (err: any) {
        console.error(`[REDIS-SUB] Failed to subscribe to Redis channel ${channel}:`, err.message);
      }
    }

    // Local registry
    if (!this.pubSubListeners.has(channel)) {
      this.pubSubListeners.set(channel, new Set());
    }
    this.pubSubListeners.get(channel)!.add(callback);
    this.localSubscribers.set(subscriptionId, { channel, callback });

    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): void {
    const sub = this.localSubscribers.get(subscriptionId);
    if (sub) {
      const listeners = this.pubSubListeners.get(sub.channel);
      if (listeners) {
        listeners.delete(sub.callback);
      }
      this.localSubscribers.delete(subscriptionId);
    }
  }

  // ============================================================================
  // RUNTIME COORDINATION
  // ============================================================================

  public async setFlag(name: string, value: any): Promise<void> {
    const key = `flag:${name}`;
    if (this.isClientReady()) {
      try {
        await this.client!.set(key, JSON.stringify(value));
        return;
      } catch (err: any) {
        console.error(`[REDIS-COORDINATION] Error setting flag ${name}:`, err.message);
      }
    }
    this.inMemoryFlags.set(key, value);
  }

  public async getFlag<T>(name: string, defaultVal: T): Promise<T> {
    const key = `flag:${name}`;
    if (this.isClientReady()) {
      try {
        const val = await this.client!.get(key);
        return val ? JSON.parse(val) as T : defaultVal;
      } catch (err: any) {
        console.error(`[REDIS-COORDINATION] Error getting flag ${name}:`, err.message);
      }
    }
    return this.inMemoryFlags.has(key) ? this.inMemoryFlags.get(key) as T : defaultVal;
  }

  public async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.setFlag('maintenance_mode', enabled);
    await this.publish('event:system:maintenance', { enabled });
  }

  public async isMaintenanceMode(): Promise<boolean> {
    return await this.getFlag<boolean>('maintenance_mode', false);
  }

  public async registerActiveWorkerNode(nodeId: string, info: any): Promise<void> {
    const key = this.namespace.workerNode(nodeId);
    if (this.isClientReady()) {
      try {
        await this.client!.set(key, JSON.stringify(info), 'EX', 10); // 10 second keep-alive heartbeat
        return;
      } catch (err: any) {
        console.error(`[REDIS-COORDINATION] Error registering node ${nodeId}:`, err.message);
      }
    }
    this.inMemoryWorkerRegistry.set(key, { info, heartbeat: Date.now() });
  }

  public async getActiveWorkerNodes(): Promise<any[]> {
    if (this.isClientReady()) {
      try {
        const keys = await this.client!.keys(this.namespace.pattern('coordination', 'worker'));
        const list: any[] = [];
        for (const k of keys) {
          const val = await this.client!.get(k);
          if (val) list.push(JSON.parse(val));
        }
        return list;
      } catch (err: any) {
        console.error('[REDIS-COORDINATION] Error loading active worker nodes:', err.message);
      }
    }

    // Fallback Mode cleanup stale
    const now = Date.now();
    const list: any[] = [];
    for (const [key, node] of this.inMemoryWorkerRegistry.entries()) {
      if (now - node.heartbeat > 10000) {
        this.inMemoryWorkerRegistry.delete(key);
      } else {
        list.push(node.info);
      }
    }
    return list;
  }

  public async performLeaderElection(nodeId: string): Promise<boolean> {
    const lockKey = 'leader_election_lock';
    // Attempt to acquire leader role for 30 seconds
    const token = await this.acquireLock(lockKey, 30000, 200);
    if (token) {
      // Elected Leader! Keep renewing the leadership in background asynchronously
      setInterval(async () => {
        await this.renewLock(lockKey, token, 30000);
      }, 10000);
      return true;
    }
    return false;
  }

  // ============================================================================
  // GRACEFUL SHUTDOWN
  // ============================================================================

  public async shutdown(): Promise<void> {
    console.log('[REDIS-SERVICE] Gracefully shutting down Redis Service and background workers...');
    if (this.maintenanceHandle) {
      clearInterval(this.maintenanceHandle);
      this.maintenanceHandle = undefined;
    }
    for (const [id, w] of this.workers.entries()) {
      this.unregisterWorker(id);
    }
    
    const disconnectSafely = async (cli: Redis | null) => {
      if (!cli) return;
      try {
        if (this.connectionStatus === 'CONNECTED') {
          await cli.quit();
        } else {
          cli.disconnect();
        }
      } catch {
        try {
          cli.disconnect();
        } catch {}
      }
    };

    await disconnectSafely(this.client);
    await disconnectSafely(this.pubClient);
    await disconnectSafely(this.subClient);
    
    this.connectionStatus = 'DISCONNECTED';
    console.log('[REDIS-SERVICE] Redis service disconnected cleanly.');
  }

  // ============================================================================
  // HEALTH REPORTING
  // ============================================================================

  public async getHealthReport(): Promise<RedisHealth> {
    let pingLatencyMs: number | undefined = undefined;
    let actualCacheCount = this.inMemoryCache.size;
    let actualSessionCount = this.inMemorySessions.size;
    let actualLockCount = this.inMemoryLocks.size;

    const queueDepths: Record<string, number> = {};
    const dlqDepths: Record<string, number> = {};

    // Standard list of enterprise queues
    const queueNames = ['ai_agent', 'document_ocr', 'compliance_audit', 'reports'];
    for (const q of queueNames) {
      queueDepths[q] = await this.getQueueSize(q);
      dlqDepths[q] = await this.getDLQSize(q);
    }

    if (this.isClientReady()) {
      try {
        const start = Date.now();
        await this.client!.ping();
        pingLatencyMs = Date.now() - start;

        const cacheKeys = await this.client!.keys(this.namespace.pattern('cache', '*'));
        actualCacheCount = cacheKeys.length;

        const sessionKeys = await this.client!.keys(this.namespace.pattern('session', 'session'));
        actualSessionCount = sessionKeys.length;

        const lockKeys = await this.client!.keys(this.namespace.pattern('coordination', 'lock'));
        actualLockCount = lockKeys.length;
      } catch (err) {
        // Safe degrade
      }
    }

    const policy = InfrastructurePolicyService.getPolicy();
    const isConnected = this.isClientReady();
    const isDegraded = this.isFallbackMode;
    const operationalStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' = isConnected ? 'HEALTHY' : (isDegraded ? 'DEGRADED' : 'DOWN');

    return {
      status: isConnected ? 'CONNECTED' : (isDegraded ? 'DEGRADED_FALLBACK' : 'DOWN'),
      operationalStatus,
      required: policy.redisRequired,
      blocking: policy.redisBlocksStartup,
      fallback: this.isFallbackMode ? 'IN_MEMORY' : 'NONE',
      host: isConnected ? (ConfigService.get('REDIS_HOST') || 'localhost') : (this.isFallbackMode ? 'in-memory-dev' : (ConfigService.get('REDIS_HOST') || 'localhost')),
      port: ConfigService.getNumber('REDIS_PORT', 6379),
      pingLatencyMs,
      cacheKeysCount: actualCacheCount,
      activeSessionsCount: actualSessionCount,
      activeLocksCount: actualLockCount,
      queueDepths,
      dlqDepths,
      activeWorkers: this.workers.size,
      pubSubChannelsCount: this.pubSubListeners.size
    };
  }
}
