/**
 * PHASE 02: DATABASE MIGRATION - DISTRIBUTED AGENT REGISTRY
 * 
 * Provides durable SQLite storage for enterprise agent registry,
 * lifecycle audit events, and agent leases.
 */

import { DatabaseCore } from './db-core';

export class AgentRegistryMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration] Phase 02 - Agent Registry & Lifecycle Tables');

    // Create registered_agents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS registered_agents (
        agent_id TEXT PRIMARY KEY,
        agent_name TEXT NOT NULL,
        agent_domain TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0.0',
        revision_number INTEGER DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'registered',
        health_status TEXT NOT NULL DEFAULT 'healthy',
        owner_id TEXT,
        tenant_id TEXT,
        last_heartbeat TEXT,
        heartbeat_interval_secs INTEGER DEFAULT 30,
        health_check_window_secs INTEGER DEFAULT 90,
        capabilities_json TEXT DEFAULT '[]',
        memory_types_json TEXT DEFAULT '[]',
        tool_ids_json TEXT DEFAULT '[]',
        region TEXT DEFAULT 'us-east-1',
        cost_estimate_per_hour REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        created_by TEXT DEFAULT 'registry-service',
        updated_at TEXT,
        updated_by TEXT DEFAULT 'registry-service',
        deleted_at TEXT
      );
    `);

    // Create indices
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_reg_agents_domain ON registered_agents(agent_domain);
      CREATE INDEX IF NOT EXISTS idx_reg_agents_status ON registered_agents(status);
      CREATE INDEX IF NOT EXISTS idx_reg_agents_region ON registered_agents(region);
    `);

    // Create agent_registry_events table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agent_registry_events (
        event_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        previous_state_json TEXT,
        new_state_json TEXT,
        triggered_by TEXT,
        region TEXT,
        error_message TEXT,
        created_at TEXT NOT NULL,
        tenant_id TEXT
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_agent_events_agent ON agent_registry_events(agent_id);
      CREATE INDEX IF NOT EXISTS idx_agent_events_created ON agent_registry_events(created_at);
    `);

    // Create agent_leases table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agent_leases (
        agent_id TEXT PRIMARY KEY,
        lease_id TEXT NOT NULL,
        ttl_seconds INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        renew_interval INTEGER NOT NULL
      );
    `);
  }
}
