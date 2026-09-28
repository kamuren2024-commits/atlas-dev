/**
 * Atlas Platform Persistence Adapter
 * Provides PostgreSQL persistence for all platform engine singletons.
 * Falls back to in-memory storage when DATABASE_URL is not configured.
 */

import { PrismaClient } from '@prisma/client';
import { DatabaseCore } from '../../backend/database/db-core';

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient | null {
  if (prisma) return prisma;
  if (!process.env.DATABASE_URL) return null;
  try {
    prisma = new PrismaClient({ log: ['error'] });
    return prisma;
  } catch {
    return null;
  }
}

// ─── Ontology Persistence ───────────────────────────────────────────

export interface PersistedOntologyEntity {
  entityId: string;
  entityType: string;
  properties: Record<string, any>;
  tenantId?: string;
}

export interface PersistedOntologyRelationship {
  sourceId: string;
  targetId: string;
  relationType: string;
  metadata?: Record<string, any>;
  tenantId?: string;
}

export const OntologyStore = {
  async saveSchema(schemaId: string, schemaName: string, entityType: string, properties: Record<string, any>, tenantId?: string): Promise<void> {
    try {
      const db = DatabaseCore.getInstance();
      const now = new Date().toISOString();
      await db.run(
        `INSERT INTO ontology_schemas (schema_name, version, domain, json_schema, tenant_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(schema_name, version) DO UPDATE SET json_schema = excluded.json_schema`,
        [schemaName || entityType, '1.0', entityType, JSON.stringify(properties), tenantId || 'ketraco', now]
      );
    } catch (err: any) {
      console.warn('[OntologyStore] SQLite schema save notice:', err.message);
    }
  },

  async saveEntity(entityId: string, entityType: string, properties: Record<string, any>, tenantId?: string): Promise<void> {
    try {
      const db = DatabaseCore.getInstance();
      const now = new Date().toISOString();
      await db.run(
        `INSERT INTO ontology_entities (entity_id, schema_type, name, properties_json, version, tenant_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?, ?)
         ON CONFLICT(entity_id) DO UPDATE SET
           properties_json = excluded.properties_json,
           updated_at = excluded.updated_at,
           version = ontology_entities.version + 1`,
        [entityId, entityType, properties.name || entityId, JSON.stringify(properties), tenantId || 'ketraco', now, now]
      );
    } catch (err: any) {
      console.warn('[OntologyStore] SQLite entity save notice:', err.message);
    }
  },

  async saveRelationship(sourceId: string, targetId: string, relationType: string, metadata?: Record<string, any>, tenantId?: string): Promise<void> {
    try {
      const db = DatabaseCore.getInstance();
      const now = new Date().toISOString();
      const relId = `rel_${sourceId}_${relationType}_${targetId}`;
      await db.run(
        `INSERT INTO ontology_relationships (relationship_id, source_id, target_id, relation_type, properties_json, tenant_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(relationship_id) DO UPDATE SET properties_json = excluded.properties_json`,
        [relId, sourceId, targetId, relationType, metadata ? JSON.stringify(metadata) : null, tenantId || 'ketraco', now]
      );
    } catch (err: any) {
      console.warn('[OntologyStore] SQLite relationship save notice:', err.message);
    }
  },

  async getEntitiesByType(entityType: string, tenantId?: string): Promise<PersistedOntologyEntity[]> {
    try {
      const db = DatabaseCore.getInstance();
      const tenant = tenantId || 'ketraco';
      const rows = await db.all<any>(
        `SELECT entity_id, schema_type, properties_json, tenant_id FROM ontology_entities WHERE schema_type = ? AND tenant_id = ?`,
        [entityType, tenant]
      );
      return rows.map(r => ({
        entityId: r.entity_id,
        entityType: r.schema_type,
        properties: r.properties_json ? JSON.parse(r.properties_json) : {},
        tenantId: r.tenant_id,
      }));
    } catch (err: any) {
      console.warn('[OntologyStore] SQLite entity query notice:', err.message);
      return [];
    }
  },

  async getEntity(entityId: string): Promise<PersistedOntologyEntity | null> {
    const db = getPrisma();
    if (!db) return null;
    const r = await db.ontologyEntity.findUnique({ where: { entityId } });
    if (!r) return null;
    return { entityId: r.entityId, entityType: r.entityType, properties: r.properties as Record<string, any>, tenantId: r.tenantId ?? undefined };
  },

  async getRelationships(sourceId?: string, relationType?: string, tenantId?: string): Promise<PersistedOntologyRelationship[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = {};
    if (sourceId) where.sourceId = sourceId;
    if (relationType) where.relationType = relationType;
    if (tenantId) where.tenantId = tenantId;
    const rows = await db.ontologyRelationship.findMany({ where });
    return rows.map(r => ({ sourceId: r.sourceId, targetId: r.targetId, relationType: r.relationType, metadata: r.metadata as Record<string, any> | undefined, tenantId: r.tenantId ?? undefined }));
  },
};

