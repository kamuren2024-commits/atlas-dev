# EETF EVALUATION OPS - 12 PHASE IMPLEMENTATION PLAN

**Status:** 🔴 IN PLANNING  
**Date:** 2026-08-30  
**Authority:** PPADA 2015 + PPADR 2020 + Specification Document  
**Total Phases:** 12 (plus Phase 00 complete)  
**Estimated Duration:** 10-12 weeks (full-time execution)  
**Production Target:** Phase 12 completion required for government deployment

---

## PHASE CRITICAL PATH

```
PHASE 00: Architecture Scan ✅ COMPLETE
    ↓
PHASE 01: Rule Ontology (BLOCKING - must complete first)
    ├→ PHASE 02: Document Engine (parallel possible after 01 foundation)
    ├→ PHASE 03: Requirement Compiler (dependent on 01)
    ├→ PHASE 04: Evaluation Engine (dependent on 01, 03)
    ├→ PHASE 05: Temporal Engine (independent, critical)
    ├→ PHASE 06: Graph Integration (dependent on 01-05)
    ├→ PHASE 07: Workflow & Human Review (dependent on 04, 06)
    ├→ PHASE 08: UI Enhancements (can start after 04 foundation)
    ├→ PHASE 09: AI Governance (dependent on 01, 04)
    ├→ PHASE 10: Audit & Reporting (dependent on 06)
    ├→ PHASE 11: Security & Authorization (dependent on 07)
    └→ PHASE 12: Production Certification (dependent on all others)
```

---

## PHASE 01: EETF RULE ONTOLOGY

**Duration:** 5-7 days  
**Blocking:** YES - All other phases depend on this  
**Risk:** CRITICAL  

### Objectives

1. Define legal-to-rule mapping schema
2. Implement rule versioning and governance
3. Create rule compiler architecture
4. Establish rule executor specification
5. Migrate hardcoded rules to versioned schema

### Deliverables

- [ ] `PHASE-01-EETF-RULE-ONTOLOGY.md` - Architecture & design
- [ ] `backend/evaluation/rule-schema.ts` - Canonical rule type definitions
- [ ] `backend/evaluation/rule-registry.ts` - Rule storage and versioning
- [ ] `backend/evaluation/rule-compiler.ts` - Rule compilation engine
- [ ] `backend/evaluation/rule-executor.ts` - Deterministic execution engine
- [ ] `backend/evaluation/legal-framework.ts` - PPADA/PPADR sections and citations
- [ ] Unit tests for each rule type
- [ ] Integration test: Rule compilation → execution
- [ ] `docs/LEGAL_RULES_MATRIX.md` - Traceability matrix

### Completion Criteria

- ✅ Code compiles
- ✅ All types defined and typed
- ✅ 3+ hardcoded rules migrated to new schema
- ✅ Temporal rule type defined (used by Phase 05)
- ✅ Unit tests pass (rule compilation, execution)
- ✅ No hardcoded rule logic in React/frontend
- ✅ Rule versioning implemented
- ✅ Legal citations machine-readable
- ✅ MD documentation complete
- ✅ Runtime verification: One rule executes deterministically

### Technical Decisions

**Database:** SQLite (per current db-core.ts)
```sql
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rule_category TEXT NOT NULL,
  legal_source TEXT NOT NULL,
  section TEXT NOT NULL,
  tender_clause TEXT,
  evaluation_stage TEXT NOT NULL,
  severity TEXT NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  effective_from DATE,
  effective_to DATE,
  input_schema JSON NOT NULL,
  output_schema JSON NOT NULL,
  evidence_requirements JSON NOT NULL,
  execution_order INTEGER,
  dependencies JSON,
  failure_behavior TEXT,
  review_behavior TEXT,
  compiled_code TEXT,
  is_deterministic BOOLEAN DEFAULT TRUE
);

CREATE TABLE rule_versions (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP,
  created_by TEXT,
  change_reason TEXT,
  legal_update TEXT,
  FOREIGN KEY (rule_id) REFERENCES rules(id)
);
```

