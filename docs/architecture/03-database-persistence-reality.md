# 03 — Database Architecture & Persistence Reality

**Target System:** Salience Atlas Data Persistence Layer  
**Engines Analyzed:** SQLite3 (`data/salience_atlas.db`), PostgreSQL (`DatabaseCorePrisma`), Prisma Client 5.22.0, Redis Service  
**Auditor:** Principal Enterprise Database Architect & Data Engineer  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

A critical finding of this assessment is the **complete divergence** between the claimed dual-database architecture (PostgreSQL primary + SQLite dev) and the runtime operational reality. 

```
                                      DATABASE REALITY CHECK
┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│               DOCUMENTED / CLAIMED STATE               │                ACTUAL RUNTIME STATE                    │
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ • Production PostgreSQL cluster with Prisma ORM       │ • Zero PostgreSQL tables exist in runtime              │
│ • Dual-write etcd + PostgreSQL distributed agent store │ • Prisma schema (`schema.prisma`) DOES NOT EXIST       │
│ • Real-time CDC pipeline syncing SQLite to Postgres    │ • `@prisma/client` is an ungenerated shell package     │
│ • Redis 7.x distributed cluster for locks & queues    │ • 100% of persistent data resides in SQLite3 (1.6 MB)  │
│                                                        │ • Redis runs in in-memory fallback mode (ECONNREFUSED) │
└────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

The good news is that **the SQLite database (`data/salience_atlas.db`) is highly sophisticated**, containing **93 distinct tables** populated with normalized domain schemas, foreign key relationships, audit triggers, and seed records for national power grid operations, procurement compliance, logistics fleets, and financial ledgers.

---

## 2. Empirical Database Inventory: SQLite (`data/salience_atlas.db`)

### 2.1 File & Connection Details
- **File Location:** `/data/salience_atlas.db`
- **File Size:** 1.6 Megabytes (1,671,168 bytes)
- **Driver:** Node.js `sqlite3` v5.1.7 and `better-sqlite3` v13.0.3 bindings
- **Connection Mode:** Single-file persistent connection managed via singleton in `backend/database/db-core.ts`.
- **Total Tables:** 93 tables + 1 SQLite internal sequence table (`sqlite_sequence`).

### 2.2 Table Family Breakdown

| Domain Family | Table Count | Representative Tables | Operational State |
|---|---|---|---|
| **Finance & Ledger** | 26 tables | `finance_accounts`, `finance_budgets`, `finance_budget_lines`, `finance_commitments`, `finance_invoices`, `finance_payments`, `finance_journals`, `finance_risks`, `finance_forecasts`, `finance_lineage`, `finance_data_quality` | **WORKING (Production Asset)**: Rich multi-tenant schema with PFM Act compliance fields. |
| **Logistics & Fleet** | 30 tables | `logistics_fleet`, `logistics_vehicle`, `logistics_driver`, `logistics_cargo`, `logistics_mission`, `logistics_mission_stop`, `logistics_route`, `logistics_route_deviation`, `logistics_warehouse`, `logistics_warehouse_zone`, `logistics_fuel_transaction` | **WORKING (Production Asset)**: Complete fleet management, GPS waypoints, fuel logs, and delivery tracking. |
| **Meeting Intelligence** | 15 tables | `meeting_transcripts`, `meeting_minutes`, `meeting_agenda_items`, `meeting_actions`, `meeting_decisions`, `meeting_commitments`, `meeting_risks`, `meeting_signals`, `meeting_audit_ledger` | **WORKING (Production Asset)**: Complete corporate governance minutes, action item tracker, audio-derived evidence. |
| **Digital Twin** | 13 tables | `twin_assets`, `twin_asset_health`, `twin_telemetry`, `twin_topology_branches`, `twin_incidents`, `twin_contingencies`, `twin_operator_advisories`, `twin_reconciliation_issues`, `twin_risks` | **WORKING (Production Asset)**: SCADA asset parameters, bus voltages, line thermal ratings, N-1 contingency models. |
| **Procurement & PPADA** | 5 tables | `bidders`, `documents`, `pipeline_stages`, `procurement_rules`, `procurement_case`, `procurement_price_observation` | **WORKING**: Evaluator evidence graphs, scoring logs, bidder metadata. |
| **AI Runtime & Memory** | 4 tables | `prompt_registry`, `ai_memory`, `ai_execution_logs`, `agent_runs` | **PARTIAL**: Schema exists in SQLite, but populated primarily by test scripts; live API routes bypass it. |
| **System & Core** | 4 tables | `migrations`, `audit_logs`, `system_configs`, `conversations` | **WORKING**: Core configuration and audit logging. |

---

## 3. Migration Pipeline Architecture

In `backend/database/db-core.ts`, the method `DatabaseCore.getInstance().runMigrations()` executes an idempotent migration sequence:

```
                                  DatabaseCore.runMigrations()
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         │                                      │                                      │
         ▼                                      ▼                                      ▼
  Core Migrations Table                 Standalone Domain Migrations           SQLite In-Memory Fallback
  • 001_initial_schema (recorded)       • FinanceDataFabricMigration (apply)    • Used if native bindings fail
  • 003_finance_data_fabric (recorded)  • LogisticsDomainMigration (apply)      • Graceful dev downgrade
                                        • ProjectSupplyNexusMigration (apply)
                                        • NationalProcurementMigration (apply)
                                        • DigitalTwinMigration (up)
                                        • MeetingIntelligenceMigration (apply)
                                        • LogisticsCommandCenterMigration (apply)
                                        • LogisticsOperationalizationMigration (apply)
