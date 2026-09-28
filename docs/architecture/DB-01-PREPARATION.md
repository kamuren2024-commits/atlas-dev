# DB-01 PREPARATION PROTOCOL
## POSTGRES ENTERPRISE CORE — EXECUTION PLAN

**Generated:** 2026-08-31 15:57 UTC  
**Status:** READY FOR ENACTMENT  
**Phase:** DB-01 (PostgreSQL foundation)  
**Prerequisite:** DB-00 COMPLETE ✅  

---

## PHASE OBJECTIVE

Transform Atlas from single-file SQLite to enterprise PostgreSQL foundation:

```
Current:  SQLite (file-based)
           ↓
Target:   PostgreSQL (cluster-ready)
           +Prisma ORM
           +Multi-tenancy fields
           +Audit metadata
           +Soft delete support
```

### Success Criteria
- ✅ PostgreSQL database operational with all data migrated
- ✅ Prisma schema complete and migrations working
- ✅ 100% existing data preserved (no data loss)
- ✅ All service APIs unchanged (zero breaking changes)
- ✅ Full rollback procedure tested
- ✅ Zero regressions in functionality
- ✅ Database health check passing
- ✅ Performance metrics established

---

## SCOPE

### IN SCOPE
- ✅ Define Prisma schema (25 SQLite tables → PostgreSQL)
- ✅ Add enterprise fields (tenant_id, created_by, updated_by, deleted_at, version)
- ✅ Create migration strategy (SQLite → PostgreSQL data transfer)
- ✅ Update DatabaseCore to use Prisma
- ✅ Update all data access patterns to Prisma
- ✅ Maintain all existing API contracts
- ✅ Add database health checks
- ✅ Validate rollback procedure

### OUT OF SCOPE ❌
- ❌ Redis changes (comes in DB-03)
- ❌ Multi-tenancy enforcement (policy layer in DB-02)
- ❌ Event fabric fixes (separate TypeScript cleanup)
- ❌ Neo4j integration (DB-04)
- ❌ ClickHouse integration (DB-07)
- ❌ Frontend modifications
- ❌ Service business logic changes
- ❌ Authorization/RBAC implementation

---

## SCHEMA DESIGN

### Current SQLite Tables → Prisma Mapping

#### Procurement Domain
```prisma
// Existing in SQLite
model Bidder {
  id String @id @default(cuid())
  name String
  documents Document[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
}

model Document {
  id String @id @default(cuid())
  bidderId String
  bidder Bidder @relation(fields: [bidderId], references: [id], onDelete: Cascade)
  name String
  category String
  size String
  uploadTime DateTime
  progress Int
  status String
  extractedText String
  officerNotes String
  // Complex fields from JSON
  versionHistory Json?
  overrides Json?
  recommendations Json?
  timeline Json?
  metadata Json?
  requirements Json?
  quality Json?
  crossField Json?
  financial Json?
  technical Json?
  evidence Json?
  confidence Json?
  
  pipelineStages PipelineStage[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  createdBy String?
  updatedBy String?
  tenantId String?
}

model PipelineStage {
  id String @id @default(cuid())
  documentId String
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  name String
  status String
  duration String
  confidence Int
  input String?
  output String?
  rawConfidence Int?
  adjustedConfidence Int?
  supportingEvidenceCount Int?
  missingEvidenceCount Int?
  humanReviewRequired Boolean?
  errors String?
  retries Int?
  evidenceGenerated Json?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  createdBy String?
  updatedBy String?
  tenantId String?
}
```

#### Rules & Evidence Domain
```prisma
model Rule {
  id String @id @default(cuid())
  description String
  inputSchema Json?
  outputSchema Json?
  
  versions RuleVersion[]
  executions RuleExecution[]
  dependencies RuleDependency[]
  testCases RuleTestCase[]
  stats RuleExecutionStats[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  createdBy String?
  updatedBy String?
  tenantId String?
}

model RuleVersion {
  id String @id @default(cuid())
  ruleId String
  rule Rule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  versionNumber Int
  content Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}

model Evidence {
  id String @id @default(cuid())
  type String
  content String
  sourceDocument String?
  sourceChunk String?
  confidence Float?
  
  relationships EvidenceRelationship[] @relation("from")
  relatedFrom EvidenceRelationship[] @relation("to")
  conflicts EvidenceConflict[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  createdBy String?
  updatedBy String?
  tenantId String?
}

model EvidenceRelationship {
  id String @id @default(cuid())
  fromId String
  from Evidence @relation("from", fields: [fromId], references: [id], onDelete: Cascade)
  toId String
  to Evidence @relation("to", fields: [toId], references: [id], onDelete: Cascade)
  relationshipType String
  confidence Float?
  createdAt DateTime @default(now())
  tenantId String?
  
  @@unique([fromId, toId, relationshipType])
}
```

#### Workflow & Agent Domain
```prisma
model WorkflowCheckpoint {
  id String @id @default(cuid())
  workflowId String
  nodeId String
  status String
  payloadJson Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  tenantId String?
}

model AgentRun {
  id String @id @default(cuid())
  agentName String
  taskId String
  status String
  reasoningHistory Json
  confidenceScore Float
  duration Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  createdBy String?
  tenantId String?
}
```

