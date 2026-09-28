# PHASE 01: QUICK START GUIDE

**For**: Developers implementing Phase 02+  
**Goal**: Understand how to use Phase 01 components

---

## QUICK START: 5-MINUTE SETUP

### 1. Initialize Rule Registry

```typescript
import { DatabaseCore } from './backend/database/db-core';
import { RuleRegistry } from './backend/evaluation/rule-registry';
import { RuleOntologyMigration } from './backend/database/migration-001-phase-01-rule-ontology';

const db = DatabaseCore.getInstance();
await db.connect();

// Create tables and seed legal framework (run once at startup)
await RuleOntologyMigration.create(db);
await RuleOntologyMigration.seedLegalFramework(db);

// Initialize rule registry
const registry = RuleRegistry.getInstance();
await registry.initialize(db);
```

### 2. Register a Rule

```typescript
import { Rule } from './backend/evaluation/rule-schema';
import { RuleCompiler } from './backend/evaluation/rule-compiler';

const newRule: Rule = {
  rule_id: 'PRE-01-ELIGIBILITY',
  rule_version: '1.0.0',
  rule_sequence: 1,
  rule_category: 'PRELIMINARY',
  evaluation_stage: 'PRELIMINARY',
  legal_instrument: 'PPADA_2015',
  section_or_regulation: 'PPADA-71-1',
  tender_clause: null,
  legal_text: 'A person shall not participate in a procurement proceeding unless...',
  effective_from: new Date('2015-12-18'),
  effective_to: null,
  severity: 'MANDATORY',
  failure_behavior: 'NON_RESPONSIVE',
  review_behavior: 'AUTOMATIC',
  dependencies: [],
  prerequisites: [],
  input_schema: {},
  output_schema: {},
  evidence_requirements: [
    {
      evidence_type: 'legal_capacity_certificate',
      mandatory: true,
      min_confidence: 0.8,
      description: 'Proof of legal capacity to enter contracts'
    }
  ],
  logic: RuleCompiler.compile({
    rule_id: 'PRE-01-ELIGIBILITY',
    rule_version: '1.0.0',
    // ... other properties
  } as any),
  test_reference: [],
  description: 'Verify bidder legal capacity per PPADA 2015 Section 71(1)',
  created_at: new Date(),
  created_by: 'procurement-admin',
  last_modified_at: null,
  last_modified_by: null
};

// Register rule
await registry.registerRule(newRule, db, 'procurement-admin');
```

### 3. Execute a Rule

```typescript
import { RuleExecutor } from './backend/evaluation/rule-executor';
import { ExecutionContext, EvidenceReference } from './backend/evaluation/rule-schema';

const executor = new RuleExecutor(db);

// Prepare execution context
const context: ExecutionContext = {
  evaluation_id: 'eval-2026-09-001',
  tender_id: 'tender-2026-09-001',
  tender_version: '1.0',
  bid_id: 'bid-2026-09-001-acme',
  bidder_id: 'bidder-acme-001',
  bidder_name: 'ACME Corporation',
  executed_by: 'evaluation-officer-001',
  execution_timestamp: new Date(),
  applicable_date: new Date('2026-09-15')
};

// Prepare evidence
const evidence = new Map<string, EvidenceReference[]>([
  ['legal_capacity_certificate', [
    {
      evidence_id: 'evid-001',
      document_id: 'doc-legal-capacity-acme',
      page: 1,
      section: 'Authorization Statement',
      extracted_value: 'AUTHORIZED',
      confidence: 0.95
    }
  ]]
]);

// Execute rule
const result = await executor.executeRule(
  registry.getRule('PRE-01-ELIGIBILITY')!,
  context,
  evidence
);

console.log('Rule result:', {
  rule_id: result.rule_id,
  status: result.status,
  evidence_used: result.evidence_used.length,
  audit_signature: result.audit_signature
});
```

### 4. Query Rules

```typescript
// Get all rules for PRELIMINARY stage
const preliminaryRules = registry.getStageRules('PRELIMINARY');
console.log(`Found ${preliminaryRules.length} preliminary evaluation rules`);

// Get all rules by category
const responsibilityRules = registry.getCategoryRules('RESPONSIVENESS');

// Query with filters
const applicableRules = registry.queryRules({
  stage: 'PRELIMINARY',
  category: 'PRELIMINARY',
  as_of_date: new Date('2026-09-15'),
  include_expired: false
});

// Get rule dependencies
const dependencies = registry.getDependencies('PRE-01-ELIGIBILITY');
console.log(`Rule depends on: ${dependencies.map(r => r.rule_id).join(', ')}`);
```

