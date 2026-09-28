# PHASE 01: EETF RULE ONTOLOGY

**Status:** 🔴 IN PROGRESS  
**Start Date:** 2026-08-30  
**Target Completion:** 2026-09-06  
**Authority:** PPADA 2015 + PPADR 2020 + Specification Document  
**Blocking:** YES - All other phases depend on this foundation

---

## EXECUTIVE SUMMARY

Phase 01 establishes the foundational rule infrastructure for EETF Evaluation Ops. This includes:

- **Rule Schema:** Canonical TypeScript definitions for all rule types
- **Rule Registry:** SQLite-backed storage with versioning
- **Rule Compiler:** Converts rule definitions to executable form
- **Rule Executor:** Deterministic execution engine for rules
- **Legal Framework:** PPADA/PPADR sections as queryable entities
- **Migration:** Convert hardcoded rules to new schema

**No phase can proceed without Phase 01 completion.**

---

## 01. RULE ONTOLOGY ARCHITECTURE

### 1.1 Core Principles

1. **Determinism:** Same input always produces same output
2. **Auditability:** Every decision traceable to rule, version, and legal basis
3. **Versioning:** Rules versioned against law, regulation, tender
4. **Governance:** Rules external to code; managed as data
5. **Traceability:** Machine-readable legal citations
6. **Composability:** Rules can depend on other rules
7. **Immutability:** Rule versions never modified; only new versions created

### 1.2 Rule Categories

```
PRELIMINARY
  ├─ Eligibility
  ├─ Format & Serialization
  ├─ Tender Security
  ├─ Required Documents
  └─ Required Information

RESPONSIVENESS
  ├─ Mandatory Requirement Compliance
  ├─ Bid Security Validity
  ├─ Signature Authority
  └─ Tender Validity

TECHNICAL
  ├─ Pass/Fail Criteria
  ├─ Weighted Criteria
  ├─ Minimum Thresholds
  ├─ Personnel Evaluation
  ├─ Equipment Evaluation
  ├─ Experience Evaluation
  ├─ Methodology Assessment
  ├─ Workplan Assessment
  ├─ References Verification
  └─ Warranty Assessment

FINANCIAL
  ├─ Price Extraction
  ├─ Arithmetic Validation
  ├─ Discount Handling
  ├─ Currency Handling
  ├─ VAT Validation
  ├─ Evaluated Price Calculation
  └─ Ranking

TEMPORAL
  ├─ Certificate Expiry
  ├─ License Validity
  ├─ Professional Registration
  ├─ Financial Year
  ├─ Reference Project Window
  └─ Tender Closing Date Comparison

DUE_DILIGENCE
  ├─ Post-Qualification Verification
  ├─ Clarification Requests
  ├─ Collusion Detection
  └─ Fraud Investigation
```

### 1.3 Rule Execution Model

```
Rule Definition (versioned, external to code)
  ↓
Rule Compilation (convert to executable form)
  ↓
Input Validation (check evidence exists and schema matches)
  ↓
Rule Execution (deterministic calculation)
  ↓
Output Validation (verify output schema matches)
  ↓
Result Creation (evidence-linked, versioned)
  ↓
Audit Event (immutable record)
```

---

## 02. RULE SCHEMA

### 2.1 Canonical Rule Type (TypeScript)