// ─── Event Persistence ──────────────────────────────────────────────

export interface PersistedEvent {
  eventId: string;
  eventType: string;
  category: string;
  severity: string;
  status: string;
  source: string;
  payload: Record<string, any>;
  correlationId?: string;
  tenantId?: string;
  createdAt: Date;
}

export const EventStore = {
  async save(event: PersistedEvent): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.eventRecord.upsert({
      where: { eventId: event.eventId },
      update: { status: event.status, updatedAt: new Date() },
      create: {
        eventId: event.eventId,
        eventType: event.eventType,
        category: event.category,
        severity: event.severity,
        status: event.status,
        source: event.source,
        payload: event.payload,
        correlationId: event.correlationId,
        tenantId: event.tenantId,
      },
    });
  },

  async query(params: { eventType?: string; category?: string; tenantId?: string; since?: Date; limit?: number }): Promise<PersistedEvent[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = {};
    if (params.eventType) where.eventType = params.eventType;
    if (params.category) where.category = params.category;
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.since) where.createdAt = { gte: params.since };
    const rows = await db.eventRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 100,
    });
    return rows.map(r => ({
      eventId: r.eventId,
      eventType: r.eventType,
      category: r.category,
      severity: r.severity,
      status: r.status,
      source: r.source,
      payload: r.payload as Record<string, any>,
      correlationId: r.correlationId ?? undefined,
      tenantId: r.tenantId ?? undefined,
      createdAt: r.createdAt,
    }));
  },
};

// ─── Memory Persistence ─────────────────────────────────────────────

export interface PersistedMemory {
  memoryId: string;
  memoryType: string;
  key: string;
  value: any;
  classification: string;
  tenantId?: string;
  agentId?: string;
  workflowId?: string;
  tags?: string[];
  version: number;
  encrypted: boolean;
  expiresAt?: Date;
}

export const MemoryStore = {
  async save(record: PersistedMemory): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.memoryRecord.upsert({
      where: { memoryId: record.memoryId },
      update: { value: record.value, version: record.version + 1, updatedAt: new Date() },
      create: {
        memoryId: record.memoryId,
        memoryType: record.memoryType,
        key: record.key,
        value: record.value,
        classification: record.classification,
        tenantId: record.tenantId,
        agentId: record.agentId,
        workflowId: record.workflowId,
        tags: record.tags ?? [],
        version: record.version,
        encrypted: record.encrypted,
        expiresAt: record.expiresAt,
      },
    });
  },

  async get(memoryId: string): Promise<PersistedMemory | null> {
    const db = getPrisma();
    if (!db) return null;
    const r = await db.memoryRecord.findUnique({ where: { memoryId } });
    if (!r || r.deletedAt) return null;
    return {
      memoryId: r.memoryId,
      memoryType: r.memoryType,
      key: r.key,
      value: r.value,
      classification: r.classification,
      tenantId: r.tenantId ?? undefined,
      agentId: r.agentId ?? undefined,
      workflowId: r.workflowId ?? undefined,
      tags: r.tags as string[] | undefined,
      version: r.version,
      encrypted: r.encrypted,
      expiresAt: r.expiresAt ?? undefined,
    };
  },

  async delete(memoryId: string): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.memoryRecord.update({ where: { memoryId }, data: { deletedAt: new Date() } });
  },

  async query(params: { memoryType?: string; tenantId?: string; key?: string; agentId?: string; limit?: number }): Promise<PersistedMemory[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = { deletedAt: null };
    if (params.memoryType) where.memoryType = params.memoryType;
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.key) where.key = params.key;
    if (params.agentId) where.agentId = params.agentId;
    const rows = await db.memoryRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 100,
    });
    return rows.map(r => ({
      memoryId: r.memoryId,
      memoryType: r.memoryType,
      key: r.key,
      value: r.value,
      classification: r.classification,
      tenantId: r.tenantId ?? undefined,
      agentId: r.agentId ?? undefined,
      workflowId: r.workflowId ?? undefined,
      tags: r.tags as string[] | undefined,
      version: r.version,
      encrypted: r.encrypted,
      expiresAt: r.expiresAt ?? undefined,
    }));
  },
};