**Rule Schema (TypeScript):**
```typescript
interface Rule {
  rule_id: string;
  rule_version: string;
  rule_category: 'PRELIMINARY' | 'RESPONSIVENESS' | 'TECHNICAL' | 'FINANCIAL' | 'TEMPORAL' | 'DUE_DILIGENCE';
  evaluation_stage: EvaluationStage;
  legal_instrument: string; // "PPADA 2015" | "PPADR 2020" | "Tender Document"
  section_or_regulation: string; // e.g., "Section 71(1)(b)"
  tender_clause: string | null;
  effective_from: Date;
  effective_to: Date | null;
  severity: 'MANDATORY' | 'HIGH' | 'MEDIUM' | 'LOW';
  execution_order: number;
  dependencies: string[]; // rule IDs
  input_schema: JSONSchema;
  output_schema: JSONSchema;
  evidence_requirements: string[];
  failure_behavior: 'NON_RESPONSIVE' | 'NEXT_STAGE_BLOCK' | 'REQUIRES_REVIEW' | 'SCORE_PENALTY';
  review_behavior: 'AUTOMATIC' | 'ALWAYS_REVIEW' | 'REVIEW_IF_FAIL';
  test_reference: string[];
  logic: RuleExecutable; // Compiled executable
}
```

---

## PHASE 02: EETF DOCUMENT ENGINE

**Duration:** 5-7 days  
**Blocking:** Partially - can start after Phase 01 foundation  
**Risk:** HIGH

### Objectives

1. Upgrade document ingestion pipeline
2. Implement document versioning
3. Create evidence provenance tracking
4. Implement document classification rules
5. Register golden corpus

### Deliverables

- [ ] `PHASE-02-EETF-DOCUMENT-ENGINE.md`
- [ ] `backend/evaluation/document-engine.ts` - Main engine
- [ ] `backend/evaluation/document-classifier.ts` - Classification rules
- [ ] `backend/evaluation/evidence-provenance.ts` - Provenance tracking
- [ ] Database schema updates (document_versions, evidence_items, evidence_anchors)
- [ ] Golden corpus registration
- [ ] Unit tests
- [ ] Integration test: Document upload → classification → evidence extraction

### Completion Criteria

- ✅ Code compiles
- ✅ Document upload persists version information
- ✅ Evidence provenance tracked (document → page → section → value)
- ✅ Classification rules deterministic
- ✅ Golden corpus registered and retrievable
- ✅ Unit tests pass
- ✅ Integration test passes
- ✅ MD documentation complete

---

## PHASE 03: EETF REQUIREMENT COMPILER

**Duration:** 4-5 days  
**Blocking:** Dependent on Phase 01  
**Risk:** HIGH

### Objectives

1. Parse tender documents to extract evaluation criteria
2. Compile criteria into requirement objects
3. Link requirements to rules
4. Create requirement graph structure

### Deliverables

- [ ] `PHASE-03-EETF-REQUIREMENT-COMPILER.md`
- [ ] `backend/evaluation/requirement-compiler.ts`
- [ ] `backend/evaluation/requirement-model.ts`
- [ ] Database schema (requirements, criteria, clauses)
- [ ] Unit tests
- [ ] Integration test: Tender → Requirements → Rules

### Completion Criteria

- ✅ Code compiles
- ✅ Requirement model defined
- ✅ Tender documents parsed for criteria
- ✅ Requirements linked to rules
- ✅ Unit tests pass
- ✅ MD documentation complete

---

## PHASE 04: EETF EVALUATION ENGINE

**Duration:** 7-10 days  
**Blocking:** Dependent on Phases 01, 03  
**Risk:** CRITICAL

### Objectives

1. Implement deterministic rule execution
2. Create evaluation pipeline stages
3. Implement responsiveness gate
4. Create technical and financial evaluators
5. Implement ranking logic

### Deliverables

- [ ] `PHASE-04-EETF-EVALUATION-ENGINE.md`
- [ ] `backend/evaluation/eetf-evaluation-engine.ts` - Main evaluation coordinator
- [ ] `backend/evaluation/preliminary-evaluator.ts` - Preliminary stage
- [ ] `backend/evaluation/responsiveness-gate.ts` - Responsiveness checks
- [ ] `backend/evaluation/technical-evaluator.ts` - Technical scoring
- [ ] `backend/evaluation/financial-evaluator.ts` - Financial scoring & ranking
- [ ] Database schema (evaluation_results, scores)
- [ ] Comprehensive test suite (20+ tests)
- [ ] Integration test: Complete evaluation workflow

### Completion Criteria

- ✅ Code compiles
- ✅ Evaluation stages execute in order
- ✅ Deterministic results (replay produces same output)
- ✅ Evidence-linked results
- ✅ All tests pass
- ✅ MD documentation complete
- ✅ Runtime verification on golden corpus

---