#### AI & Memory Domain
```prisma
model PromptRegistry {
  id String @id @default(cuid())
  name String
  version Int
  content String
  systemInstruction String?
  parameters Json?
  owner String?
  status String @default("ACTIVE")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
  
  @@unique([name, version])
}

model AIMemory {
  id String @id @default(cuid())
  tenantId String
  workflowId String
  type String // semantic, episodic, working
  content String
  metadata Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
}

model AIExecutionLog {
  id String @id @default(cuid())
  provider String
  model String
  inputTokens Int
  outputTokens Int
  cost Float
  duration Int
  status String
  createdAt DateTime @default(now())
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}
```

#### Audit & Configuration
```prisma
model AuditLog {
  id String @id @default(cuid())
  timestamp DateTime @default(now())
  user String
  action String
  documentId String?
  documentName String?
  details String
  category String
  signature String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}

model SystemConfig {
  key String @id
  value String
  updatedAt DateTime @updatedAt
  tenantId String?
}

model Conversation {
  id String @id @default(cuid())
  historyJson Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}

model Notification {
  id String @id @default(cuid())
  title String
  message String
  read Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  userId String?
  tenantId String?
}

model ProcurementRule {
  id String @id @default(cuid())
  description String
  applicableStage String
  expectedEvidence String
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}

model LegalInstrument {
  id String @id @default(cuid())
  name String
  short_name String
  description String?
  sections LegalSection[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  version Int @default(1)
  tenantId String?
}

model LegalSection {
  id String @id @default(cuid())
  instrumentId String
  instrument LegalInstrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)
  sectionNumber String
  content String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @db.Timestamp
  tenantId String?
}
```

### Enterprise Fields Added (DB-01)
- ✅ `tenantId` - Multi-tenancy support (prepared, not enforced until DB-02)
- ✅ `createdBy` - Audit metadata
- ✅ `updatedBy` - Audit metadata
- ✅ `createdAt` - Standardized timestamps
- ✅ `updatedAt` - Standardized timestamps
- ✅ `deletedAt` - Soft delete support (null = active)
- ✅ `version` - Optimistic concurrency control

---

## MIGRATION STRATEGY

### Phase 1: Preparation (Safe to abort)

```sql
-- Create PostgreSQL database
CREATE DATABASE salience_atlas;

-- Create role/user (if needed)
CREATE ROLE atlas_user WITH LOGIN PASSWORD '...';
GRANT ALL PRIVILEGES ON DATABASE salience_atlas TO atlas_user;
```

### Phase 2: Schema Creation (Safe to abort)

```bash
# Generate Prisma schema (from design above)
# Validate schema with Prisma CLI
npx prisma format
npx prisma validate

# Generate migration
npx prisma migrate dev --name initial_schema
```

### Phase 3: Data Migration (Safe to rollback)

```bash
# Export from SQLite
node -e "
const db = require('./backend/database/db-core');
const core = db.DatabaseCore.getInstance();
await core.connect();
// Export all table data to JSON files
"

# Import to PostgreSQL via Prisma
```

### Phase 4: Validation (Must pass)

```bash
# Verify data integrity
SELECT COUNT(*) FROM bidders;          # Compare with SQLite count
SELECT COUNT(*) FROM documents;        # Compare with SQLite count
SELECT COUNT(*) FROM rules;            # Compare with SQLite count
... (all tables)

# Verify foreign key relationships
SELECT COUNT(*) FROM documents WHERE bidder_id NOT IN (SELECT id FROM bidders);
# Should return 0

# Verify timestamps
SELECT COUNT(*) FROM documents WHERE created_at IS NULL;
# Should return 0 (all documents must have timestamps)
```

### Phase 5: Switchover (Point of no return)

```bash
# Update DatabaseCore to use Prisma
# Update all data access methods
# Run full test suite
# If all pass: Commit changes
# If any fail: Rollback to Phase 3
```

### Phase 6: Rollback (Emergency only)

```bash
# Keep SQLite database intact during migration
# If PostgreSQL fails at any point:
  1. Stop application
  2. Revert DatabaseCore to use SQLite
  3. Restart with original database
  4. No data loss (both databases have full data)
```

---

## IMPLEMENTATION CHECKLIST

### Pre-Implementation
- [ ] PostgreSQL database created
- [ ] Connection credentials configured in .env
- [ ] Prisma installed (npm install @prisma/client)
- [ ] schema.prisma reviewed and approved
- [ ] Migration scripts tested locally

### Implementation
- [ ] Schema created in PostgreSQL
- [ ] Initial migration applied
- [ ] Data exported from SQLite
- [ ] Data imported to PostgreSQL
- [ ] All counts verified (exact match)
- [ ] Foreign key integrity validated
- [ ] Timestamp verification passed

