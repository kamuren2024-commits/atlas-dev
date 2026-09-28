# DB-01 Command Reference
## All Essential Commands for PostgreSQL Migration

---

## 🔧 Setup Commands

### PostgreSQL Database Creation

```bash
# Local PostgreSQL - macOS
brew install postgresql@15
brew services start postgresql@15
createdb -E UTF8 salience_atlas_dev

# Local PostgreSQL - Linux
sudo apt-get install postgresql-15
sudo -u postgres psql
postgres=# CREATE DATABASE salience_atlas_dev ENCODING 'UTF8';
\q

# Windows (pre-installed PostgreSQL)
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres
postgres=# CREATE DATABASE salience_atlas_dev ENCODING 'UTF8';

# Docker Compose (create docker-compose.yml if needed)
cat > docker-compose.db.yml << 'EOF'
version: '3'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: salience_atlas_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
EOF

docker-compose -f docker-compose.db.yml up -d
docker-compose -f docker-compose.db.yml logs -f
```

### Environment Configuration

```bash
# Create development environment file
cp .env.db01.local .env.development.local

# Edit with your PostgreSQL credentials
# Local example:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/salience_atlas_dev"

# Verify connection (optional)
npm run prisma:generate  # Tests connection
```

---

## 📊 Migration Commands

### Prisma Schema Deployment

```bash
# Generate Prisma Client (verify connectivity)
npm run prisma:generate

# Deploy schema to PostgreSQL (creates all 25 tables)
npm run prisma:migrate

# Output format:
# ✓ Successfully created migrations
# ✓ Applied 1 migration (x.xx ms)
```

### Data Migration (ETL)

```bash
# Execute SQLite → PostgreSQL migration
npm run migrate:sqlite-to-pg

# Console output shows progress:
# Processing table: Rule (batch 1/1)
# Processing table: RuleVersion (batch 1/2)
# [continues for all 25 tables]
# Total rows transferred: 5000+

# Expected timing: 10-30 seconds for typical dataset
```

### Validation & Verification

```bash
# Run complete validation suite
npm run validate:db01

# Checks performed:
# 1. Row count comparison (SQLite vs PostgreSQL)
# 2. Foreign key constraints
# 3. Index creation verification
# 4. Sample record retrieval

# Output: PASSED ✓ or FAILED ✗ with details
```

---

## 🔍 Diagnostic Commands

### Connection Verification

```bash
# Test PostgreSQL connectivity via psql
psql -h localhost -U postgres -d salience_atlas_dev -c "SELECT version();"

# Via node (test Prisma connection)
npm run prisma:generate

# Via curl (health endpoint, after npm run dev)
curl http://localhost:3000/api/health
```

### Database Inspection

```bash
# Connect to PostgreSQL CLI
psql -h localhost -U postgres -d salience_atlas_dev

# Common inspection queries
\dt                         # List all tables
\d Rule                     # Describe Rule table structure
SELECT COUNT(*) FROM Rule;  # Count rows in Rule table
\df                        # List functions
\dI                        # List indexes
\x                         # Toggle expanded display

# Exit psql
\q
```

### Prisma Database Inspection

```bash
# Open Prisma Studio (visual database explorer)
npx prisma studio

# Open browser to http://localhost:5555
# View/edit all tables graphically
```

### Check Prisma Client Generation

```bash
# Verify Prisma client is installed
npm ls @prisma/client

# Output should show: @prisma/client@^5.22.0

# Check Prisma CLI version
npx prisma --version

# Output should show: @prisma/cli version X.X.X
```

---

## 🧪 Testing Commands

### Build & Lint

```bash
# Verify no TypeScript errors introduced
npm run build

# Check code style
npm run lint

# Both must pass before production deployment
```

### Development Server

```bash
# Start development server (uses PostgreSQL if configured)
npm run dev

# Expected output:
# Server running on http://localhost:3000
# Connected to PostgreSQL: salience_atlas_dev

# Stop with Ctrl+C
```

### API Smoke Test

```bash
# Test API connectivity after npm run dev
curl http://localhost:3000/api/health
# Expected: { "status": "ok" }

# Test specific endpoints
curl http://localhost:3000/api/rules
curl http://localhost:3000/api/evidence
# [other API endpoints per application]
```

---

## 🔄 Advanced Operations

### Prisma Migrations