## PHASE 05: EETF TEMPORAL ENGINE

**Duration:** 4-6 days  
**Blocking:** Independent (can run parallel)  
**Risk:** HIGH (date logic complex)

### Objectives

1. Implement date normalization
2. Create temporal rule execution
3. Handle date ambiguity and edge cases
4. Implement expiry validation
5. Create temporal conflict detection

### Deliverables

- [ ] `PHASE-05-EETF-TEMPORAL-ENGINE.md`
- [ ] `backend/evaluation/temporal-engine.ts`
- [ ] `backend/evaluation/date-normalizer.ts`
- [ ] `backend/evaluation/expiry-validator.ts`
- [ ] Unit tests (30+ covering edge cases)
- [ ] Adversarial tests (expired documents, future dates, etc.)

### Completion Criteria

- ✅ Code compiles
- ✅ Date parsing handles multiple formats
- ✅ Expiry logic deterministic
- ✅ All tests pass (including adversarial)
- ✅ Handles timezone correctly
- ✅ MD documentation complete

---

## PHASE 06: EETF GRAPH INTEGRATION

**Duration:** 5-7 days  
**Blocking:** Dependent on Phases 01-05  
**Risk:** CRITICAL

### Objectives

1. Implement full Neo4j backing
2. Create graph node types for all entities
3. Implement graph relationships
4. Create graph query APIs
5. Implement lineage tracking ("why failed?" queries)
6. Create replay capability on graph

### Deliverables

- [ ] `PHASE-06-EETF-GRAPH.md`
- [ ] `backend/evaluation/graph-engine.ts` - Neo4j integration
- [ ] `backend/evaluation/graph-queries.ts` - Explanation queries
- [ ] `backend/evaluation/lineage-engine.ts` - Decision lineage
- [ ] `backend/evaluation/replay-engine.ts` - Deterministic replay
- [ ] Graph schema definition (nodes, relationships)
- [ ] API endpoints: GET /evaluation/:id/graph, /explanation, /legal, /audit
- [ ] Unit tests
- [ ] Integration tests

### Completion Criteria

- ✅ Code compiles
- ✅ All nodes created correctly
- ✅ Relationships traversable
- ✅ Lineage queries work (why failed, why passed, which evidence, etc.)
- ✅ Replay produces identical results
- ✅ Performance acceptable (<500ms for queries)
- ✅ All tests pass
- ✅ MD documentation complete

---

## PHASE 07: EETF WORKFLOW & HUMAN REVIEW

**Duration:** 6-8 days  
**Blocking:** Dependent on Phases 04, 06  
**Risk:** HIGH

### Objectives

1. Implement review case workflow
2. Create human review queue
3. Implement officer decision tracking
4. Create override audit trail
5. Implement review state machine

### Deliverables

- [ ] `PHASE-07-EETF-WORKFLOW.md`
- [ ] `backend/evaluation/review-queue-engine.ts`
- [ ] `backend/evaluation/case-workflow.ts` - State machine
- [ ] `backend/evaluation/officer-decision-recorder.ts` - Override tracking
- [ ] Database schema (review_cases, officer_decisions)
- [ ] API endpoints for case management
- [ ] Unit tests
- [ ] Workflow integration tests

### Completion Criteria

- ✅ Code compiles
- ✅ Cases created for uncertainty scenarios
- ✅ Officer decisions recorded with audit trail
- ✅ Overrides immutably tracked
- ✅ State machine prevents invalid transitions
- ✅ All tests pass
- ✅ MD documentation complete

---

## PHASE 08: EETF UI ENHANCEMENTS

**Duration:** 5-7 days  
**Blocking:** Dependent on Phase 04 (can start when evaluation basics work)  
**Risk:** MEDIUM

### Objectives

1. Upgrade existing EETF UI to operational cockpit
2. Implement real-time event display
3. Create explanation/why components
4. Implement graph visualization
5. Create audit timeline

### Deliverables

- [ ] `PHASE-08-EETF-UI.md`
- [ ] Updated React components in `src/`
- [ ] Event subscription handler (real backend events)
- [ ] Explanation UI components
- [ ] Graph visualization components
- [ ] Audit timeline component
- [ ] UI tests

### Completion Criteria

- ✅ Code compiles
- ✅ UI displays actual backend state
- ✅ Events stream to UI in real-time
- ✅ Explanations accessible via graph APIs
- ✅ No simulated progress (real events only)
- ✅ UI tests pass
- ✅ MD documentation complete

