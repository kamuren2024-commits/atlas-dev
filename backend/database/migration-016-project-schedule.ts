import type { DatabaseCore } from './db-core';

export class ProjectScheduleMigration {
  static async apply(db: Pick<DatabaseCore, 'exec' | 'all'>): Promise<void> {
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_psn_project_tenant_id
        ON project_supply_project(tenant_id, id);

      CREATE TABLE IF NOT EXISTS schedule_milestones (
        id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        baseline_date TEXT,
        current_date TEXT,
        forecast_date TEXT,
        actual_date TEXT,
        owner_id TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        source TEXT NOT NULL DEFAULT 'ATLAS_INTERNAL',
        authority TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (tenant_id, project_id, id),
        FOREIGN KEY (tenant_id, project_id)
          REFERENCES project_supply_project(tenant_id, id)
          ON DELETE RESTRICT,
        CHECK (version > 0),
        CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED'))
      );
      CREATE INDEX IF NOT EXISTS idx_schedule_milestones_project
        ON schedule_milestones(tenant_id, project_id, baseline_date, id);

      CREATE TABLE IF NOT EXISTS atlas_command_audit (
        audit_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        previous_state_json TEXT NOT NULL,
        resulting_state_json TEXT NOT NULL,
        reason TEXT NOT NULL,
        authorization_context_json TEXT NOT NULL,
        correlation_id TEXT NOT NULL,
        command_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        source TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_atlas_command_audit_project
        ON atlas_command_audit(tenant_id, project_id, timestamp DESC);
      CREATE TRIGGER IF NOT EXISTS atlas_command_audit_no_update
        BEFORE UPDATE ON atlas_command_audit
        BEGIN
          SELECT RAISE(ABORT, 'Atlas command audit records are immutable');
        END;
      CREATE TRIGGER IF NOT EXISTS atlas_command_audit_no_delete
        BEFORE DELETE ON atlas_command_audit
        BEGIN
          SELECT RAISE(ABORT, 'Atlas command audit records cannot be deleted');
        END;

      CREATE TABLE IF NOT EXISTS atlas_outbox_events (
        event_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        aggregate_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_version INTEGER NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        published_at TEXT,
        publish_attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_atlas_outbox_pending
        ON atlas_outbox_events(published_at, created_at);

      CREATE TABLE IF NOT EXISTS atlas_command_idempotency (
        tenant_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (tenant_id, actor_id, operation, idempotency_key)
      );
    `);
    const projectColumns = await db.all<{ name: string }>('PRAGMA table_info(project_supply_project)');
    if (!projectColumns.some(column => column.name === 'implementing_department')) {
      await db.exec('ALTER TABLE project_supply_project ADD COLUMN implementing_department TEXT');
    }
  }
}
