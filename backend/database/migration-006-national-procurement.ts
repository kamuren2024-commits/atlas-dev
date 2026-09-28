/**
 * PHASE 05: DATABASE MIGRATION 006 — NATIONAL PROCUREMENT INTELLIGENCE
 *
 * Creates tenant-scoped procurement case, lifecycle event and price
 * observation contracts. No fixture rows are inserted.
 */

import { DatabaseCore } from './db-core';

export class NationalProcurementMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS procurement_case (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        project_id TEXT,
        requirement_id TEXT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        estimated_value REAL,
        currency TEXT,
        procurement_method TEXT,
        lifecycle_stage TEXT NOT NULL DEFAULT 'NEED_IDENTIFIED',
        tender_id TEXT,
        supplier_id TEXT,
        contract_id TEXT,
        purchase_order_id TEXT,
        source_system TEXT NOT NULL,
        source_record_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_procurement_case_tenant_stage
        ON procurement_case(tenant_id, lifecycle_stage);
      CREATE INDEX IF NOT EXISTS idx_procurement_case_tenant_category
        ON procurement_case(tenant_id, category);
      CREATE INDEX IF NOT EXISTS idx_procurement_case_project
        ON procurement_case(tenant_id, project_id);

      CREATE TABLE IF NOT EXISTS procurement_case_event (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        procurement_case_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        from_stage TEXT,
        to_stage TEXT,
        actor_id TEXT,
        occurred_at TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        metadata_json TEXT,
        source_system TEXT NOT NULL,
        FOREIGN KEY(procurement_case_id) REFERENCES procurement_case(id) ON DELETE CASCADE,
        UNIQUE(tenant_id, idempotency_key)
      );
      CREATE INDEX IF NOT EXISTS idx_procurement_event_case
        ON procurement_case_event(tenant_id, procurement_case_id, occurred_at);

      CREATE TABLE IF NOT EXISTS procurement_price_observation (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        procurement_case_id TEXT,
        item_description TEXT NOT NULL,
        specification TEXT,
        quantity REAL,
        unit TEXT,
        unit_price REAL,
        currency TEXT,
        observed_at TEXT NOT NULL,
        supplier_id TEXT,
        source_system TEXT NOT NULL,
        source_record_id TEXT,
        normalization_notes TEXT,
        FOREIGN KEY(procurement_case_id) REFERENCES procurement_case(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_procurement_price_tenant_item
        ON procurement_price_observation(tenant_id, item_description, observed_at);
    `);
  }
}
