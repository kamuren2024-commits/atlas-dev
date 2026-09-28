/**
 * PHASE 02: CANONICAL MULTI-TIER MEMORY FOUNDATION
 * 
 * Provides unified, tenant-isolated persistent memory across:
 * 1. Working Memory (active session variables, intermediate scratchpad)
 * 2. Episodic Memory (historical executions, agent experiences, outcomes)
 * 3. Semantic Memory (distilled ontology rules, enterprise knowledge, precedents)
 * 
 * Backed by memory_records in SQLite.
 */

import { DatabaseCore } from '../database/db-core';
import { v4 as uuidv4 } from 'uuid';

export type MemoryTier = 'WORKING' | 'EPISODIC' | 'SEMANTIC';

export interface MemoryRecord {
  memoryId: string;
  agentId: string;
  memoryType: MemoryTier;
  key: string;
  value: any;
  confidence: number; // 0.0 to 1.0
  provenance: string; // source event, tool, or document
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export class DurableMemoryService {
  private static instance: DurableMemoryService | null = null;
  private db: DatabaseCore;

  private constructor() {
    this.db = DatabaseCore.getInstance();
  }

  public static getInstance(): DurableMemoryService {
    if (!DurableMemoryService.instance) {
      DurableMemoryService.instance = new DurableMemoryService();
    }
    return DurableMemoryService.instance;
  }

  /**
   * Store or update a memory record
   */
  public async set(
    agentId: string,
    memoryType: MemoryTier,
    key: string,
    value: any,
    options?: {
      confidence?: number;
      provenance?: string;
      tenantId?: string;
    }
  ): Promise<MemoryRecord> {
    const memoryId = `mem_${agentId}_${memoryType}_${key}`;
    const now = new Date().toISOString();
    const tenantId = options?.tenantId || 'ketraco';
    const confidence = options?.confidence ?? 1.0;
    const provenance = options?.provenance || 'agent_execution';

    const contentStr = JSON.stringify(value);

    await this.db.run(
      `INSERT INTO memory_records (
        memory_id, agent_id, memory_type, scope, content, source, key, value_json, confidence, provenance, tenant_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(memory_id) DO UPDATE SET
        content = excluded.content,
        value_json = excluded.value_json,
        confidence = excluded.confidence,
        provenance = excluded.provenance,
        updated_at = excluded.updated_at`,
      [
        memoryId,
        agentId,
        memoryType,
        memoryType, // scope
        contentStr, // content
        provenance, // source
        key,
        contentStr,
        confidence,
        provenance,
        tenantId,
        now,
        now,
      ]
    );

    return {
      memoryId,
      agentId,
      memoryType,
      key,
      value,
      confidence,
      provenance,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Retrieve a specific memory record
   */
  public async get(
    agentId: string,
    memoryType: MemoryTier,
    key: string,
    tenantId = 'ketraco'
  ): Promise<MemoryRecord | null> {
    const memoryId = `mem_${agentId}_${memoryType}_${key}`;
    const row = await this.db.get<any>(
      'SELECT * FROM memory_records WHERE memory_id = ? AND tenant_id = ?',
      [memoryId, tenantId]
    );

    if (!row) return null;

    return {
      memoryId: row.memory_id,
      agentId: row.agent_id,
      memoryType: row.memory_type as MemoryTier,
      key: row.key,
      value: row.value_json ? JSON.parse(row.value_json) : null,
      confidence: row.confidence,
      provenance: row.provenance,
      tenantId: row.tenant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Query memories for an agent by tier
   */
  public async query(
    agentId: string,
    memoryType?: MemoryTier,
    tenantId = 'ketraco',
    limit = 50
  ): Promise<MemoryRecord[]> {
    let sql = 'SELECT * FROM memory_records WHERE agent_id = ? AND tenant_id = ?';
    const params: any[] = [agentId, tenantId];

    if (memoryType) {
      sql += ' AND memory_type = ?';
      params.push(memoryType);
    }

    sql += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);

    const rows = await this.db.all<any>(sql, params);
    return rows.map(r => ({
      memoryId: r.memory_id,
      agentId: r.agent_id,
      memoryType: r.memory_type as MemoryTier,
      key: r.key,
      value: r.value_json ? JSON.parse(r.value_json) : null,
      confidence: r.confidence,
      provenance: r.provenance,
      tenantId: r.tenant_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  /**
   * Clear working memory for an agent session
   */
  public async clearWorkingMemory(agentId: string, tenantId = 'ketraco'): Promise<void> {
    await this.db.run(
      `DELETE FROM memory_records WHERE agent_id = ? AND memory_type = 'WORKING' AND tenant_id = ?`,
      [agentId, tenantId]
    );
  }
}
