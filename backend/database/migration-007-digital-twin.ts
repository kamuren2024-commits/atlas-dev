/**
 * KETRACO TRANSMISSION DIGITAL TWIN - MIGRATION 007
 * Canonical Grid Digital Twin Storage Schema
 * 
 * Provides durable, auditable persistence for:
 * - Assets & topology
 * - Time-series telemetry
 * - Network state estimations
 * - Contingencies & risk assessments
 * - Predictive asset health & DGA records
 * - Notifications & incident lifecycles
 * - Operator advisories & audit logs
 */

import sqlite3 from 'sqlite3';

export class DigitalTwinMigration {
  public static async up(db: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // 1. Canonical Assets
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_assets (
            asset_id TEXT PRIMARY KEY,
            asset_type TEXT NOT NULL,
            name TEXT NOT NULL,
            voltage_level TEXT NOT NULL,
            substation_id TEXT,
            rated_capacity_mva REAL,
            rated_current_a REAL,
            rated_voltage_kv REAL,
            manufacturer TEXT,
            model TEXT,
            serial_number TEXT,
            commissioning_date TEXT,
            latitude REAL,
            longitude REAL,
            elevation_m REAL,
            region TEXT NOT NULL,
            operational_status TEXT NOT NULL,
            ownership TEXT DEFAULT 'KETRACO',
            maintenance_state TEXT DEFAULT 'NOMINAL',
            scada_tag TEXT,
            gis_feature_id TEXT,
            source_system TEXT NOT NULL,
            confidence REAL DEFAULT 1.0,
            last_verified TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 2. Topology Nodes & Connectivity
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_topology_branches (
            branch_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            branch_type TEXT NOT NULL, -- LINE, TRANSFORMER, COUPLER
            from_bus_id TEXT NOT NULL,
            to_bus_id TEXT NOT NULL,
            voltage_kv REAL NOT NULL,
            length_km REAL,
            resistance_pu REAL NOT NULL,
            reactance_pu REAL NOT NULL,
            susceptance_pu REAL DEFAULT 0.0,
            thermal_rating_mva REAL NOT NULL,
            emergency_rating_mva REAL NOT NULL,
            status TEXT DEFAULT 'CLOSED', -- CLOSED, OPEN, TRIPPED
            breaker_from_id TEXT,
            breaker_to_id TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 3. Time-Series Telemetry
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id TEXT NOT NULL,
            metric TEXT NOT NULL, -- voltage_kv, current_a, active_power_mw, reactive_power_mvar, frequency_hz, temperature_c
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            quality TEXT NOT NULL, -- GOOD, SUSPECT, STALE, MISSING, INVALID, CONFLICTING, ESTIMATED
            source TEXT NOT NULL, -- SCADA, PMU, EMS, IOT, MANUAL
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL,
            ingestion_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            correlation_id TEXT
          )
        `);
        db.run(`CREATE INDEX IF NOT EXISTS idx_twin_telemetry_asset_time ON twin_telemetry (asset_id, timestamp)`);

        // 4. State Estimation & Power Flow Snapshots
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_state_snapshots (
            snapshot_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            convergence_status TEXT NOT NULL,
            iterations INTEGER NOT NULL,
            total_load_mw REAL NOT NULL,
            total_gen_mw REAL NOT NULL,
            total_losses_mw REAL NOT NULL,
            observability_pct REAL NOT NULL,
            max_voltage_pu REAL NOT NULL,
            min_voltage_pu REAL NOT NULL,
            estimated_buses_json TEXT NOT NULL,
            estimated_branches_json TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 5. Contingency Analysis
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_contingencies (
            contingency_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            contingency_type TEXT NOT NULL, -- N-1_LINE, N-1_TRANSFORMER, N-1_GEN, N-1-1
            trigger_asset_id TEXT NOT NULL,
            severity TEXT NOT NULL, -- NOMINAL, LOW, MEDIUM, HIGH, CRITICAL
            violations_count INTEGER DEFAULT 0,
            violations_json TEXT,
            post_loading_max_pct REAL,
            voltage_deviation_max_pct REAL,
            recommended_actions_json TEXT,
            calculated_at TEXT NOT NULL
          )
        `);

        // 6. Grid Risk Assessments
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_risks (
            risk_id TEXT PRIMARY KEY,
            risk_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            composite_score REAL NOT NULL,
            what_changed TEXT NOT NULL,
            why TEXT NOT NULL,
            affected_assets_json TEXT NOT NULL,
            time_to_impact_minutes INTEGER,
            confidence REAL NOT NULL,
            evidence_json TEXT NOT NULL,
            recommended_response TEXT NOT NULL,
            detected_at TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE' -- ACTIVE, MITIGATED, RESOLVED
          )
        `);

        // 7. Predictive Asset Intelligence & DGA
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_asset_health (
            asset_id TEXT PRIMARY KEY,
            health_index REAL NOT NULL, -- 0 to 100
            failure_probability_30d REAL NOT NULL,
            failure_probability_90d REAL NOT NULL,
            time_horizon_days INTEGER NOT NULL,
            confidence REAL NOT NULL,
            drivers_json TEXT NOT NULL,
            dga_metrics_json TEXT,
            recommended_inspection TEXT,
            recommended_maintenance TEXT,
            evaluated_at TEXT NOT NULL
          )
        `);