```bash
# Create new schema migration (after schema changes)
npm run prisma:migrate dev --name add_new_field

# Reset PostgreSQL database (DESTROYS DATA - use carefully)
npm run prisma:migrate reset

# Revert to specific migration
npm run prisma:migrate resolve --rolled-back [migration_name]

# View migration history
ls prisma/migrations/

# Generate migration without applying
npm run prisma:migrate dev --skip-generate --create-only
```

### Data Operations

```bash
# Seed database (if seed.ts exists)
npm run prisma:db push --skip-generate

# Export data from PostgreSQL (backup)
pg_dump -h localhost -U postgres salience_atlas_dev > backup.sql

# Restore from backup
psql -h localhost -U postgres salience_atlas_dev < backup.sql

# Clear single table (PostgreSQL)
psql -h localhost -U postgres -d salience_atlas_dev -c "TRUNCATE Rule CASCADE;"
```

### Performance Analysis

```bash
# Check query performance (from psql)
EXPLAIN ANALYZE SELECT * FROM Rule WHERE id = '...';

# Generate performance report
npm run validate:db01 2>&1 | tee migration_report.txt

# Monitor PostgreSQL connections
psql -h localhost -U postgres -d salience_atlas_dev -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🚨 Rollback Commands

### Emergency Rollback to SQLite

```bash
# 1. Set environment variable to use original adapter
export USE_PRISMA=false

# Windows PowerShell:
$env:USE_PRISMA = "false"

# 2. Restart application
npm run dev

# 3. Application now uses SQLite (data/salience_atlas.db)
# 4. No data loss - SQLite file untouched during migration

# 5. After fixing issues, retry PostgreSQL migration:
export USE_PRISMA=true
npm run migrate:sqlite-to-pg
```

### PostgreSQL Database Reset (Destructive)

```bash
# CAUTION: This destroys all PostgreSQL data

# Option 1: Reset via Prisma
npm run prisma:migrate reset

# Option 2: Manual reset (via psql)
psql -h localhost -U postgres
postgres=# DROP DATABASE salience_atlas_dev;
postgres=# CREATE DATABASE salience_atlas_dev ENCODING 'UTF8';
postgres=# \c salience_atlas_dev
postgres=# (run schema creation again)

# Option 3: Using Docker
docker-compose -f docker-compose.db.yml down -v  # Remove volumes
docker-compose -f docker-compose.db.yml up -d    # Fresh start
```

### Migrate-Specific Rollback

```bash
# If ETL script encounters errors mid-migration:

# 1. Stop the script (Ctrl+C)

# 2. Check which tables were migrated
npm run validate:db01

# 3. If partial data transferred, decide:
#    a) Complete migration from failed point (restart script)
#    b) Reset PostgreSQL and start fresh
#    c) Rollback to SQLite

# 4. Check logs for specific table errors
npm run migrate:sqlite-to-pg 2>&1 | grep "ERROR"
```

---

## 📈 Monitoring Commands

### Monitor Migration Progress

```bash
# Watch row counts as migration progresses
# Terminal 1 (run migration):
npm run migrate:sqlite-to-pg

# Terminal 2 (monitor):
while true; do
  echo "=== Row counts ==="
  psql -h localhost -U postgres -d salience_atlas_dev -c "
    SELECT 'Rule' as table_name, COUNT(*) FROM Rule
    UNION ALL
    SELECT 'RuleVersion', COUNT(*) FROM RuleVersion
    UNION ALL
    SELECT 'Evidence', COUNT(*) FROM Evidence
  "
  sleep 5
done

# Windows PowerShell equivalent:
$env:PGPASSWORD = "postgres"
while ($true) {
    psql -h localhost -U postgres -d salience_atlas_dev -c "SELECT COUNT(*) FROM Rule;"
    Start-Sleep -Seconds 5
}
```

### Check PostgreSQL Logs

```bash
# Docker logs
docker-compose -f docker-compose.db.yml logs postgres

# Follow logs in real-time
docker-compose -f docker-compose.db.yml logs -f postgres

# Local PostgreSQL logs (macOS)
tail -f /usr/local/var/log/postgres.log

# Local PostgreSQL logs (Linux)
sudo tail -f /var/log/postgresql/postgresql.log
```

### Performance Monitoring

```bash
# Connection pool monitoring
psql -h localhost -U postgres -c "
  SELECT datname, usename, application_name, state, COUNT(*)
  FROM pg_stat_activity
  GROUP BY datname, usename, application_name, state;