---

## PHASE 09: EETF AI GOVERNANCE

**Duration:** 4-5 days  
**Blocking:** Dependent on Phases 01, 04  
**Risk:** MEDIUM

### Objectives

1. Define AI boundary (what AI can/cannot do)
2. Implement multi-pass extraction consensus
3. Create conflict detection
4. Implement review triggers
5. Document AI model versions

### Deliverables

- [ ] `PHASE-09-EETF-AI-GOVERNANCE.md`
- [ ] `backend/evaluation/extraction-consensus.ts`
- [ ] `backend/evaluation/conflict-detector.ts`
- [ ] `backend/evaluation/review-trigger-engine.ts`
- [ ] AI model registry and versioning
- [ ] Unit tests

### Completion Criteria

- ✅ Code compiles
- ✅ Multi-pass extraction consensus implemented
- ✅ Conflicts detected and flagged
- ✅ Review triggers fire correctly
- ✅ All tests pass
- ✅ MD documentation complete
- ✅ AI boundary enforced in code

---

## PHASE 10: EETF AUDIT & REPORTING

**Duration:** 5-7 days  
**Blocking:** Dependent on Phases 06, 07  
**Risk:** HIGH

### Objectives

1. Implement immutable audit trail
2. Create cryptographic signing
3. Implement audit event publishing
4. Create report generation
5. Create audit export functionality

### Deliverables

- [ ] `PHASE-10-EETF-AUDIT-REPORTING.md`
- [ ] `backend/evaluation/audit-trail-engine.ts`
- [ ] `backend/evaluation/report-generator.ts`
- [ ] `backend/evaluation/audit-exporter.ts`
- [ ] Database schema (audit_events with signatures)
- [ ] Report templates
- [ ] Unit tests
- [ ] Audit verification tests

### Completion Criteria

- ✅ Code compiles
- ✅ Audit trail immutable (cryptographically signed)
- ✅ All events recorded
- ✅ Reports generate correctly
- ✅ Audit trail verifiable
- ✅ All tests pass
- ✅ MD documentation complete

---

## PHASE 11: EETF SECURITY & AUTHORIZATION

**Duration:** 4-6 days  
**Blocking:** Dependent on Phase 07  
**Risk:** CRITICAL

### Objectives

1. Implement EETF-specific RBAC
2. Create ACLs for sensitive operations
3. Implement document authorization
4. Create audit log signing
5. Implement rate limiting

### Deliverables

- [ ] `PHASE-11-EETF-SECURITY.md`
- [ ] EETF roles and permissions
- [ ] Enhanced authorization-service.ts
- [ ] ACL enforcement middleware
- [ ] Security tests
- [ ] Authorization tests

### Completion Criteria

- ✅ Code compiles
- ✅ EETF roles defined and enforced
- ✅ Sensitive operations protected
- ✅ Document access controlled
- ✅ Audit logs signed
- ✅ All tests pass
- ✅ MD documentation complete
- ✅ No frontend-only authorization

---

## PHASE 12: EETF PRODUCTION CERTIFICATION

**Duration:** 5-7 days  
**Blocking:** Dependent on ALL previous phases  
**Risk:** CRITICAL

### Objectives

1. End-to-end workflow verification
2. Golden corpus evaluation verification
3. Performance baseline establishment
4. Security audit
5. Production readiness sign-off

### Deliverables

- [ ] `PHASE-12-EETF-CERTIFICATION.md`
- [ ] Complete workflow test suite
- [ ] Golden corpus evaluation results
- [ ] Performance baseline report
- [ ] Security audit report
- [ ] Production readiness checklist

### Completion Criteria (MANDATORY FOR DEPLOYMENT)

- ✅ Real tender document → real extraction → real requirement → real rule → real evidence → real evaluation → real event → real graph update → real UI → real audit → real report
- ✅ All tests pass (unit, integration, workflow, security, golden)
- ✅ No production data in local files (JSON stores)
- ✅ All infrastructure uses platform services (PostgreSQL, Neo4j, MinIO, Redpanda)
- ✅ Audit trail cryptographically verified
- ✅ Replay test passes (same input versions = same output)
- ✅ Performance meets SLA (<2s for evaluation on golden corpus)
- ✅ Zero security vulnerabilities identified
- ✅ All MD documentation complete and accurate
- ✅ Legal traceability matrix updated
- ✅ Compliance report signed

---

## IMPLEMENTATION GOVERNANCE

### Loop Completion Contract (Every Phase)

