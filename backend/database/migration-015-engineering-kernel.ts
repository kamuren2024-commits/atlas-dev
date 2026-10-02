import type { DatabaseCore } from './db-core';

export class EngineeringKernelMigration {
  static async apply(db: Pick<DatabaseCore, 'all' | 'exec'>): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS engineering_scenarios (
        scenario_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        scenario_version INTEGER NOT NULL,
        scenario_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (scenario_id, tenant_id),
        CHECK (scenario_version > 0)
      );

      CREATE INDEX IF NOT EXISTS idx_engineering_scenarios_owner
        ON engineering_scenarios (tenant_id, owner_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS engineering_scenario_versions (
        scenario_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        scenario_version INTEGER NOT NULL,
        scenario_json TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (scenario_id, tenant_id, scenario_version),
        FOREIGN KEY (scenario_id, tenant_id)
          REFERENCES engineering_scenarios (scenario_id, tenant_id)
          ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS engineering_simulation_runs (
        simulation_run_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        scenario_version INTEGER NOT NULL,
        base_state_id TEXT NOT NULL,
        base_state_version TEXT NOT NULL,
        topology_version TEXT NOT NULL,
        requested_at TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        execution_status TEXT NOT NULL,
        engine TEXT NOT NULL,
        engine_version TEXT NOT NULL,
        provenance_json TEXT NOT NULL,
        input_provenance_json TEXT NOT NULL,
        assumptions_json TEXT NOT NULL,
        warnings_json TEXT NOT NULL,
        findings_json TEXT NOT NULL,
        artifacts_json TEXT NOT NULL,
        result_json TEXT,
        correlation_id TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        UNIQUE (tenant_id, idempotency_key),
        UNIQUE (simulation_run_id, tenant_id),
        FOREIGN KEY (scenario_id, tenant_id, scenario_version)
          REFERENCES engineering_scenario_versions
            (scenario_id, tenant_id, scenario_version)
          ON DELETE RESTRICT,
        CHECK (execution_status IN (
          'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED',
          'CANCELLED', 'UNAVAILABLE', 'INVALID'
        ))
      );

      CREATE INDEX IF NOT EXISTS idx_engineering_runs_scenario
        ON engineering_simulation_runs (tenant_id, scenario_id, requested_at DESC);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_engineering_runs_one_active_per_scenario
        ON engineering_simulation_runs (tenant_id, scenario_id)
        WHERE execution_status IN ('QUEUED', 'RUNNING');

      CREATE TABLE IF NOT EXISTS engineering_run_events (
        event_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        simulation_run_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        correlation_id TEXT NOT NULL,
        version TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        FOREIGN KEY (simulation_run_id, tenant_id)
          REFERENCES engineering_simulation_runs (simulation_run_id, tenant_id)
          ON DELETE RESTRICT,
        CHECK (event_type IN (
          'RUN_CREATED', 'RUN_QUEUED', 'RUN_STARTED', 'RUN_PROGRESS',
          'RUN_WARNING', 'RUN_COMPLETED', 'RUN_FAILED',
          'RUN_CANCELLED', 'RUN_UNAVAILABLE'
        ))
      );

      CREATE INDEX IF NOT EXISTS idx_engineering_events_run
        ON engineering_run_events (tenant_id, simulation_run_id, timestamp);
    `);

    const runColumns = await db.all<{ name: string }>('PRAGMA table_info(engineering_simulation_runs)');
    if (!runColumns.some(column => column.name === 'input_provenance_json')) {
      await db.exec(
        `ALTER TABLE engineering_simulation_runs
         ADD COLUMN input_provenance_json TEXT NOT NULL DEFAULT '{}'`
      );
    }
  }
}
