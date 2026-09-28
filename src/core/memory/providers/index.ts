/**
 * Enterprise Memory Fabric (EMF) — Standardized Base Memory Provider
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { IMemoryProvider } from '../contracts';
import {
  MemoryEntry,
  MemoryContext,
  MemoryType,
  MemoryQuery,
  MemorySearchResult,
  MemoryVersion,
  MemoryLifecycleState,
  MemoryPolicy
} from '../types';
import { MemoryCache } from '../cache';
import { MemoryVersioningManager } from '../versioning';
import { MemoryIndexRegistry } from '../index/index';
import { MemorySearchEngine } from '../search';
import { MemorySecurityGuard } from '../security';
import { MemoryGovernanceEngine } from '../governance';
import { MemoryEventPublisher } from '../events';
import { MemoryMetricsCollector } from '../metrics';
import { generateHash, generateUUID, deepClone } from '../utils';

export class BaseMemoryProvider implements IMemoryProvider {
  protected type: MemoryType;
  protected entries = new Map<string, MemoryEntry>();
  protected cache: MemoryCache;
  protected versioning: MemoryVersioningManager;
  protected indexRegistry: MemoryIndexRegistry;
  protected searchEngine: MemorySearchEngine;
  protected metricsCollector: MemoryMetricsCollector;

  // Custom policies per memory type
  protected defaultPolicy: MemoryPolicy;

  constructor(type: MemoryType, customPolicy?: Partial<MemoryPolicy>) {
    this.type = type;
    this.cache = new MemoryCache(type);
    this.versioning = new MemoryVersioningManager();
    this.indexRegistry = new MemoryIndexRegistry();
    this.searchEngine = new MemorySearchEngine(this.indexRegistry);
    this.metricsCollector = MemoryMetricsCollector.getInstance(type);

    this.defaultPolicy = {
      classification: 'INTERNAL',
      encryptionRequired: false,
      approvalRequiredForDelete: false,
      approvalRequiredForWrite: false,
      ...customPolicy
    };
  }

  public getType(): MemoryType {
    return this.type;
  }

  public async get(key: string, context: MemoryContext): Promise<MemoryEntry | undefined> {
    const startTime = Date.now();
    const storageKey = `${context.tenantId}::${key}`;

    // 1. Try Cache
    const cached = this.cache.get(storageKey);
    if (cached) {
      // Security isolation check
      if (!MemorySecurityGuard.verifyTenantIsolation(context, cached)) {
        throw new Error('Security Breach: Cross-tenant memory access attempt blocked.');
      }
      this.metricsCollector.recordRetrieval(Date.now() - startTime);
      return cached;
    }

    // 2. Try Memory storage
    const entry = this.entries.get(storageKey);
    if (!entry) {
      this.metricsCollector.recordRetrieval(Date.now() - startTime);
      return undefined;
    }

    // Security check
    if (!MemorySecurityGuard.verifyTenantIsolation(context, entry)) {
      throw new Error('Security Breach: Cross-tenant memory access attempt blocked.');
    }

    // Permission check
    const isAllowed = MemorySecurityGuard.verifyPermissions(context, 'READ', key);
    if (!isAllowed) {
      throw new Error(`Security Shield: Read permission denied on resource "${key}"`);
    }

    // Retention policy verification
    const isRetentionValid = MemoryGovernanceEngine.evaluateRetention(entry, this.defaultPolicy);
    if (!isRetentionValid) {
      // Auto-purge memory if expired
      this.entries.delete(storageKey);
      this.cache.delete(storageKey);
      this.indexRegistry.remove(entry.id);
      this.metricsCollector.recordTransition(MemoryLifecycleState.DELETED);
      MemoryEventPublisher.publish('MemoryDeleted', { entryId: entry.id, key, reason: 'Retention duration expired' });
      this.metricsCollector.recordRetrieval(Date.now() - startTime);
      return undefined;
    }

    // Move to REFERENCED lifecycle state
    if (entry.state !== MemoryLifecycleState.REFERENCED) {
      entry.state = MemoryLifecycleState.REFERENCED;
      entry.updatedAt = Date.now();
      this.metricsCollector.recordTransition(MemoryLifecycleState.REFERENCED);
      MemoryEventPublisher.publish('MemoryReferenced', { entryId: entry.id, key });
    }

    // Decrypt if necessary
    let resultEntry = entry;
    if (this.defaultPolicy.encryptionRequired && entry.value.startsWith?.('enc-')) {
      resultEntry = {
        ...entry,
        value: MemorySecurityGuard.decrypt(entry.value)
      };
    }

    // Update Cache
    this.cache.set(storageKey, resultEntry);

    this.metricsCollector.recordRetrieval(Date.now() - startTime);
    return resultEntry;
  }

  public async set(key: string, value: any, context: MemoryContext): Promise<MemoryEntry> {
    const startTime = Date.now();
    const storageKey = `${context.tenantId}::${key}`;

    // Permission check
    const isAllowed = MemorySecurityGuard.verifyPermissions(context, 'WRITE', key);
    if (!isAllowed) {
      throw new Error(`Security Shield: Write permission denied on resource "${key}"`);
    }

    // Governance checks
    if (this.defaultPolicy.approvalRequiredForWrite) {
      const opId = `write-${storageKey}-${value?.toString?.().substring(0, 10)}`;
      if (!MemoryGovernanceEngine.isApproved(opId)) {
        throw new Error('Governance Blocked: Write operation is pending supervisory approval.');
      }
    }

    const existing = this.entries.get(storageKey);
    let entryId = existing?.id || generateUUID();
    let version = existing ? existing.version + 1 : 1;

    // Apply encryption if mandated
    let payload = value;
    if (this.defaultPolicy.encryptionRequired) {
      payload = MemorySecurityGuard.encrypt(value);
    }

    const hashInput = `${storageKey}::${JSON.stringify(payload)}::${version}`;
    const hash = generateHash(hashInput);

    const memoryEntry: MemoryEntry = {
      id: entryId,
      type: this.type,
      key,
      value: payload,
      context: deepClone(context),
      state: existing ? MemoryLifecycleState.ACTIVE : MemoryLifecycleState.CREATED,
      version,
      hash,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    if (this.defaultPolicy.retentionMs) {
      memoryEntry.expiresAt = memoryEntry.createdAt + this.defaultPolicy.retentionMs;
    }

    // GRC Metadata attachments
    const grcMeta = MemoryGovernanceEngine.applyComplianceTags(memoryEntry, this.defaultPolicy);
    memoryEntry.context.metadata = {
      ...memoryEntry.context.metadata,
      ...grcMeta
    };

    // Store, cache, and index
    this.entries.set(storageKey, memoryEntry);
    this.cache.set(storageKey, memoryEntry);
    this.indexRegistry.createIndex(memoryEntry);

    // Record history version
    this.versioning.recordVersion(memoryEntry);
    this.metricsCollector.recordVersion();

    if (existing) {
      MemoryEventPublisher.publish('MemoryUpdated', { entryId, key, version });
    } else {
      this.metricsCollector.recordCreate();
      MemoryEventPublisher.publish('MemoryCreated', { entryId, key });
      
      memoryEntry.state = MemoryLifecycleState.INDEXED;
      this.metricsCollector.recordTransition(MemoryLifecycleState.INDEXED);
      MemoryEventPublisher.publish('MemoryIndexed', { entryId, key });
    }

    this.metricsCollector.recordRetrieval(Date.now() - startTime);
    return memoryEntry;
  }

  public async delete(key: string, context: MemoryContext): Promise<boolean> {
    const storageKey = `${context.tenantId}::${key}`;
    const entry = this.entries.get(storageKey);
    if (!entry) return false;

    // Security Isolation
    if (!MemorySecurityGuard.verifyTenantIsolation(context, entry)) {
      throw new Error('Security Breach: Cross-tenant memory deletion attempt blocked.');
    }

    // Permission check
    const isAllowed = MemorySecurityGuard.verifyPermissions(context, 'MANAGE', key);
    if (!isAllowed) {
      throw new Error(`Security Shield: Manage/Delete permission denied on resource "${key}"`);
    }

    // Governance approval check
    if (this.defaultPolicy.approvalRequiredForDelete) {
      const opId = `delete-${storageKey}`;
      if (!MemoryGovernanceEngine.isApproved(opId)) {
        throw new Error('Governance Blocked: Delete operation is pending supervisory approval.');
      }
    }

    // Secure zero-fill wipe of internal maps
    const wiped = MemorySecurityGuard.secureWipePayload(entry);
    this.entries.set(storageKey, wiped);

    // Discard references
    this.cache.delete(storageKey);
    this.indexRegistry.remove(entry.id);
    this.entries.delete(storageKey);

    this.metricsCollector.recordDelete();
    MemoryEventPublisher.publish('MemoryDeleted', { entryId: entry.id, key, reason: 'Manual deletion requested' });

    return true;
  }

  public async search(query: MemoryQuery, context: MemoryContext): Promise<MemorySearchResult> {
    const startTime = Date.now();
    const queryWithTenant = { ...query, tenantId: context.tenantId };
    
    const allEntries = Array.from(this.entries.values());
    const results = this.searchEngine.query(queryWithTenant, allEntries);

    this.metricsCollector.recordSearch(Date.now() - startTime);
    MemoryEventPublisher.publish('SearchPerformed', { query, resultsCount: results.entries.length });

    return results;
  }

  public async getHistory(key: string, context: MemoryContext): Promise<MemoryVersion[]> {
    const storageKey = `${context.tenantId}::${key}`;
    const entry = this.entries.get(storageKey);
    if (entry && !MemorySecurityGuard.verifyTenantIsolation(context, entry)) {
      throw new Error('Security Breach: Cross-tenant history fetch blocked.');
    }

    return this.versioning.getHistory(context.tenantId, key);
  }

  public async rollback(key: string, version: number, context: MemoryContext): Promise<MemoryEntry> {
    const storageKey = `${context.tenantId}::${key}`;
    const entry = this.entries.get(storageKey);
    if (entry && !MemorySecurityGuard.verifyTenantIsolation(context, entry)) {
      throw new Error('Security Breach: Cross-tenant rollback blocked.');
    }

    // Trigger rollback
    const rollbacked = this.versioning.rollback(context.tenantId, key, version);
    
    this.entries.set(storageKey, rollbacked);
    this.cache.set(storageKey, rollbacked);
    this.indexRegistry.createIndex(rollbacked);

    this.metricsCollector.recordTransition(MemoryLifecycleState.RESTORED);
    MemoryEventPublisher.publish('VersionCreated', { entryId: rollbacked.id, key, version: rollbacked.version, reason: 'Rollback' });

    return rollbacked;
  }

  public async getEntries(tenantId: string): Promise<MemoryEntry[]> {
    return Array.from(this.entries.values()).filter((e) => e.context.tenantId === tenantId);
  }

  public async clear(tenantId: string): Promise<void> {
    for (const [sKey, entry] of Array.from(this.entries.entries())) {
      if (entry.context.tenantId === tenantId) {
        this.entries.delete(sKey);
        this.cache.delete(sKey);
        this.indexRegistry.remove(entry.id);
      }
    }
    this.versioning.clear(tenantId);
  }
}