```typescript
export interface Rule {
  // Identity & Versioning
  rule_id: string;                    // e.g., "PRE-01-ELIGIBILITY"
  rule_version: string;               // e.g., "1.0.0"
  rule_sequence: number;              // Execution order
  
  // Classification
  rule_category: RuleCategory;
  evaluation_stage: EvaluationStage;
  
  // Legal Authority
  legal_instrument: LegalInstrument;   // "PPADA 2015" | "PPADR 2020" | "Tender"
  section_or_regulation: string;       // e.g., "Section 71(1)(b)"
  tender_clause: string | null;        // e.g., "Clause 5.2"
  legal_text: string;                  // Full text of the regulation
  
  // Temporal
  effective_from: Date;
  effective_to: Date | null;
  
  // Severity & Behavior
  severity: RuleSeverity;              // MANDATORY | HIGH | MEDIUM | LOW
  failure_behavior: FailureBehavior;   // What happens if rule fails
  review_behavior: ReviewBehavior;     // When to require human review
  
  // Dependencies
  dependencies: string[];              // Rule IDs this depends on
  prerequisites: string[];             // Conditions that must be true
  
  // Schema & Execution
  input_schema: JSONSchema;            // Expected evidence schema
  output_schema: JSONSchema;           // Expected result schema
  evidence_requirements: string[];     // Types of evidence needed
  
  // Implementation
  logic: RuleExecutable;               // Compiled executable
  test_reference: string[];            // Test IDs for regression
  
  // Metadata
  created_at: Date;
  created_by: string;
  last_modified_at: Date;
  last_modified_by: string;
  description: string;
}

export type RuleCategory =
  | 'PRELIMINARY'
  | 'RESPONSIVENESS'
  | 'TECHNICAL'
  | 'FINANCIAL'
  | 'TEMPORAL'
  | 'DUE_DILIGENCE';

export type RuleSeverity = 'MANDATORY' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FailureBehavior =
  | 'NON_RESPONSIVE'           // Bid rejected
  | 'NEXT_STAGE_BLOCK'         // Cannot proceed to next stage
  | 'SCORE_PENALTY'            // Deduct points
  | 'REQUIRES_REVIEW';         // Flag for human review

export type ReviewBehavior =
  | 'AUTOMATIC'                // Execute without review
  | 'ALWAYS_REVIEW'            // Always require human review
  | 'REVIEW_IF_FAIL';          // Review only if rule fails

export type LegalInstrument =
  | 'PPADA_2015'
  | 'PPADR_2020'
  | 'TENDER_DOCUMENT'
  | 'COMMON_LAW';

export interface RuleExecutable {
  version: string;             // Version of compiler that created it
  compiled_at: Date;
  compiled_code: string;       // Serializable executable
  ast?: any;                   // Abstract syntax tree for replay
}

export interface RuleResult {
  rule_id: string;
  rule_version: string;
  status: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'ERROR';
  confidence: number;          // 0-1, 1=deterministic
  evidence_used: string[];     // Evidence IDs used
  calculation: any;            // Deterministic calculation details
  output: any;                 // Matches output_schema
  error?: string;
  executed_at: Date;
  executed_by: string;
  audit_signature: string;     // Cryptographic signature
}
```

### 2.2 SQLite Schema

