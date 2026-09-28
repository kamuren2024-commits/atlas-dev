DB-01 Migration Plan — PostgreSQL Enterprise Core

Objective
---------
Plan and execute safe migration of data from SQLite (data/salience_atlas.db) to PostgreSQL using Prisma as ORM layer. Maintain 100% data integrity with full rollback capability.

Assumptions
-----------
- Prisma schema generated at prisma/schema.prisma
- PostgreSQL instance available (local docker or managed)
- DATABASE_URL environment variable will be set for Prisma and application
- SQLite file retained as authoritative rollback source until final cutover

High-level Steps
----------------
1. Prepare PostgreSQL database
   - Create a development database for migration: createdb salience_atlas_dev
   - Ensure encoding UTF8: createdb -E UTF8 salience_atlas_dev
2. Configure DATABASE_URL in .env (do NOT commit secrets)
   - DATABASE_URL="postgresql://user:password@localhost:5432/salience_atlas_dev?schema=public"
3. Install Prisma dependencies (dev):
   - npm install prisma --save-dev
   - npm install @prisma/client pg --save
4. Initialize Prisma (if needed):
   - npx prisma generate
5. Create migrations from prisma/schema.prisma
   - npx prisma migrate dev --name init_db01
   - OR for production: npx prisma migrate deploy
6. Extract data from SQLite and transform
   - Use a controlled ETL script (node/python) to read from SQLite and write to Postgres, mapping types:
     • TEXT JSON -> jsonb
     • BLOB embeddings -> bytea or pgvector
   - Example approach:
     • Node script using sqlite3 and pg libraries
     • Batch inserts with transactions per table
     • Load tables in dependency order; do not disable destination foreign-key checks
7. Validate data
   - Row counts per table must match
   - Referential integrity checks (sample FK chains)
   - Spot-check records for complex JSON fields
8. Implement DatabaseCore refactor to Prisma
   - Create adapter DatabaseCorePrisma that exposes same interface as old DatabaseCore
   - Implement run/get/all/transaction wrappers mapping to Prisma client
   - Swap DI to use new adapter in backend services behind a feature flag
9. Smoke tests
   - Run application, exercise critical paths, verify no API contract breaks
10. Performance testing and index verification
11. Final cutover
   - Schedule maintenance window
   - Re-run final ETL differential sync
   - Switch application to PostgreSQL
   - Monitor and rollback if needed

Rollback Strategy
-----------------
- Keep SQLite file intact until post-cutover verification
- Maintain migration logs and per-table checksums
- If critical failure, restore application to use DatabaseCore (SQLite) and restore last-known-good SQLite file

ETL Script Template (Node.js)
-----------------------------
- Connect to SQLite via sqlite3
- Connect to Postgres via pg
- For each table:
  1. Begin transaction
  2. SELECT rows in batches (e.g., 500)
  3. Transform row -> Prisma-compatible object (JSON parse when needed)
  4. Bulk insert via COPY or multi-row INSERT
  5. Commit transaction

Validation Checklist
--------------------
- [ ] Row counts matched for every discovered source table
- [ ] FK constraints validated
- [ ] Sampled records verified for JSON fidelity
- [ ] pgvector fields validated (if enabled)
- [ ] Performance within acceptable range

Evidence to collect
-------------------
- Migration logs
- Row count diff report
- Checksums/Hash per table (pre/post)
- Screenshots/logs of Prisma migrate output
- Updated AGAINST.md with gate results

Commands (summary)
------------------
# Create DB
createdb -E UTF8 salience_atlas_dev

# Export example using sqlite3 and psql (not ideal for JSON/complex types)
sqlite3 data/salience_atlas.db ".dump users" > users.sql
# Transform the SQL file or use ETL script to convert types

# Prisma migration
npx prisma migrate dev --name db01_init
npx prisma generate

# Run ETL script
node scripts/migrate_sqlite_to_postgres.js


Notes
-----
- Do not commit DATABASE_URL to repo
- Run migrations in a test/dev database first
- Preserve atomicity and be conservative with schema changes