// ─── Decision Persistence ───────────────────────────────────────────

export interface PersistedDecision {
  decisionId: string;
  tenantId?: string;
  agentId?: string;
  outcome: string;
  confidence: number;
  reasoningChain: any[];
  evidenceKeys: string[];
  alternatives: any[];
  riskScore?: number;
  context?: Record<string, any>;
  traceId?: string;
}

export const DecisionStore = {
  async save(decision: PersistedDecision): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.decisionRecord.upsert({
      where: { decisionId: decision.decisionId },
      update: {},
      create: {
        decisionId: decision.decisionId,
        tenantId: decision.tenantId,
        agentId: decision.agentId,
        outcome: decision.outcome,
        confidence: decision.confidence,
        reasoningChain: decision.reasoningChain,
        evidenceKeys: decision.evidenceKeys,
        alternatives: decision.alternatives,
        riskScore: decision.riskScore,
        context: decision.context,
        traceId: decision.traceId,
      },
    });
  },

  async query(params: { tenantId?: string; agentId?: string; outcome?: string; minConfidence?: number; limit?: number }): Promise<PersistedDecision[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.agentId) where.agentId = params.agentId;
    if (params.outcome) where.outcome = params.outcome;
    if (params.minConfidence) where.confidence = { gte: params.minConfidence };
    const rows = await db.decisionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 100,
    });
    return rows.map(r => ({
      decisionId: r.decisionId,
      tenantId: r.tenantId ?? undefined,
      agentId: r.agentId ?? undefined,
      outcome: r.outcome,
      confidence: r.confidence,
      reasoningChain: r.reasoningChain as any[],
      evidenceKeys: r.evidenceKeys as string[],
      alternatives: r.alternatives as any[],
      riskScore: r.riskScore ?? undefined,
      context: r.context as Record<string, any> | undefined,
      traceId: r.traceId ?? undefined,
    }));
  },
};

// ─── Workflow Persistence ───────────────────────────────────────────

export interface PersistedWorkflowDefinition {
  definitionId: string;
  name: string;
  description?: string;
  nodes: any[];
  globalPolicy?: Record<string, any>;
  tenantId?: string;
}

export interface PersistedWorkflowInstance {
  instanceId: string;
  definitionId: string;
  tenantId?: string;
  status: string;
  context?: Record<string, any>;
  stepStates?: Record<string, any>;
  variables?: Record<string, any>;
}

export const WorkflowStore = {
  async saveDefinition(def: PersistedWorkflowDefinition): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.workflowDefinition.upsert({
      where: { definitionId: def.definitionId },
      update: { nodes: def.nodes, globalPolicy: def.globalPolicy, updatedAt: new Date() },
      create: {
        definitionId: def.definitionId,
        name: def.name,
        description: def.description,
        nodes: def.nodes,
        globalPolicy: def.globalPolicy,
        tenantId: def.tenantId,
      },
    });
  },

  async getDefinition(definitionId: string): Promise<PersistedWorkflowDefinition | null> {
    const db = getPrisma();
    if (!db) return null;
    const r = await db.workflowDefinition.findUnique({ where: { definitionId } });
    if (!r) return null;
    return {
      definitionId: r.definitionId,
      name: r.name,
      description: r.description ?? undefined,
      nodes: r.nodes as any[],
      globalPolicy: r.globalPolicy as Record<string, any> | undefined,
      tenantId: r.tenantId ?? undefined,
    };
  },

  async saveInstance(instance: PersistedWorkflowInstance): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.workflowInstance.upsert({
      where: { instanceId: instance.instanceId },
      update: { status: instance.status, context: instance.context, stepStates: instance.stepStates, variables: instance.variables, updatedAt: new Date() },
      create: {
        instanceId: instance.instanceId,
        definitionId: instance.definitionId,
        tenantId: instance.tenantId,
        status: instance.status,
        context: instance.context,
        stepStates: instance.stepStates,
        variables: instance.variables,
      },
    });
  },

  async getInstance(instanceId: string): Promise<PersistedWorkflowInstance | null> {
    const db = getPrisma();
    if (!db) return null;
    const r = await db.workflowInstance.findUnique({ where: { instanceId } });
    if (!r) return null;
    return {
      instanceId: r.instanceId,
      definitionId: r.definitionId,
      tenantId: r.tenantId ?? undefined,
      status: r.status,
      context: r.context as Record<string, any> | undefined,
      stepStates: r.stepStates as Record<string, any> | undefined,
      variables: r.variables as Record<string, any> | undefined,
    };
  },
};