### DatabaseCore Refactoring
- [ ] DatabaseCore updated to use Prisma
- [ ] All query methods refactored to Prisma
- [ ] Connection pooling configured
- [ ] Health check endpoint updated
- [ ] Error handling tested

### Testing
- [ ] All existing unit tests pass (if any)
- [ ] All existing integration tests pass (if any)
- [ ] Data access tests written
- [ ] Migration rollback tested
- [ ] Performance baseline established

### Deployment
- [ ] Database backup created
- [ ] Rollback procedure documented
- [ ] Deployment playbook written
- [ ] Team trained on new procedures
- [ ] Monitoring configured

---

## RISK ASSESSMENT

### High Risk Items
1. **Data Loss During Migration**
   - Mitigation: Keep SQLite intact, dual-write during validation
   - Rollback: Revert to SQLite, retain all data

2. **API Contract Breaking**
   - Mitigation: Adapter layer (DatabaseCore abstraction)
   - Rollback: Revert DatabaseCore changes

3. **Performance Regression**
   - Mitigation: Establish baseline, index strategy
   - Rollback: Profile queries, optimize before go-live

### Medium Risk Items
1. **Connection Pooling Issues**
   - Mitigation: Test with production workload
   - Rollback: Adjust pool settings

2. **Foreign Key Constraint Violations**
   - Mitigation: Validate before import
   - Rollback: Fix data issues, retry

### Low Risk Items
1. **Timestamp Conversion Issues**
   - Mitigation: Prisma handles conversion
   - Rollback: Update timestamps in PostgreSQL

---

## DELIVERABLES

### Code Changes
- [ ] `prisma/schema.prisma` - Complete schema
- [ ] `prisma/migrations/001_initial_schema` - Initial migration
- [ ] `backend/database/db-core.ts` - Refactored for Prisma
- [ ] `backend/database/prisma.service.ts` - Prisma wrapper (new)
- [ ] `.env.example` - Updated with PostgreSQL config

### Documentation
- [ ] `docs/architecture/DB-01-MIGRATION.md` - Migration guide
- [ ] `docs/architecture/DB-01-FINDINGS.md` - Phase results
- [ ] `AGAINST.md` - Updated DB-01 section

### Tests
- [ ] Data migration validation script
- [ ] Database integrity checks
- [ ] Rollback procedure tests
- [ ] Performance baseline metrics

### Infrastructure
- [ ] PostgreSQL database created
- [ ] Connection pooling configured
- [ ] Backup/restore procedures tested
- [ ] Monitoring dashboards created

---

## SUCCESS METRICS

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Data Integrity** | 100% | Row count match, FK validation |
| **API Compatibility** | 100% | All endpoints return same format |
| **Performance** | ≥95% | P50/P95/P99 latency vs SQLite |
| **Test Pass Rate** | 100% | All tests passing |
| **Zero Regressions** | Yes | Feature parity verified |
| **Rollback Time** | <5 min | Failover to SQLite tested |
| **Migration Duration** | <2 hours | Time from start to full switchover |

---

## TIMELINE ESTIMATE

```
Phase 1 (Prep):           2 hours   Databases, credentials, validation
Phase 2 (Schema):         3 hours   Schema design, migration creation
Phase 3 (Migration):      4 hours   Data extraction, import, validation
Phase 4 (Validation):     2 hours   Count checks, FK validation, integrity
Phase 5 (Code Refactor):  6 hours   DatabaseCore update, API testing
Phase 6 (Testing):        4 hours   Full test suite, edge cases
Phase 7 (Deployment):     2 hours   Switchover, monitoring, documentation
───────────────────────────────────
TOTAL:                   23 hours   (1-2 business days)
```

---

## GO-LIVE DECISION CRITERIA

### Must Pass Before Switchover
- ✅ PostgreSQL data count = SQLite data count (all tables)
- ✅ Foreign key validation = zero violations
- ✅ All tests passing (100%)
- ✅ API response format unchanged (spot checks)
- ✅ Rollback procedure tested successfully
- ✅ Performance acceptable (≤10% regression)
- ✅ Monitoring/alerting configured
- ✅ Team trained and ready

### Go/No-Go Decision Point
When all criteria met:
- 🟢 **GO:** Proceed to production
- 🔴 **NO-GO:** Rollback and investigate

---

## POST-LAUNCH MONITORING (24 hours)

```
Metrics to Monitor:
  ✅ API response times (P50, P95, P99)
  ✅ Database connection pool usage
  ✅ Error rates (500s, connection errors)
  ✅ Data consistency checks
  ✅ Backup completion
  ✅ Alert/notification system
  ✅ Agent execution metrics

Rollback Triggers:
  🔴 API response time >2x baseline
  🔴 Database connection failures
  🔴 Data loss or corruption
  🔴 Foreign key violations
  🔴 Null value constraint violations
  🔴 Service degradation >5%
```

---

## HANDOFF

**To:** DB-01 Execution Team  
**From:** DB-00 Forensics Team  
**Status:** READY TO ENACT  
**Next Step:** Approve DB-01 Execution Plan  

**See AGAINST.md Phase Matrix for current status.**
