import { DatabaseCore } from './db-core';

export class LogisticsGovernanceMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS logistics_governance_audit (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        entity_id TEXT,
        outcome TEXT NOT NULL,
        correlation_id TEXT,
        details_json TEXT NOT NULL,
        previous_hash TEXT,
        record_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_logistics_governance_audit_tenant_time
        ON logistics_governance_audit(tenant_id, created_at);
      CREATE TRIGGER IF NOT EXISTS logistics_governance_audit_no_update
        BEFORE UPDATE ON logistics_governance_audit
        BEGIN
          SELECT RAISE(ABORT, 'Logistics governance audit records are immutable');
        END;
      CREATE TRIGGER IF NOT EXISTS logistics_governance_audit_no_delete
        BEFORE DELETE ON logistics_governance_audit
        BEGIN
          SELECT RAISE(ABORT, 'Logistics governance audit records cannot be deleted');
        END;
    `);
  }
}