```

### Critical Migration Findings:
1. **Migration Tracking Table Discrepancy:** The `migrations` table in `data/salience_atlas.db` only lists 2 applied migrations:
   - `001_initial_schema` (applied 2026-09-19 08:13:25)
   - `003_finance_data_fabric` (applied 2026-09-19 08:13:25)
2. **Autonomous Sub-Migrations:** The remaining 8 migration modules (`LogisticsDomainMigration`, `DigitalTwinMigration`, etc.) are called directly on line 384-406 of `db-core.ts`. They use `CREATE TABLE IF NOT EXISTS` directly without inserting their names into the `migrations` tracking table. This works fine for idempotency, but obscures migration history.

---

## 4. The Prisma & PostgreSQL Fiction

### 4.1 Missing `schema.prisma`
The package `package.json` specifies:
```json
"dependencies": {
  "@prisma/client": "^5.22.0",
  "pg": "^8.23.0"
},
"devDependencies": {
  "prisma": "^5.22.0"
}
```
Scripts in `package.json` define:
```json
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev --name db01_init"
```
However, running `npx prisma -v` loads environment variables from `.env`, but reveals:
- **No `prisma/schema.prisma` file exists** in the repository.
- Running `npm run prisma:generate` exits with error: `Could not find a schema.prisma file`.
- Directory `node_modules/.prisma` does not exist.

### 4.2 Impact on Codebase
Three key backend modules attempt to use Prisma:
1. `backend/database/db-core-prisma.ts`:
   Wraps `new PrismaClient()` and attempts raw queries (`$executeRawUnsafe`).
2. `backend/agents/registry.ts`:
   Instantiates `this.prisma = new PrismaClient()` and calls:
   ```ts
   await this.prisma.agent.upsert({ ... })
   ```
   Because no `agent` model was ever compiled into Prisma, calling `this.register()` throws a runtime `TypeError: Cannot read properties of undefined (reading 'upsert')`.
3. `platform/persistence/index.ts`:
   Attempts:
   ```ts
   await db.ontologySchema.upsert({ ... })
   await db.ontologyEntity.upsert({ ... })
   await db.ontologyRelationship.create({ ... })
   ```
   All of these fail silently or fall through to `getPrisma() === null`.

---

## 5. Redis State: Real vs Fallback

The file `backend/database/redis-service.ts` implements `RedisService`, configured to connect to `process.env.REDIS_HOST || '127.0.0.1'` on port `6379`.
- **Runtime Execution:** When the server starts in the container, no local Redis server process is running.
- **Failover Mechanism:** `RedisService` catches `ECONNREFUSED` and triggers:
  ```
  [INFRA] Redis status: DEGRADED
  [INFRA] Redis fallback activated: IN_MEMORY
  ```
- **In-Memory Capabilities:** The fallback implementation is unusually robust: it provides local JavaScript `Map` instances for `inMemoryCache`, `inMemorySessions`, `inMemoryLocks`, `inMemoryQueues`, `inMemoryDLQs`, and in-process `EventEmitter` pub/sub channels.
- **Risk:** All cached sessions, distributed lock tokens, and queued background worker tasks are **heap-volatile**. A restart purges all background jobs.

---

## 6. Target Production Strategy: The Path Forward

| Component | Immediate Current State | Production Upgrade Target | Strategy |
|---|---|---|---|
| **Primary Relational DB** | SQLite3 (`salience_atlas.db`) | Managed PostgreSQL (Cloud SQL or Neon) | **Preserve & Export:** The SQLite schema is gold. Generate a clean `schema.prisma` reflecting the 93 tables; export SQLite data using `scripts/migrate_sqlite_to_postgres.js`. |
| **Agent / Registry Persistence** | Broken `this.prisma.agent` call | Native SQLite table `registered_agents` first, then Postgres | Add table `registered_agents` to `db-core.ts` so registry works immediately without Prisma dependency. |
| **Caching & Pub/Sub** | `RedisService` in-memory fallback | Managed Redis (Memorystore / Upstash) | Keep fallback mode for local dev/container preview; wire environment variables for external Redis when deployed. |
| **Schema Definition Truth** | `backend/database/db-core.ts` | Single source of truth | Maintain `db-core.ts` as primary migration authority until PostgreSQL cutover is executed. |