```
SCAN (understand current state)
  ↓
PLAN (design implementation)
  ↓
MODIFY (write code)
  ↓
TEST (verify correctness)
  ↓
RUN (execute workflow)
  ↓
OBSERVE (verify results)
  ↓
REPAIR (fix issues found)
  ↓
VERIFY (confirm fixes)
  ↓
UPDATE GRAPH (update Neo4j)
  ↓
UPDATE MD (document changes)
  ↓
UPDATE TRACEABILITY (mark status)
  ↓
COMMIT (version control)
```

### Phase Completion Gate

Phase advances only when:
- ✅ Code compiles
- ✅ Typecheck passes
- ✅ Lint passes
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Relevant UI tests pass (if applicable)
- ✅ Legal traceability updated
- ✅ Architecture MD updated
- ✅ IMPLEMENTATION_PROGRESS updated
- ✅ Runtime verified

### Blocking Issues Log

| Phase | Issue | Status | Blocking |
|-------|-------|--------|----------|
| 00 | Architecture scan incomplete | RESOLVED | No (scan complete) |
| 01 | No rule execution model | IN_PROGRESS | YES |
| 01 | Legal control plane missing | IN_PROGRESS | YES |
| 05 | Date parsing ambiguity | PLANNED | YES |
| 06 | Neo4j not fully integrated | PLANNED | YES |
| 10 | Audit signing not implemented | PLANNED | YES |

---

## RESOURCE ALLOCATION

| Phase | Est. Days | Complexity | Risk | Critical Path |
|-------|-----------|-----------|------|---|
| 00 | 2 | Medium | Low | ✅ Complete |
| 01 | 6 | High | Critical | ✅ Blocking all |
| 02 | 6 | Medium | High | ✓ After 01 |
| 03 | 5 | Medium | High | ✓ After 01 |
| 04 | 8 | Critical | Critical | ✓ After 01,03 |
| 05 | 5 | High | High | ✓ Parallel |
| 06 | 6 | Critical | Critical | ✓ After 01-05 |
| 07 | 7 | High | High | ✓ After 04,06 |
| 08 | 6 | Medium | Medium | ✓ After 04 |
| 09 | 5 | Medium | Medium | ✓ After 01,04 |
| 10 | 6 | High | High | ✓ After 06,07 |
| 11 | 5 | High | Critical | ✓ After 07 |
| 12 | 6 | Critical | Critical | ✓ After all |
| **TOTAL** | **68** | **-** | **-** | **~10 weeks** |

---

## TRACEABILITY & COMPLIANCE

Each phase must update:

1. **IMPLEMENTATION_PROGRESS.md** - Status of each requirement
2. **PPADA_2015_TRACEABILITY.md** - Which code implements which PPADA sections
3. **PPADR_2020_TRACEABILITY.md** - Which code implements which PPADR regulations
4. **LEGAL_RULES_MATRIX.md** - Rule-to-legal mapping
5. **ARCHITECTURE.md** - Component updates
6. **EVENT_BUS.md** - Event type updates
7. **KNOWLEDGE_GRAPH.md** - Graph schema updates
8. **TEST_RESULTS.md** - Test coverage
9. **CHANGELOG.md** - Version notes

---

## SUCCESS CRITERIA

### Functional

- ✅ EETF evaluates bids deterministically, evidence-driven
- ✅ Evaluation results immutably auditable
- ✅ Results replay-able (same input → same output)
- ✅ Decisions traceable to evidence through graph
- ✅ Human review integrated where required
- ✅ All PPADA/PPADR requirements enforced
- ✅ Tender-specific rules enforced
- ✅ Real-time event loop operational
- ✅ Reports generated correctly

### Non-Functional

- ✅ <2s evaluation latency on golden corpus
- ✅ Audit trail cryptographically signed
- ✅ Zero data loss on component restart
- ✅ All infrastructure via platform services
- ✅ Security audit passing
- ✅ 100% code coverage on rule execution
- ✅ 95%+ overall test coverage

### Compliance

- ✅ PPADA 2015 fully implemented
- ✅ PPADR 2020 fully implemented
- ✅ Tender-specific criteria enforced
- ✅ Legal framework versioned and auditable

---

## NEXT STEP

Begin **PHASE 01: EETF Rule Ontology** immediately upon approval of this plan.

**Date:** 2026-08-30  
**Status:** 🔴 Ready for Phase 01 execution

---

**END OF PHASE PLAN**