### 5. Execute Stage (All Rules)

```typescript
// Execute all rules for a stage
const stageResults = await executor.executeStage(
  'PRELIMINARY',
  context,
  evidence
);

console.log(`Executed ${stageResults.length} preliminary rules`);
stageResults.forEach(result => {
  console.log(`${result.rule_id}: ${result.status}`);
});
```

---

## COMMON PATTERNS

### Pattern 1: Full Evaluation Pipeline

```typescript
const stages: EvaluationStage[] = [
  'INTAKE',
  'CLASSIFICATION',
  'OCR',
  'METADATA',
  'LEGAL_VALIDATION',
  'PRELIMINARY',
  'RESPONSIVENESS',
  'TECHNICAL',
  'FINANCIAL',
  'DUE_DILIGENCE',
  'CROSS_VALIDATION',
  'RECOMMENDATION',
  'OFFICER_APPROVAL',
  'POST_QUALIFICATION',
  'AWARD'
];

for (const stage of stages) {
  const results = await executor.executeStage(stage, context, evidence);
  
  // Check for failures
  const failures = results.filter(r => r.status === 'FAIL');
  if (failures.length > 0 && failures.some(r => r.status === 'FAIL')) {
    console.log(`Stage ${stage} failed - stopping evaluation`);
    break;
  }
  
  console.log(`Stage ${stage} passed with ${results.length} rules executed`);
}
```

### Pattern 2: Verify Rule Determinism (Replay)

```typescript
// Original execution
const originalResult = await executor.executeRule(rule, context, evidence);

// Later, replay to verify
const replayedResult = await executor.replayExecution(
  originalResult,
  context,
  evidence
);

// Verify determinism
if (replayedResult.status === originalResult.status &&
    JSON.stringify(replayedResult.output) === JSON.stringify(originalResult.output)) {
  console.log('✓ Rule execution is deterministic');
} else {
  console.error('✗ Non-deterministic execution detected!');
  console.error('Original:', originalResult);
  console.error('Replayed:', replayedResult);
}
```

### Pattern 3: Query Audit Trail

```typescript
// Query executions from database
const executions = await db.all(`
  SELECT * FROM rule_executions
  WHERE evaluation_id = ? AND status = 'FAIL'
  ORDER BY executed_at DESC
`, ['eval-2026-09-001']);

// Trace back to legal authority
for (const execution of executions) {
  const rule = registry.getRule(execution.rule_id);
  const legalSection = getLegalSection(rule.section_or_regulation);
  
  console.log(`Rule ${execution.rule_id} failed`);
  console.log(`  Legal: ${legalSection.section_id} - ${legalSection.heading}`);
  console.log(`  Evidence: ${execution.evidence_used}`);
  console.log(`  Signature: ${execution.audit_signature}`);
}
```

### Pattern 4: Validate Evidence Requirements

```typescript
const rule = registry.getRule('PRE-01-ELIGIBILITY');

for (const requirement of rule.evidence_requirements) {
  const evidence = evidenceMap.get(requirement.evidence_type);
  
  if (requirement.mandatory && !evidence) {
    console.error(`Missing required evidence: ${requirement.evidence_type}`);
  } else if (evidence && evidence.some(e => e.confidence < requirement.min_confidence)) {
    console.warn(`Low confidence evidence for ${requirement.evidence_type}`);
  }
}
```

---

## API REFERENCE

### RuleRegistry

```typescript
// Initialize (run once at startup)
await registry.initialize(db);

// Register/Update rule
await registry.registerRule(rule, db, 'user-id');

// Retrieve rule
const rule = registry.getRule('RULE-ID', 'version');

// Query rules
const rules = registry.getStageRules('PRELIMINARY');
const rules = registry.getCategoryRules('RESPONSIVENESS');
const rules = registry.queryRules({ stage: '...', category: '...' });

// Dependency resolution
const deps = registry.getDependencies('RULE-ID');
const graph = registry.getDependencyGraph('RULE-ID');

// Check applicability
const applicable = registry.isRuleApplicable('RULE-ID', new Date());

// Validate
const validation = registry.validateRule(partialRule);

// Statistics
const stats = registry.getStatistics();
```

### RuleCompiler

