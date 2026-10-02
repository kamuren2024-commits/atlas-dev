import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { FinanceDataFabricMigration } from './migration-003-finance-data-fabric';
import { LogisticsDomainMigration } from './migration-004-logistics-domain';
import { ProjectSupplyNexusMigration } from './migration-005-project-supply-nexus';
import { NationalProcurementMigration } from './migration-006-national-procurement';
import { DigitalTwinMigration } from './migration-007-digital-twin';
import { MeetingIntelligenceMigration } from './migration-008-meeting-intelligence';
import { LogisticsCommandCenterMigration } from './migration-009-logistics-command-center';
import { LogisticsOperationalizationMigration } from './migration-010-logistics-operationalization';
import { AgentRegistryMigration } from './migration-011-agent-registry';
import { PlatformFoundationMigration } from './migration-012-platform-foundation';
import { EvaluationOSDomainMigration } from './migration-013-evaluation-os-domain';
import { LogisticsGovernanceMigration } from './migration-014-logistics-governance';
import { EngineeringKernelMigration } from './migration-015-engineering-kernel';
import { isEvaluationOsProductionMode, ProductionModeError } from '../core/config/production-mode';

export type DatabaseLifecycleState =
  | 'DATABASE_AVAILABLE'
  | 'DATABASE_UNAVAILABLE'
  | 'DATABASE_INITIALIZING'
  | 'DATABASE_DEGRADED'
  | 'DATABASE_CORRUPT'
  | 'DATABASE_MIGRATION_REQUIRED';

export interface DatabaseHealth {
  status: 'UP' | 'DOWN';
  engine: string;
  filepath: string;
  migrationsApplied: number;
  activeTransactions: number;
  state: DatabaseLifecycleState;
  error?: string;
}

export class DatabaseCore {
  private static instance: DatabaseCore | null = null;
  private db: any = null;
  private dbPath: string;
  private activeTxCount = 0;
  private isFallbackMode = false;
  private state: DatabaseLifecycleState = 'DATABASE_INITIALIZING';

