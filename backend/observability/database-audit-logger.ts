import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseCore } from '../database/db-core';
import type { AuditLogger } from './audit-logger';

export interface DatabaseAuditLogInput {
  actor?: string;
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  entityType?: string;
  entityId?: string;
  tenantId?: string;
  projectId?: string;
  correlationId?: string;
  commandId?: string;
  eventId?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown>;
  timestamp?: string;
  category?: string;
  source?: string;
  authorizationContext?: Record<string, unknown>;
  previousState?: unknown;
  resultingState?: unknown;
  reason?: string;
}

function toCanonicalObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (value === undefined || value === null) {
    return {};
  }
  return { value };
}

export class DatabaseAuditLogger implements AuditLogger {
  constructor(private readonly db: Pick<DatabaseCore, 'run'>) {}

  static create(db: Pick<DatabaseCore, 'run'>): DatabaseAuditLogger {
    return new DatabaseAuditLogger(db);
  }

  log(...args: any[]): void {
    const normalized = this.normalizeEntry(args);
    void this.persist(normalized).catch((error) => {
      console.error('[AUDIT-LOGGER] Durable audit persistence failed:', error);
    });
  }

  private normalizeEntry(args: any[]): DatabaseAuditLogInput {
    if (args.length === 1 && args[0] && typeof args[0] === 'object') {
      const entry = args[0] as DatabaseAuditLogInput;
      return {
        actor: entry.actor ?? entry.actorId ?? 'system',
        actorId: entry.actorId ?? entry.actor ?? 'system',
        action: entry.action ?? 'atlas.audit',
        resourceType: entry.resourceType ?? entry.entityType ?? 'unknown',
        resourceId: entry.resourceId ?? entry.entityId ?? 'unknown',
        entityType: entry.entityType ?? entry.resourceType ?? 'unknown',
        entityId: entry.entityId ?? entry.resourceId ?? 'unknown',
        tenantId: entry.tenantId ?? 'unknown',
        projectId: entry.projectId ?? 'unknown',
        correlationId: entry.correlationId ?? 'unknown',
        commandId: entry.commandId ?? 'unknown',
        eventId: entry.eventId ?? 'unknown',
        status: entry.status ?? 'completed',
        metadata: entry.metadata ?? entry.details ?? {},
        details: entry.details ?? entry.metadata ?? {},
        timestamp: entry.timestamp ?? new Date().toISOString(),
        category: entry.category ?? 'SYSTEM',
        source: entry.source ?? 'atlas.audit-logger',
        authorizationContext: entry.authorizationContext ?? { tenantId: entry.tenantId ?? 'unknown' },
        previousState: entry.previousState ?? {},
        resultingState: entry.resultingState ?? {},
        reason: entry.reason ?? 'audit record persisted',
      };
    }

    if (args.length >= 2) {
      const [actorId, action, details] = args;
      const metadata = toCanonicalObject(details);
      return {
        actor: String(actorId ?? 'system'),
        actorId: String(actorId ?? 'system'),
        action: String(action ?? 'atlas.audit'),
        resourceType: metadata.resourceType ? String(metadata.resourceType) : 'unknown',
        resourceId: metadata.resourceId ? String(metadata.resourceId) : 'unknown',
        entityType: metadata.entityType ? String(metadata.entityType) : 'unknown',
        entityId: metadata.entityId ? String(metadata.entityId) : 'unknown',
        tenantId: metadata.tenantId ? String(metadata.tenantId) : 'unknown',
        projectId: metadata.projectId ? String(metadata.projectId) : 'unknown',
        correlationId: metadata.correlationId ? String(metadata.correlationId) : 'unknown',
        commandId: metadata.commandId ? String(metadata.commandId) : 'unknown',
        eventId: metadata.eventId ? String(metadata.eventId) : 'unknown',
        status: metadata.status ? String(metadata.status) : 'completed',
        metadata,
        details: metadata,
        timestamp: new Date().toISOString(),
        category: metadata.category ? String(metadata.category) : 'SYSTEM',
        source: metadata.source ? String(metadata.source) : 'atlas.audit-logger',
        authorizationContext: toCanonicalObject(metadata.authorizationContext),
        previousState: metadata.previousState ?? {},
        resultingState: metadata.resultingState ?? {},
        reason: metadata.reason ? String(metadata.reason) : 'audit record persisted',
      };
    }

    return {
      actor: 'system',
      actorId: 'system',
      action: 'atlas.audit',
      resourceType: 'unknown',
      resourceId: 'unknown',
      entityType: 'unknown',
      entityId: 'unknown',
      tenantId: 'unknown',
      projectId: 'unknown',
      correlationId: 'unknown',
      commandId: 'unknown',
      eventId: 'unknown',
      status: 'completed',
      metadata: {},
      details: {},
      timestamp: new Date().toISOString(),
      category: 'SYSTEM',
      source: 'atlas.audit-logger',
      authorizationContext: { tenantId: 'unknown' },
      previousState: {},
      resultingState: {},
      reason: 'audit record persisted',
    };
  }

  private async persist(entry: DatabaseAuditLogInput): Promise<void> {
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const actorId = String(entry.actorId ?? entry.actor ?? 'system');
    const action = String(entry.action ?? 'atlas.audit');
    const detailsJson = JSON.stringify(toCanonicalObject(entry.metadata ?? entry.details ?? {}));
    const documentId = entry.resourceId ?? entry.entityId ?? 'unknown';
    const documentName = entry.resourceType ?? entry.entityType ?? 'unknown';
    const signature = createHash('sha256').update(`${actorId}|${action}|${timestamp}|${detailsJson}`).digest('hex');

    await this.db.run(
      `INSERT INTO audit_logs (id, timestamp, user, action, document_id, document_name, details, category, signature, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), timestamp, actorId, action, documentId, documentName, detailsJson, entry.category ?? 'SYSTEM', signature, timestamp],
    );

    const tenantId = String(entry.tenantId ?? 'unknown');
    const projectId = String(entry.projectId ?? 'unknown');
    if (tenantId !== 'unknown' || projectId !== 'unknown') {
      try {
        await this.db.run(
          `INSERT INTO atlas_command_audit (
            audit_id, timestamp, actor_id, tenant_id, project_id, entity_type, entity_id,
            action, previous_state_json, resulting_state_json, reason,
            authorization_context_json, correlation_id, command_id, event_id, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            timestamp,
            actorId,
            tenantId,
            projectId,
            String(entry.entityType ?? entry.resourceType ?? 'unknown'),
            String(entry.entityId ?? entry.resourceId ?? 'unknown'),
            action,
            JSON.stringify(toCanonicalObject(entry.previousState ?? {})),
            JSON.stringify(toCanonicalObject(entry.resultingState ?? {})),
            String(entry.reason ?? 'audit record persisted'),
            JSON.stringify(toCanonicalObject(entry.authorizationContext ?? { tenantId })),
            String(entry.correlationId ?? 'unknown'),
            String(entry.commandId ?? 'unknown'),
            String(entry.eventId ?? 'unknown'),
            String(entry.source ?? 'atlas.audit-logger'),
          ],
        );
      } catch (error) {
        console.warn('[AUDIT-LOGGER] Project audit record skipped because the project audit table is unavailable:', error);
      }
    }
  }
}