```typescript
// Compile single rule
const executable = RuleCompiler.compile(rule);

// Compile all rules for stage
const executables = RuleCompiler.compileStage(rules, 'PRELIMINARY');

// Validate compiled code
const result = RuleCompiler.validateExecutable(executable);

// Verify integrity
const valid = RuleCompiler.verifyIntegrity(executable, originalHash);
```

### RuleExecutor

```typescript
// Execute single rule
const result = await executor.executeRule(rule, context, evidence);

// Execute all rules for stage
const results = await executor.executeStage(stage, context, evidence);

// Execute with full dependency resolution
const resultMap = await executor.executeWithDependencies(rules, context, evidence);

// Replay execution for verification
const replayedResult = await executor.replayExecution(originalResult, context, evidence);
```

---

## DATABASE QUERIES

### Query Active Rules

```sql
-- Get all active rules for a stage
SELECT * FROM rules
WHERE evaluation_stage = 'PRELIMINARY'
  AND (effective_to IS NULL OR effective_to > datetime('now'))
ORDER BY rule_sequence;
```

### Query Execution History

```sql
-- Get all executions for an evaluation
SELECT * FROM rule_executions
WHERE evaluation_id = 'eval-123'
ORDER BY executed_at DESC;

-- Get failures for an evaluation
SELECT * FROM rule_executions
WHERE evaluation_id = 'eval-123' AND status = 'FAIL';

-- Get execution stats
SELECT rule_id, COUNT(*) as total, 
       SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as passed,
       AVG(CAST(executed_at AS REAL)) as avg_time_ms
FROM rule_executions
WHERE executed_at > datetime('now', '-1 day')
GROUP BY rule_id;
```

### Query Legal Framework

```sql
-- Find legal section
SELECT * FROM legal_sections WHERE section_id = 'PPADA-71-1';

-- Get all sections for an instrument
SELECT * FROM legal_sections WHERE instrument_code = 'PPADA_2015';

-- Find rules by legal basis
SELECT r.rule_id, r.description, l.heading
FROM rules r
JOIN legal_sections l ON r.section_or_regulation = l.section_id
WHERE l.instrument_code = 'PPADA_2015';
```

---

## TROUBLESHOOTING

### Issue: Rule not found

```typescript
const rule = registry.getRule('RULE-ID');
if (!rule) {
  console.error('Rule not found. Available rules:');
  const stats = registry.getStatistics();
  console.error(JSON.stringify(stats, null, 2));
}
```

### Issue: Non-deterministic execution

```typescript
// Check if rule version changed
const v1 = await db.get('SELECT * FROM rules WHERE rule_id = ?', ['RULE-ID']);
const v2 = await db.get('SELECT * FROM rules WHERE rule_id = ?', ['RULE-ID']);

if (v1.rule_version !== v2.rule_version) {
  console.error('Rule was updated between executions');
}

// Check if evidence changed
const evid1 = evidence.get('key');
const evid2 = newEvidence.get('key');
if (JSON.stringify(evid1) !== JSON.stringify(evid2)) {
  console.error('Evidence was modified between executions');
}
```

### Issue: Missing evidence requirements

```typescript
const rule = registry.getRule('RULE-ID');
for (const req of rule.evidence_requirements) {
  const evid = evidence.get(req.evidence_type);
  if (req.mandatory && !evid) {
    console.error(`Missing mandatory evidence: ${req.evidence_type}`);
  }
}
```

---

## TESTING

Run unit tests:

```bash
npm test -- backend/evaluation/rule-ontology.test.ts
```

Run specific test suite:

```bash
npm test -- --grep "Rule Registry"
```

Run with coverage:

```bash
npm test -- --coverage backend/evaluation/
```

---

## NEXT STEPS

1. **Phase 02**: Evidence Model - implement evidence collection and validation
2. **Phase 03**: Temporal Engine - date validation, license expiry, certificate validity
3. **Phase 04+**: Remaining evaluation stages

Each phase builds on Phase 01's rule execution infrastructure.

---

## SUPPORT

- Architecture: See [PHASE-01-IMPLEMENTATION-COMPLETE.md](file:///C:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/docs/tender-evaluation/PHASE-01-IMPLEMENTATION-COMPLETE.md)
- Design: See [PHASE-01-EETF-RULE-ONTOLOGY.md](file:///C:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/docs/tender-evaluation/PHASE-01-EETF-RULE-ONTOLOGY.md)
- Types: See [rule-schema.ts](file:///C:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/rule-schema.ts)

---

*Phase 01 Quick Start Guide*  
*Last Updated: 2026-08-30*
