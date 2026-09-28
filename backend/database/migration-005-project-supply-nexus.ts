/**
 * PHASE 04: DATABASE MIGRATION 005 — PROJECT SUPPLY NEXUS
 *
 * Persists the minimum requirement contract needed to connect projects to
 * existing logistics products, purchase orders, suppliers and milestones.
 * No seed rows are inserted: an empty requirement set is reported explicitly.
 */

import { DatabaseCore } from './db-core';

export class ProjectSupplyNexusMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS project_supply_requirement (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        project_id TEXT NOT NULL,
        work_package_id TEXT,
        requirement_type TEXT NOT NULL DEFAULT 'MATERIAL',
        product_id TEXT,
        description TEXT NOT NULL,
        required_quantity REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'unit',
        required_by TEXT,
        delivery_location TEXT,
        criticality TEXT NOT NULL DEFAULT 'STANDARD',
        procurement_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
        supplier_id TEXT,
        contract_id TEXT,
        purchase_order_id TEXT,
        milestone_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_psn_requirement_project
        ON project_supply_requirement(tenant_id, project_id);
      CREATE INDEX IF NOT EXISTS idx_psn_requirement_product
        ON project_supply_requirement(tenant_id, product_id);
      CREATE INDEX IF NOT EXISTS idx_psn_requirement_required_by
        ON project_supply_requirement(tenant_id, required_by);
    `);
  }
}