        // 8. Notifications & Escalation
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_notifications (
            notification_id TEXT PRIMARY KEY,
            correlation_id TEXT NOT NULL,
            asset_id TEXT NOT NULL,
            severity TEXT NOT NULL, -- INFO, ADVISORY, WARNING, HIGH, CRITICAL, EMERGENCY
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            target_role TEXT NOT NULL,
            target_jurisdiction TEXT NOT NULL,
            target_specialist TEXT,
            state TEXT DEFAULT 'DELIVERED', -- DELIVERED, READ, ACKNOWLEDGED, ESCALATED, RESOLVED
            escalation_level INTEGER DEFAULT 0,
            escalated_to TEXT,
            acknowledged_by TEXT,
            acknowledged_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 9. Incidents
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_incidents (
            incident_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            asset_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL, -- DETECTED, TRIAGED, INVESTIGATING, ACTION_REQUIRED, ACKNOWLEDGED, MITIGATING, MONITORING, RESOLVED, CLOSED
            root_cause TEXT,
            consequence TEXT,
            timeline_json TEXT NOT NULL,
            assigned_engineer TEXT,
            opened_at TEXT NOT NULL,
            closed_at TEXT
          )
        `);

        // 10. Operator Advisories
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_operator_advisories (
            advisory_id TEXT PRIMARY KEY,
            event_title TEXT NOT NULL,
            current_state TEXT NOT NULL,
            trend TEXT NOT NULL,
            forecast TEXT NOT NULL,
            cause TEXT NOT NULL,
            consequence TEXT NOT NULL,
            recommended_action TEXT NOT NULL,
            safety_constraints_json TEXT NOT NULL,
            confidence REAL NOT NULL,
            evidence_json TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING_OPERATOR_REVIEW', -- PENDING, AUTHORIZED, REJECTED, EXECUTED
            operator_id TEXT,
            operator_notes TEXT,
            authorized_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 11. Automated Reconciliation Audit
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_reconciliation_issues (
            issue_id TEXT PRIMARY KEY,
            issue_type TEXT NOT NULL, -- ORPHAN_ASSET, DUPLICATE_ASSET, TOPOLOGY_CONFLICT, MISSING_TELEMETRY, RATING_CONFLICT, LOCATION_CONFLICT
            system_a TEXT NOT NULL,
            system_b TEXT NOT NULL,
            asset_id TEXT NOT NULL,
            details TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT DEFAULT 'DETECTED',
            detected_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 12. Complete Operational Audit Trail
        db.run(`
          CREATE TABLE IF NOT EXISTS twin_audit_log (
            audit_id TEXT PRIMARY KEY,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_role TEXT NOT NULL,
            ip_address TEXT,
            details_json TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('[MIGRATION-007] Error creating digital twin tables:', err);
            reject(err);
          } else {
            console.log('[MIGRATION-007] Digital Twin schema migrated successfully.');
            resolve();
          }
        });
      });
    });
  }
}