```sql
-- Core Rules Table
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL UNIQUE,
  rule_version TEXT NOT NULL,
  rule_sequence INTEGER NOT NULL,
  
  -- Classification
  rule_category TEXT NOT NULL,
  evaluation_stage TEXT NOT NULL,
  
  -- Legal Authority
  legal_instrument TEXT NOT NULL,
  section_or_regulation TEXT NOT NULL,
  tender_clause TEXT,
  legal_text TEXT NOT NULL,
  
  -- Temporal
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- Severity & Behavior
  severity TEXT NOT NULL,
  failure_behavior TEXT NOT NULL,
  review_behavior TEXT NOT NULL,
  
  -- Dependencies
  dependencies TEXT,  -- JSON array of rule IDs
  prerequisites TEXT,  -- JSON array of conditions
  
  -- Schema
  input_schema TEXT NOT NULL,  -- JSON
  output_schema TEXT NOT NULL,  -- JSON
  evidence_requirements TEXT NOT NULL,  -- JSON array
  
  -- Implementation
  logic TEXT NOT NULL,  -- Serialized RuleExecutable
  test_reference TEXT,  -- JSON array of test IDs
  
  -- Metadata
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  last_modified_at TIMESTAMP,
  last_modified_by TEXT,
  
  CONSTRAINT unique_version UNIQUE(rule_id, rule_version)
);

-- Rule Version History
CREATE TABLE rule_versions (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  version TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  legal_update TEXT,
  tender_update TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  
  FOREIGN KEY (rule_id) REFERENCES rules(rule_id),
  CONSTRAINT unique_rule_version UNIQUE(rule_id, version)
);

-- Rule Execution Log
CREATE TABLE rule_executions (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  evaluation_id TEXT NOT NULL,
  
  status TEXT NOT NULL,  -- PASS | FAIL | INCONCLUSIVE | ERROR
  confidence REAL NOT NULL,
  evidence_used TEXT,  -- JSON array of evidence IDs
  calculation TEXT,  -- JSON details of calculation
  output TEXT,  -- JSON result
  error TEXT,
  
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_by TEXT NOT NULL,
  audit_signature TEXT NOT NULL,
  
  FOREIGN KEY (rule_id) REFERENCES rules(rule_id)
);

-- Legal Instruments Table
CREATE TABLE legal_instruments (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  description TEXT,
  full_text TEXT
);

-- Legal Sections Table
CREATE TABLE legal_sections (
  id TEXT PRIMARY KEY,
  instrument_id TEXT NOT NULL,
  section_code TEXT NOT NULL,
  section_number TEXT NOT NULL,
  subsection TEXT,
  heading TEXT NOT NULL,
  full_text TEXT NOT NULL,
  interpretation_guidance TEXT,
  
  FOREIGN KEY (instrument_id) REFERENCES legal_instruments(id),
  CONSTRAINT unique_section UNIQUE(instrument_id, section_code)
);

-- Rule-to-Legal-Section Mapping
CREATE TABLE rule_legal_basis (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  legal_section_id TEXT NOT NULL,
  citation_type TEXT NOT NULL,  -- PRIMARY | SUPPORTING | REGULATORY
  
  FOREIGN KEY (rule_id) REFERENCES rules(rule_id),
  FOREIGN KEY (legal_section_id) REFERENCES legal_sections(id)
);

CREATE INDEX idx_rules_category ON rules(rule_category);
CREATE INDEX idx_rules_stage ON rules(evaluation_stage);
CREATE INDEX idx_rules_sequence ON rules(evaluation_stage, rule_sequence);
CREATE INDEX idx_executions_rule ON rule_executions(rule_id);
CREATE INDEX idx_executions_evaluation ON rule_executions(evaluation_id);
```

---

## 03. RULE REGISTRY

### 3.1 Rule Registry (Singleton)

The Rule Registry is responsible for:

- Storing and retrieving rules by ID and version
- Validating rule definitions
- Managing rule dependencies
- Checking rule applicability (temporal, stage-based)

```typescript
export class RuleRegistry {
  private static instance: RuleRegistry;
  private db: DatabaseCore;
  
  // Get all rules applicable for a stage
  getStageRules(stage: EvaluationStage): Rule[] {}
  
  // Get specific rule by ID and optional version
  getRule(ruleId: string, version?: string): Rule | null {}
  
  // Get all versions of a rule
  getRuleVersions(ruleId: string): Rule[] {}
  
  // Register a new rule
  registerRule(rule: Rule, createdBy: string): void {}
  
  // Update rule (creates new version)
  updateRule(ruleId: string, updates: Partial<Rule>, reason: string, modifiedBy: string): Rule {}
  
  // Check if rule is applicable (effective_from/to)
  isRuleApplicable(ruleId: string, version: string, asOfDate?: Date): boolean {}
  
  // Get dependencies for a rule
  getDependencies(ruleId: string, version: string): Rule[] {}
  
  // Validate rule definition
  validateRule(rule: Rule): { isValid: boolean; errors: string[] } {}
}
```

---

## 04. RULE COMPILER

### 4.1 Rule Compiler

Converts rule definitions to executable form:

```typescript
export class RuleCompiler {
  // Compile a rule definition to executable form
  compile(rule: Rule): RuleExecutable {}
  
  // Compile all rules for a stage
  compileStage(stage: EvaluationStage): CompiledRuleSet {}
  
  // Validate compilation
  validateCompilation(executable: RuleExecutable): void {}
}
```

### 4.2 Compilation Strategy

Rules are compiled to:

1. **Deterministic Logic:** Pure functions (no side effects, no randomness)
2. **Async-Safe:** Can handle async evidence lookups
3. **Serializable:** Can be sent over network, stored, replayed
4. **Introspectable:** Can be inspected for audit purposes
5. **Versionable:** Version tagged with rule version