// ─── Policy Persistence ─────────────────────────────────────────────

export interface PersistedPolicy {
  policyId: string;
  code: string;
  name: string;
  description?: string;
  rules: any[];
  remediation?: string;
  tenantId?: string;
  active: boolean;
}

export const PolicyStore = {
  async save(policy: PersistedPolicy): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    await db.policyDefinition.upsert({
      where: { policyId: policy.policyId },
      update: { rules: policy.rules, remediation: policy.remediation, active: policy.active, updatedAt: new Date() },
      create: {
        policyId: policy.policyId,
        code: policy.code,
        name: policy.name,
        description: policy.description,
        rules: policy.rules,
        remediation: policy.remediation,
        tenantId: policy.tenantId,
        active: policy.active,
      },
    });
  },

  async getAll(tenantId?: string): Promise<PersistedPolicy[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = { active: true };
    if (tenantId) where.tenantId = tenantId;
    const rows = await db.policyDefinition.findMany({ where });
    return rows.map(r => ({
      policyId: r.policyId,
      code: r.code,
      name: r.name,
      description: r.description ?? undefined,
      rules: r.rules as any[],
      remediation: r.remediation ?? undefined,
      tenantId: r.tenantId ?? undefined,
      active: r.active,
    }));
  },
};

// ─── Graph Edge Persistence ─────────────────────────────────────────

export interface PersistedGraphEdge {
  sourceId: string;
  targetId: string;
  edgeType: string;
  graphType: string;
  weight?: number;
  metadata?: Record<string, any>;
  tenantId?: string;
}

export const GraphStore = {
  async saveEdge(edge: PersistedGraphEdge): Promise<void> {
    const db = getPrisma();
    if (!db) return;
    const existing = await db.graphEdge.findFirst({
      where: { sourceId: edge.sourceId, targetId: edge.targetId, edgeType: edge.edgeType, graphType: edge.graphType, tenantId: edge.tenantId },
    });
    if (!existing) {
      await db.graphEdge.create({
        data: {
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          edgeType: edge.edgeType,
          graphType: edge.graphType,
          weight: edge.weight,
          metadata: edge.metadata,
          tenantId: edge.tenantId,
        },
      });
    }
  },

  async getEdgesFrom(sourceId: string, graphType: string, tenantId?: string): Promise<PersistedGraphEdge[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = { sourceId, graphType };
    if (tenantId) where.tenantId = tenantId;
    const rows = await db.graphEdge.findMany({ where });
    return rows.map(r => ({
      sourceId: r.sourceId,
      targetId: r.targetId,
      edgeType: r.edgeType,
      graphType: r.graphType,
      weight: r.weight ?? undefined,
      metadata: r.metadata as Record<string, any> | undefined,
      tenantId: r.tenantId ?? undefined,
    }));
  },

  async getEdgesTo(targetId: string, graphType: string, tenantId?: string): Promise<PersistedGraphEdge[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = { targetId, graphType };
    if (tenantId) where.tenantId = tenantId;
    const rows = await db.graphEdge.findMany({ where });
    return rows.map(r => ({
      sourceId: r.sourceId,
      targetId: r.targetId,
      edgeType: r.edgeType,
      graphType: r.graphType,
      weight: r.weight ?? undefined,
      metadata: r.metadata as Record<string, any> | undefined,
      tenantId: r.tenantId ?? undefined,
    }));
  },

  async getEdgesByType(edgeType: string, graphType: string, tenantId?: string): Promise<PersistedGraphEdge[]> {
    const db = getPrisma();
    if (!db) return [];
    const where: any = { edgeType, graphType };
    if (tenantId) where.tenantId = tenantId;
    const rows = await db.graphEdge.findMany({ where });
    return rows.map(r => ({
      sourceId: r.sourceId,
      targetId: r.targetId,
      edgeType: r.edgeType,
      graphType: r.graphType,
      weight: r.weight ?? undefined,
      metadata: r.metadata as Record<string, any> | undefined,
      tenantId: r.tenantId ?? undefined,
    }));
  },
};