  private constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'salience_atlas.db');
  }

  public static getInstance(): DatabaseCore {
    if (!DatabaseCore.instance) {
      DatabaseCore.instance = new DatabaseCore();
    }
    return DatabaseCore.instance;
  }

  public async connect(): Promise<void> {
    if (this.db) {
      this.state = 'DATABASE_AVAILABLE';
      return;
    }
    this.state = 'DATABASE_INITIALIZING';
    return new Promise((resolve, reject) => {
      try {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            this.state = 'DATABASE_UNAVAILABLE';
            if (isEvaluationOsProductionMode()) {
              reject(new ProductionModeError(
                `Authoritative database connection failed in production mode: ${err.message}`
              ));
              return;
            }
            console.warn('[DATABASE-CORE] SQLite open warning: persistence unavailable; development fallback disabled for trust-critical operation.', err.message);
            this.state = 'DATABASE_UNAVAILABLE';
            reject(new Error(`Database unavailable: ${err.message}`));
            return;
          }
          this.state = 'DATABASE_AVAILABLE';
          console.log(`[DATABASE-CORE] Connected to persistent SQL database at: ${this.dbPath}`);
          resolve();
        });
      } catch (err: any) {
        this.state = 'DATABASE_UNAVAILABLE';
        if (isEvaluationOsProductionMode()) {
          reject(new ProductionModeError(
            `Authoritative database driver failed in production mode: ${err?.message || err}`
          ));
          return;
        }
        console.warn('[DATABASE-CORE] SQLite binding unavailable:', err?.message || err);
        reject(new Error(`Database unavailable: ${err?.message || 'unknown sqlite driver failure'}`));
      }
    });
  }

  public getDatabaseState(): DatabaseLifecycleState {
    return this.state;
  }

  public getRawConnection(): any {
    if (!this.db) {
      throw new Error('Database is not initialized; persistence is unavailable.');
    }
    return this.db;
  }

  public isFallbackPersistence(): boolean {
    return this.isFallbackMode;
  }

  // --- QUERY EXECUTORS ---

  public run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    const db = this.getRawConnection();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      }.bind(this));
    });
  }

  public get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    const db = this.getRawConnection();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  public all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    const db = this.getRawConnection();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public exec(sql: string): Promise<void> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    const db = this.getRawConnection();
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // --- TRANSACTION MANAGER ---

  public async beginTransaction(): Promise<void> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    await this.run('BEGIN TRANSACTION');
    this.activeTxCount++;
  }

  public async commit(): Promise<void> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    await this.run('COMMIT');
    this.activeTxCount = Math.max(0, this.activeTxCount - 1);
  }

  public async commitTransaction(): Promise<void> {
    return this.commit();
  }

  public async rollback(): Promise<void> {
    if (this.state !== 'DATABASE_AVAILABLE') {
      throw new Error(`Database persistence unavailable: ${this.state}`);
    }
    await this.run('ROLLBACK');
    this.activeTxCount = Math.max(0, this.activeTxCount - 1);
  }

  public async rollbackTransaction(): Promise<void> {
    return this.rollback();
  }

  // --- MIGRATION ENGINE ---

  public async runMigrations(): Promise<number> {
    await this.connect();
    
    // Create migrations table if not exists
    await this.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const applied = await this.all<{ name: string }>('SELECT name FROM migrations');
    const appliedNames = new Set(applied.map(m => m.name));

    // Define core schema migrations (v1)
    const migrationsList = [
      {
        name: '001_initial_schema',
        sql: `
          -- Bidders
          CREATE TABLE IF NOT EXISTS bidders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            overall_status TEXT NOT NULL,
            compliance_score INTEGER NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Documents
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            bidder_id TEXT NOT NULL,
            category TEXT NOT NULL,
            size TEXT NOT NULL,
            upload_time TEXT NOT NULL,
            progress INTEGER NOT NULL,
            status TEXT NOT NULL,
            extracted_text TEXT NOT NULL,
            officer_notes TEXT NOT NULL,
            version_history_json TEXT NOT NULL,
            overrides_json TEXT NOT NULL,
            recommendation_json TEXT NOT NULL,
            timeline_json TEXT NOT NULL,
            metadata_field_json TEXT,
            requirements_json TEXT,
            quality_json TEXT,
            cross_field_json TEXT,
            financial_json TEXT,
            technical_json TEXT,
            evidence_json TEXT,
            confidence_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(bidder_id) REFERENCES bidders(id) ON DELETE CASCADE
          );

          -- Pipeline Stages
          CREATE TABLE IF NOT EXISTS pipeline_stages (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            duration TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            input TEXT,
            output TEXT,
            raw_confidence INTEGER,
            adjusted_confidence INTEGER,
            supporting_evidence_count INTEGER,
            missing_evidence_count INTEGER,
            human_review_required INTEGER,
            errors TEXT,
            retries INTEGER,
            evidence_generated_json TEXT,
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
          );

          -- Procurement Rules
          CREATE TABLE IF NOT EXISTS procurement_rules (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            applicable_stage TEXT NOT NULL,
            expected_evidence TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Audit Logs
          CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            user TEXT NOT NULL,
            action TEXT NOT NULL,
            document_id TEXT,
            document_name TEXT,
            details TEXT NOT NULL,
            category TEXT NOT NULL,
            signature TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Workflow Checkpoints
          CREATE TABLE IF NOT EXISTS workflow_checkpoints (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            node_id TEXT NOT NULL,
            status TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Agent Runs (Lifecycle / State / History)
          CREATE TABLE IF NOT EXISTS agent_runs (
            id TEXT PRIMARY KEY,
            agent_name TEXT NOT NULL,
            task_id TEXT NOT NULL,
            status TEXT NOT NULL,
            reasoning_history_json TEXT NOT NULL,
            confidence_score REAL NOT NULL,
            duration REAL NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- System Configurations
          CREATE TABLE IF NOT EXISTS system_configs (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Conversations & Chat Messages
          CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            history_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Notifications
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- AI Runtime: Prompt Registry
          CREATE TABLE IF NOT EXISTS prompt_registry (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version INTEGER NOT NULL,
            content TEXT NOT NULL,
            system_instruction TEXT,
            parameters_json TEXT,
            owner TEXT,
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, version)
          );

          -- AI Runtime: Memory
          CREATE TABLE IF NOT EXISTS ai_memory (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            workflow_id TEXT NOT NULL,
            type TEXT NOT NULL, -- semantic, episodic, working
            content TEXT NOT NULL,
            metadata_json TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- AI Runtime: Token & Cost Governance
          CREATE TABLE IF NOT EXISTS ai_execution_logs (
            id TEXT PRIMARY KEY,
            request_id TEXT NOT NULL,
            user_id TEXT,
            module TEXT,
            workflow_id TEXT,
            model TEXT NOT NULL,
            provider TEXT NOT NULL,
            prompt_tokens INTEGER DEFAULT 0,
            completion_tokens INTEGER DEFAULT 0,
            cost REAL DEFAULT 0,
            latency_ms INTEGER DEFAULT 0,
            status TEXT,
            error TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `
      }
    ];

    let migrationsCount = 0;
    for (const migration of migrationsList) {
      if (!appliedNames.has(migration.name)) {
        console.log(`[DATABASE-CORE] Applying database migration: ${migration.name}`);
        // Run as multiple separate statements to avoid issues with compound table creation in some drivers
        const statements = migration.sql.split(';').map(s => s.trim()).filter(Boolean);
        for (const statement of statements) {
          await this.run(statement);
        }
        await this.run('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
        migrationsCount++;
      }
    }

    if (migrationsCount > 0) {
      console.log(`[DATABASE-CORE] Successfully applied ${migrationsCount} migrations.`);
    } else {
      console.log('[DATABASE-CORE] Database is fully up-to-date. No migrations needed.');
    }

    // Phase 01 — Finance Data Fabric migration (idempotent standalone module)
    await FinanceDataFabricMigration.apply(this);

    // Phase 02 — Logistics Domain migration (idempotent standalone module)
    await LogisticsDomainMigration.apply(this);

    // Phase 04 — Project Supply Nexus requirement contract
    await ProjectSupplyNexusMigration.apply(this);

    // Phase 05 — National Procurement Intelligence evidence contract
    await NationalProcurementMigration.apply(this);

    // Phase 07 — KETRACO Transmission Digital Twin Core
    await DigitalTwinMigration.up(this.getRawConnection());

    // Phase 08 — KETRACO Meeting Intelligence
    await MeetingIntelligenceMigration.apply(this);

    // Phase 09 — KETRACO Logistics Command Center Core Domain
    await LogisticsCommandCenterMigration.apply(this);

    // Phase 10 — KETRACO Logistics Operationalization & Fleet Intelligence
    await LogisticsOperationalizationMigration.apply(this);

    // Phase 02 — Distributed Agent Registry & Lifecycle Persistence
    await AgentRegistryMigration.apply(this);

    // Phase 02 — Platform Foundation, Event Ledger, Persistent Graph & Ontology Runtime
    await PlatformFoundationMigration.apply(this);

    // Phase 03/04 — Evaluation OS Complete Domain Model & Lifecycle Persistence
    await EvaluationOSDomainMigration.apply(this);

    // Phase 14 — Logistics governance, immutable audit records, and control evidence
    await LogisticsGovernanceMigration.apply(this);

    // Phase 15 — Engineering scenarios, versioned runs, and lifecycle events
    await EngineeringKernelMigration.apply(this);

    return migrationsCount;
  }

  // --- HEALTH & DIAGNOSTICS ---

  public async checkHealth(): Promise<DatabaseHealth> {
    try {
      await this.connect();
      // Probe query to verify DB is responsive
      await this.get('SELECT 1');
      const migrationsCount = await this.get<{ total: number }>('SELECT COUNT(*) as total FROM migrations');
      
      return {
        status: 'UP',
        engine: 'SQLite3',
        filepath: this.dbPath,
        migrationsApplied: migrationsCount?.total || 0,
        activeTransactions: this.activeTxCount,
        state: this.state === 'DATABASE_AVAILABLE' ? 'DATABASE_AVAILABLE' : 'DATABASE_DEGRADED'
      };
    } catch (err: any) {
      return {
        status: 'DOWN',
        engine: 'SQLite3',
        filepath: this.dbPath,
        migrationsApplied: 0,
        activeTransactions: this.activeTxCount,
        state: this.state === 'DATABASE_UNAVAILABLE' ? 'DATABASE_UNAVAILABLE' : 'DATABASE_DEGRADED',
        error: err?.message || String(err)
      };
    }
  }

  // --- SHUTDOWN ---

  public async shutdown(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      this.db!.close((err) => {
        if (err) {
          console.error('[DATABASE-CORE] Error while closing SQLite database:', err);
        } else {
          console.log('[DATABASE-CORE] SQLite database connection closed gracefully.');
        }
        this.db = null;
        resolve();
      });
    });
  }
}