---

## 05. RULE EXECUTOR

### 5.1 Rule Executor

```typescript
export class RuleExecutor {
  // Execute a single rule against evidence
  async executeRule(
    rule: Rule,
    evidence: Evidence[],
    context: ExecutionContext
  ): Promise<RuleResult> {}
  
  // Execute all rules for a stage in sequence
  async executeStage(
    stage: EvaluationStage,
    evidence: Evidence[],
    context: ExecutionContext
  ): Promise<RuleResult[]> {}
  
  // Execute with dependency resolution
  async executeWithDependencies(
    rule: Rule,
    evidence: Evidence[],
    context: ExecutionContext
  ): Promise<RuleResult[]> {}
}

export interface ExecutionContext {
  evaluation_id: string;
  tender_id: string;
  bid_id: string;
  bidder_id: string;
  executed_by: string;
  execution_timestamp: Date;
  tender_version: string;
}
```

### 5.2 Execution Flow

```
RuleExecutor.executeStage(stage)
  ↓
1. Get all rules for stage (in sequence order)
  ↓
2. For each rule:
  ├─ Check applicability (temporal, prerequisites)
  ├─ Resolve dependencies (ensure prerequisites executed)
  ├─ Validate evidence against input_schema
  ├─ Execute compiled logic
  ├─ Validate result against output_schema
  ├─ Create RuleResult with evidence references
  ├─ Record in audit trail
  └─ Return result
  ↓
3. Return all results
```

---

## 06. LEGAL FRAMEWORK

### 6.1 PPADA 2015 Sections

Key sections relevant to procurement evaluation:

| Section | Topic | Implementation |
|---------|-------|-----------------|
| 71(1) | Eligibility/Qualification | `PRE-*` rules |
| 71(2) | Tender Security | `PRE-*` rules |
| 74 | Preliminary Evaluation | `PRELIMINARY` stage |
| 101-115 | Evaluation Criteria | `TECHNICAL` rules |
| 116-125 | Financial Evaluation | `FINANCIAL` rules |
| 157 | Preference Schemes | `RESPONSIVENESS` rules |

### 6.2 PPADR 2020 Regulations

Key regulations:

| Regulation | Topic | Implementation |
|------------|-------|-----------------|
| 101 | Financial Capacity | `FINANCIAL-CAPACITY` rule |
| 102 | Bid Submission | `PRELIMINARY` rules |
| 103 | Bid Evaluation | `TECHNICAL` rules |

### 6.3 Legal Framework Storage

```sql
-- PPADA 2015 sections
INSERT INTO legal_instruments VALUES
  ('LEG-PPADA-2015', 'PPADA_2015', 'Public Procurement and Asset Disposal Act 2015', 
   '2015-12-18', NULL, 'Primary procurement law of Kenya', '[full text]');

-- PPADR 2020 regulations
INSERT INTO legal_instruments VALUES
  ('LEG-PPADR-2020', 'PPADR_2020', 'Public Procurement and Asset Disposal Regulations 2020',
   '2020-04-22', NULL, 'Implementing regulations for PPADA 2015', '[full text]');
```

---

## 07. INITIAL RULE MIGRATIONS

### 7.1 Hardcoded Rules to Migrate

From `backend/evaluation/rule-engine.ts`:

1. **RULE_TAX_COMPLIANCE** → `PRE-02-TAX-COMPLIANCE` (PPADA 71(1)(b))
2. **RULE_BUSINESS_REG** → `PRE-01-BUSINESS-REGISTRATION` (PPADA 71(1)(a))
3. **RULE_BANK_CAPACITY** → `FIN-01-FINANCIAL-CAPACITY` (PPADR 101)
4. **RULE_AGPO_PREFERENCE** → `RES-01-AGPO-PREFERENCE` (PPADA 157)
5. **RULE_LITIGATION_HISTORY** → `PRE-03-LITIGATION-HISTORY` (Tender ITB 4.5)

### 7.2 New Rules to Create

