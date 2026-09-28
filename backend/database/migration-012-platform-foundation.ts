/**
 * PHASE 02: DATABASE MIGRATION - PLATFORM FOUNDATION & DURABLE RUNTIME
 * 
 * Provides durable SQLite schemas for:
 * 1. Append-only Event Ledger (Section 15 & 16)
 * 2. Persistent Knowledge Graph Nodes & Edges (Section 17)
 * 3. Canonical Ontology Schemas, Entities, Relationships & Action Audits (Section 9 & 10)
 * 4. ReAct Loop Agent Executions & Lifecycle Tracing (Section 4 & 5)
 * 5. Enterprise Decision Fabric Records (Section 18)
 * 6. Durable Multi-Tier Memory Store: Working, Episodic, Semantic (Section 19)
 * 7. Durable Agent Leases with Fencing Tokens & Concurrency Protection (Section 7)
 */

import { DatabaseCore } from './db-core';

export class PlatformFoundationMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration-012] Platform Foundation — establishing durable enterprise schemas...');

    // 1. Append-Only Event Ledger
    await db.exec(`
      CREATE TABLE IF NOT EXISTS event_ledger (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        aggregate_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        timestamp TEXT NOT NULL,
        source TEXT NOT NULL,
        actor TEXT NOT NULL,
        correlation_id TEXT,
        causation_id TEXT,
        payload_json TEXT NOT NULL,
        schema_version TEXT NOT NULL DEFAULT '1.0.0',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_event_ledger_type ON event_ledger(event_type);
      CREATE INDEX IF NOT EXISTS idx_event_ledger_agg ON event_ledger(aggregate_type, aggregate_id);
      CREATE INDEX IF NOT EXISTS idx_event_ledger_time ON event_ledger(timestamp);
      CREATE INDEX IF NOT EXISTS idx_event_ledger_corr ON event_ledger(correlation_id);
      CREATE INDEX IF NOT EXISTS idx_event_ledger_tenant ON event_ledger(tenant_id);
    `);

    // 2. Persistent Knowledge Graph (Nodes & Edges)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS graph_nodes (
        node_id TEXT PRIMARY KEY,
        node_type TEXT NOT NULL,
        name TEXT NOT NULL,
        metadata_json TEXT,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(node_type);
      CREATE INDEX IF NOT EXISTS idx_graph_nodes_tenant ON graph_nodes(tenant_id);

      CREATE TABLE IF NOT EXISTS graph_edges (
        edge_id TEXT PRIMARY KEY,
        from_node TEXT NOT NULL,
        to_node TEXT NOT NULL,
        relation TEXT NOT NULL,
        weight REAL DEFAULT 1.0,
        metadata_json TEXT,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL,
        FOREIGN KEY (from_node) REFERENCES graph_nodes(node_id) ON DELETE CASCADE,
        FOREIGN KEY (to_node) REFERENCES graph_nodes(node_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_graph_edges_from ON graph_edges(from_node);
      CREATE INDEX IF NOT EXISTS idx_graph_edges_to ON graph_edges(to_node);
      CREATE INDEX IF NOT EXISTS idx_graph_edges_relation ON graph_edges(relation);
      CREATE INDEX IF NOT EXISTS idx_graph_edges_tenant ON graph_edges(tenant_id);
    `);

    // 3. Canonical Ontology Schemas, Entities, Relationships, and Action Audits
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ontology_schemas (
        schema_id TEXT PRIMARY KEY,
        schema_name TEXT NOT NULL,
        domain TEXT,
        entity_type TEXT NOT NULL,
        properties_json TEXT,
        json_schema TEXT,
        version TEXT NOT NULL DEFAULT '1.0.0',
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS ontology_entities (
        entity_id TEXT NOT NULL,
        schema_type TEXT,
        entity_type TEXT,
        name TEXT,
        properties_json TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (entity_id)
      );

      CREATE TABLE IF NOT EXISTS ontology_relationships (
        relationship_id TEXT PRIMARY KEY,
        rel_id TEXT,
        source_id TEXT NOT NULL,
        source_type TEXT,
        target_id TEXT NOT NULL,
        target_type TEXT,
        relation_type TEXT,
        relation_name TEXT,
        properties_json TEXT,
        metadata_json TEXT,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ontology_actions_audit (
        action_id TEXT PRIMARY KEY,
        domain TEXT,
        action TEXT,
        action_name TEXT,
        entity_type TEXT,
        entity_id TEXT NOT NULL,
        actor_id TEXT,
        actor_type TEXT,
        actor_roles_json TEXT,
        agent_id TEXT,
        payload_json TEXT,
        parameters_json TEXT,
        reason TEXT,
        status TEXT NOT NULL,
        verification_status TEXT,
        verification_passed INTEGER DEFAULT 1,
        verification_result TEXT,
        previous_state_json TEXT,
        new_state_json TEXT,
        autonomy_level TEXT,
        approval_state TEXT,
        error_message TEXT,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL,
        executed_at TEXT
      );
    `);

    // Add missing columns if tables already existed
    await this.ensureColumns(db, 'ontology_schemas', {
      domain: 'TEXT',
      json_schema: 'TEXT',
      updated_at: 'TEXT',
    });

    await this.ensureColumns(db, 'ontology_entities', {
      schema_type: 'TEXT',
      name: 'TEXT',
      version: 'INTEGER DEFAULT 1',
    });

    await this.ensureColumns(db, 'ontology_actions_audit', {
      action_type: 'TEXT',
      domain: 'TEXT',
      action: 'TEXT',
      actor_type: 'TEXT',
      actor_roles_json: 'TEXT',
      authorization_status: 'TEXT',
      validation_status: 'TEXT',
      verification_status: 'TEXT',
      before_state_json: 'TEXT',
      after_state_json: 'TEXT',
      payload_json: 'TEXT',
      reason: 'TEXT',
      verification_passed: 'INTEGER DEFAULT 1',
      previous_state_json: 'TEXT',
      new_state_json: 'TEXT',
    });

    // 4. ReAct Loop Agent Executions & Lifecycle Tracing
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agent_executions (
        execution_id TEXT PRIMARY KEY,
        mission_id TEXT,
        agent_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        actor_id TEXT,
        status TEXT NOT NULL,
        current_step INTEGER DEFAULT 0,
        max_steps INTEGER DEFAULT 10,
        state_json TEXT,
        steps_trace_json TEXT,
        result_json TEXT,
        total_latency_ms INTEGER DEFAULT 0,
        start_time TEXT,
        end_time TEXT,
        model_id TEXT,
        model_provider TEXT,
        loop_iteration INTEGER DEFAULT 0,
        current_state TEXT,
        tools_called_json TEXT DEFAULT '[]',
        ontology_objects_touched_json TEXT DEFAULT '[]',
        events_generated_json TEXT DEFAULT '[]',
        decisions_json TEXT DEFAULT '[]',
        verification_results_json TEXT DEFAULT '{}',
        failure_state TEXT,
        final_outcome_json TEXT,
        audit_trail_hash TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );
    `);

    await this.ensureColumns(db, 'agent_executions', {
      status: "TEXT DEFAULT 'SUCCESS'",
      current_step: 'INTEGER DEFAULT 0',
      max_steps: 'INTEGER DEFAULT 10',
      state_json: 'TEXT',
      steps_trace_json: 'TEXT',
      result_json: 'TEXT',
      total_latency_ms: 'INTEGER DEFAULT 0',
      updated_at: 'TEXT',
    });

    try {
      await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_ontology_entities_uid ON ontology_entities(entity_id)');
    } catch {}

    // 5. Enterprise Decision Fabric
    await db.exec(`
      CREATE TABLE IF NOT EXISTS decisions_fabric (
        decision_id TEXT PRIMARY KEY,
        mission_id TEXT,
        agent_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        input_context_json TEXT,
        ontology_objects_json TEXT,
        evidence_json TEXT,
        reasoning_summary TEXT NOT NULL,
        model TEXT,
        policy TEXT,
        proposed_action TEXT,
        proposed_action_json TEXT,
        approval_state TEXT NOT NULL DEFAULT 'APPROVED',
        executed_action TEXT,
        executed_action_json TEXT,
        verification_json TEXT,
        outcome TEXT,
        created_at TEXT NOT NULL
      );
    `);

    await this.ensureColumns(db, 'decisions_fabric', {
      proposed_action_json: 'TEXT',
      executed_action_json: 'TEXT',
    });

    // 6. Durable Multi-Tier Memory Store (Working, Episodic, Semantic)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS memory_records (
        memory_id TEXT PRIMARY KEY,
        agent_id TEXT,
        memory_type TEXT NOT NULL,
        key TEXT,
        value_json TEXT,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        scope TEXT,
        content TEXT,
        source TEXT,
        confidence REAL DEFAULT 1.0,
        provenance TEXT,
        provenance_json TEXT,
        access_policy TEXT DEFAULT 'INTERNAL',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await this.ensureColumns(db, 'memory_records', {
      agent_id: 'TEXT',
      key: 'TEXT',
      value_json: 'TEXT',
      provenance: 'TEXT',
    });

    // 7. Extend ai_execution_logs table for unified audit logging
    await this.ensureColumns(db, 'ai_execution_logs', {
      agent_name: 'TEXT',
      prompt: 'TEXT',
      tokens_used: 'INTEGER DEFAULT 0',
      cost_usd: 'REAL DEFAULT 0',
      created_at: 'TEXT',
    });

    // 8. Update agent_leases
    await this.ensureColumns(db, 'agent_leases', {
      lease_owner: "TEXT DEFAULT 'atlas-runtime-worker-1'",
      fencing_token: 'INTEGER DEFAULT 1',
      status: "TEXT DEFAULT 'ACTIVE'",
    });

    // 9. Update registered_agents
    await this.ensureColumns(db, 'registered_agents', {
      agent_type: "TEXT DEFAULT 'autonomous_react'",
      permissions_json: "TEXT DEFAULT '[]'",
      model_policy_json: 'TEXT',
      ontology_scope_json: "TEXT DEFAULT '[\"*\"]'",
      tenant_scope_json: "TEXT DEFAULT '[\"ketraco\"]'",
      risk_level: "TEXT DEFAULT 'MEDIUM'",
      execution_limits_json: 'TEXT',
    });

    console.log('[Migration-012] Platform Foundation schema applied successfully.');
  }

  private static async ensureColumns(
    db: DatabaseCore,
    table: string,
    cols: Record<string, string>
  ): Promise<void> {
    try {
      const existing = await db.all<{ name: string }>(`PRAGMA table_info(${table})`);
      const existingNames = new Set(existing.map(c => c.name));

      for (const [col, type] of Object.entries(cols)) {
        if (!existingNames.has(col)) {
          await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
        }
      }
    } catch (err: any) {
      console.warn(`[Migration-012] Column extension notice for ${table}:`, err.message);
    }
  }
}