"

# Query performance
psql -h localhost -U postgres -d salience_atlas_dev -c "
  SELECT query, calls, mean_time, total_time
  FROM pg_stat_statements
  ORDER BY total_time DESC
  LIMIT 10;
"

# Table sizes
psql -h localhost -U postgres -d salience_atlas_dev -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

---

## 🔐 Security Commands

### Verify Secure Configuration

```bash
# Check .env file is NOT committed (should be in .gitignore)
git status | grep ".env"
# Should show: "not added to index" or similar

# Verify DATABASE_URL is not in committed code
git grep "postgresql://" -- "*.ts" "*.js"
# Should return: (no results)

# Check secrets are in .env (not in .env.example)
grep DATABASE_URL .env
grep DATABASE_URL .env.example
# .env should have real value, .env.example should have template
```

### PostgreSQL Security

```bash
# Create dedicated database user (recommended)
psql -h localhost -U postgres -c "
  CREATE USER salience_user WITH PASSWORD 'secure_password';
  GRANT ALL PRIVILEGES ON DATABASE salience_atlas_dev TO salience_user;
"

# Update DATABASE_URL:
# postgresql://salience_user:secure_password@localhost:5432/salience_atlas_dev

# Revoke unnecessary privileges (production)
psql -h localhost -U postgres -d salience_atlas_dev -c "
  REVOKE ALL PRIVILEGES ON SCHEMA public FROM public;
  GRANT USAGE ON SCHEMA public TO salience_user;
"
```

---

## 📋 Checklist for Complete Migration

```bash
# Run this sequence for successful migration

# 1. Setup
createdb -E UTF8 salience_atlas_dev                    # ✓
export DATABASE_URL="postgresql://postgres:@localhost:5432/salience_atlas_dev"

# 2. Prepare
npm install                                             # (if deps not installed)
npm run prisma:generate                                 # ✓

# 3. Deploy
npm run prisma:migrate                                  # ✓ All 25 tables created

# 4. Migrate
npm run migrate:sqlite-to-pg                            # ✓ All rows transferred

# 5. Validate
npm run validate:db01                                   # ✓ All checks passed

# 6. Integrate
npm run build                                           # ✓ No errors
npm run lint                                            # ✓ No errors

# 7. Test
npm run dev                                             # ✓ Starts successfully
curl http://localhost:3000/api/health                  # ✓ Returns 200

# 8. Document
npm run validate:db01 > migration_report.txt            # Save evidence
echo "DB-01 Complete" >> AGAINST.md                    # Update master ledger
```

---

## 🆘 Emergency Commands

```bash
# If everything goes wrong and you need to start over:

# 1. Stop all processes
# Ctrl+C in all terminal windows

# 2. Reset database
psql -h localhost -U postgres -c "DROP DATABASE salience_atlas_dev;"
createdb -E UTF8 salience_atlas_dev

# 3. Reset node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Regenerate Prisma
npm run prisma:generate

# 5. Retry migration sequence
npm run prisma:migrate
npm run migrate:sqlite-to-pg
npm run validate:db01

# 6. If still failing, rollback to SQLite:
export USE_PRISMA=false
npm run dev
# (application runs on SQLite, fully functional)
```

---

## 📞 Quick Command Reference

| Task | Command |
|------|---------|
| Create PostgreSQL DB | `createdb -E UTF8 salience_atlas_dev` |
| Start Docker DB | `docker-compose -f docker-compose.db.yml up -d` |
| Configure env | `cp .env.db01.local .env.development.local` |
| Generate schema | `npm run prisma:generate` |
| Deploy tables | `npm run prisma:migrate` |
| Migrate data | `npm run migrate:sqlite-to-pg` |
| Validate | `npm run validate:db01` |
| Open studio | `npx prisma studio` |
| Test build | `npm run build` |
| Start dev | `npm run dev` |
| Check health | `curl http://localhost:3000/api/health` |
| Rollback | `export USE_PRISMA=false` |
| Reset DB | `npm run prisma:migrate reset` |
| View logs | `docker-compose -f docker-compose.db.yml logs -f` |

---

**Status:** DB-01 Scaffolding Complete
**Version:** 1.0
**Last Updated:** 2026-09-01