1. **TEMPORAL RULES:**
   - `TEMP-01-CERTIFICATE-EXPIRY` - Certificate expiry validation
   - `TEMP-02-TENDER-SECURITY-EXPIRY` - Tender security validity
   - `TEMP-03-LICENSE-VALIDITY` - Professional license validity

2. **TECHNICAL RULES:**
   - `TECH-01-EQUIPMENT-CAPACITY` - Equipment sufficiency
   - `TECH-02-PERSONNEL-QUALIFICATION` - Personnel experience
   - `TECH-03-WORKPLAN-ADEQUACY` - Workplan assessment

3. **FINANCIAL RULES:**
   - `FIN-02-PRICE-EXTRACTION` - Deterministic price extraction
   - `FIN-03-ARITHMETIC-VALIDATION` - Price arithmetic check
   - `FIN-04-VAT-VALIDATION` - VAT calculation check

---

## 08. TESTING STRATEGY

### 8.1 Unit Tests

- [ ] Test each rule category
- [ ] Test rule schema validation
- [ ] Test rule compilation
- [ ] Test deterministic execution
- [ ] Test dependency resolution
- [ ] Test temporal applicability
- [ ] Test error conditions

### 8.2 Integration Tests

- [ ] Test rule migration from old system
- [ ] Test stage execution with multiple rules
- [ ] Test rule version history
- [ ] Test replay (same input → same output)

### 8.3 Adversarial Tests

- [ ] Missing evidence handling
- [ ] Invalid evidence schema
- [ ] Circular dependencies
- [ ] Future-dated rules
- [ ] Expired rules

---

## 09. DATABASE INITIALIZATION

Phase 01 must create all tables and bootstrap initial data:

1. **Legal Instruments:** PPADA 2015, PPADR 2020
2. **Legal Sections:** All relevant sections
3. **Initial Rules:** Migrated hardcoded rules + new temporal rules
4. **Rule Versions:** Version 1.0.0 for all initial rules

---

## 10. DELIVERABLES CHECKLIST

- [ ] `backend/evaluation/rule-schema.ts` - Rule types and interfaces
- [ ] `backend/evaluation/rule-registry.ts` - Rule storage and retrieval
- [ ] `backend/evaluation/rule-compiler.ts` - Rule compilation
- [ ] `backend/evaluation/rule-executor.ts` - Rule execution
- [ ] `backend/evaluation/legal-framework.ts` - PPADA/PPADR definitions
- [ ] Database migration script (create all tables)
- [ ] Bootstrap data (legal instruments, sections, initial rules)
- [ ] Unit tests (20+ tests covering all components)
- [ ] Integration test (complete rule workflow)
- [ ] `docs/LEGAL_RULES_MATRIX.md` - Rule-to-legal mapping
- [ ] Rule examples (3+ sample rules)

---

## 11. COMPLETION CRITERIA

- ✅ Code compiles without errors
- ✅ All types defined and typed correctly
- ✅ 3+ hardcoded rules migrated to new schema
- ✅ Temporal rule type defined (needed by Phase 05)
- ✅ Unit tests pass (20+ tests)
- ✅ Integration test passes (rule compilation → execution)
- ✅ No hardcoded rule logic in React/frontend
- ✅ Rule versioning implemented and tested
- ✅ Legal citations machine-readable and queryable
- ✅ MD documentation complete and accurate
- ✅ Runtime verification: One rule executes deterministically
- ✅ All database tables created with correct schema
- ✅ No production warnings or type errors

---

## 12. NEXT PHASE DEPENDENCIES

Phase 02 (Document Engine) can begin once:
- ✅ Rule Registry API stable
- ✅ Rule Executor working
- ✅ Legal Framework defined

Phase 03 (Requirement Compiler) can begin once:
- ✅ Rule Registry operational
- ✅ Rule schema finalized

Phase 04 (Evaluation Engine) can begin once:
- ✅ Phases 01, 02, 03 complete
- ✅ Rule Executor tested and stable

---

**END OF PHASE-01 DESIGN DOCUMENT**

**Next Step:** Begin implementation with rule-schema.ts
