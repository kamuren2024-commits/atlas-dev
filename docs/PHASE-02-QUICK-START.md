# PHASE 02 QUICK START GUIDE

**Target Audience**: Developers implementing Phase 03+ or working with evidence  
**Time to Understand**: 5-10 minutes  
**Difficulty**: Intermediate  

---

## TL;DR - The 60-Second Version

Phase 02 provides **immutable evidence atoms** extracted from documents.

```typescript
// 1. Extract evidence from document
const extractor = EvidenceExtractor.getInstance();
const result = await extractor.extract(
  { document_id, document_type, tender_id, bidder_id },
  documentText
);

// 2. Store evidence
const repo = EvidenceRepository.getInstance();
result.evidence_atoms.forEach(atom => repo.createEvidence(atom));

// 3. Query evidence
const atoms = repo.queryEvidence({ tender_id, bidder_id });

// 4. Use in your logic
const stats = repo.getStatistics(tender_id);
console.log(`Quality: ${stats.average_confidence.toFixed(2)}`);
```

---

## Key Concepts (2 minutes)

### Evidence Atom
A single fact extracted from a document.
- **Example**: Company name = "ACME Corp", Confidence = 0.95
- **Immutable**: Can't change after creation
- **Audited**: SHA256 hash proves no tampering

### Confidence Score (0-1)
How much to trust this evidence.
- **0.85+**: VERIFIED (use directly)
- **0.60-0.85**: REQUIRES_REVIEW (needs human check)
- **<0.60**: Invalid or unreliable

### Validation Status
Current state of evidence.
- **VERIFIED**: High confidence, ready to use
- **REQUIRES_REVIEW**: Needs human validation
- **INVALID**: Low confidence or failed validation
- **PENDING**: Just created, not yet validated

### Relationships
Links between evidence atoms.
- SAME_ENTITY (company appears in multiple documents)
- SUPPORTING_EVIDENCE (confirms another piece)
- CONTRADICTING (conflicts with another piece)

### Conflicts
Detected problems.
- CONTRADICTING_VALUES (same field, different values)
- EXPIRED_DOCUMENT (certificate expired)
- MISSING_REQUIRED_FIELD (required data not provided)

---

## 5-Minute Setup

### 1. Initialize Database

```typescript
import Database from 'better-sqlite3';
import { Phase02EvidenceMigration } from './backend/database/migration-002-phase-02-evidence';

const db = new Database('app.db');

// Create Phase 02 tables
Phase02EvidenceMigration.create(db);
Phase02EvidenceMigration.seed(db);  // No-op for Phase 02
console.log(Phase02EvidenceMigration.verify(db) ? 'OK' : 'FAILED');
```

### 2. Initialize Singletons

```typescript
import { EvidenceRepository } from './backend/evaluation/evidence-repository';
import { EvidenceExtractor } from './backend/evaluation/evidence-extractor';

// Initialize repository (needs database)
EvidenceRepository.initialize(db);

// Get extractor (already a singleton)
const extractor = EvidenceExtractor.getInstance();
```

### 3. Extract Evidence

```typescript
const documentText = `
  Company Name: ACME Corporation
  Tax ID: 12-3456789
  Certificate Expiry: 2027-06-15
`;

const result = await extractor.extract(
  {
    document_id: 'DOC-001',
    document_type: 'BID_SUBMISSION',
    tender_id: 'TEN-001',
    bidder_id: 'BID-001',
    target_evidence_types: ['COMPANY_NAME', 'TAX_ID', 'CERTIFICATE_EXPIRY'],
    require_consensus: true,        // Use multiple extractors
    min_confidence: 0.80            // Only keep high-confidence results
  },
  documentText,
  new Date('2026-01-15')            // Document date
);

console.log(`Extracted: ${result.evidence_atoms.length}`);
console.log(`Status: ${result.status}`);  // SUCCESS, PARTIAL, or FAILED
console.log(`Errors: ${result.errors}`);
```

### 4. Store Evidence

```typescript
const repo = EvidenceRepository.getInstance();

// Store evidence atoms
for (const atom of result.evidence_atoms) {
  repo.createEvidence(atom);
}

// Store detected conflicts
for (const conflict of result.conflicts) {
  repo.createConflict(conflict);
}

// Store relationships
for (const rel of result.relationships) {
  repo.createRelationship(rel);
}
```

---

## Common Tasks

### Task 1: Get Evidence for Bidder

```typescript
const atoms = repo.queryEvidence({
  tender_id: 'TEN-001',
  bidder_id: 'BID-001'
});

atoms.forEach(atom => {
  console.log(`${atom.evidence_type}: ${atom.extracted_value} (${(atom.overall_confidence*100).toFixed(0)}%)`);
});
```

### Task 2: Check Quality

```typescript
const stats = repo.getStatistics('TEN-001');

console.log(`Total evidence: ${stats.total_evidence}`);
console.log(`Verified: ${stats.verified}`);
console.log(`Requires review: ${stats.requires_review}`);
console.log(`Invalid: ${stats.invalid}`);
console.log(`Average confidence: ${(stats.average_confidence*100).toFixed(1)}%`);
console.log(`Conflicts: ${stats.conflicts}`);
```

### Task 3: Validate Evidence

```typescript
import { EvidenceValidator } from './backend/evaluation/evidence-validator';

const atom = repo.getEvidenceById('EVI-001');

const validation = EvidenceValidator.validateEvidenceAtom(atom, {
  requireMinimumConfidence: 0.85,
  enforceTemporalValidity: true,
  strictFormatValidation: true
});

if (!validation.valid) {
  console.log(EvidenceValidator.generateReport(validation, atom));
}
```

### Task 4: Check for Issues

```typescript
const conflicts = repo.getUnresolvedConflicts('TEN-001');

for (const conflict of conflicts) {
  console.log(`[${conflict.severity}] ${conflict.conflict_type}`);
  console.log(`  ${conflict.description}`);
  
  repo.resolveConflict(conflict.conflict_id, 'Reviewed by system');
}
```

### Task 5: Check Bidder Completeness

```typescript
import { EvidenceValidator } from './backend/evaluation/evidence-validator';

const atoms = repo.queryEvidence({ tender_id: 'TEN-001', bidder_id: 'BID-001' });

const completeness = EvidenceValidator.validateCompletenessForStage(
  atoms,
  'TECHNICAL',  // or 'FINANCIAL', 'COMMERCIAL'
  {
    COMPANY_NAME: { required: true, types: ['TEXT'] },
    PROJECT_EXPERIENCE: { required: true, types: ['TEXT'] },
    EQUIPMENT_LIST: { required: true, types: ['TABLE'] }
  }
);

if (completeness.complete) {
  console.log('✅ All required evidence provided');
} else {
  console.log('❌ Missing:', completeness.missing);
  console.log('💡 Optional:', completeness.optional);
}
```

### Task 6: Export for Audit

```typescript
const audit = repo.exportForAudit('TEN-001', 'BID-001');

console.log(`Evidence atoms: ${audit.evidence.length}`);
console.log(`Relationships: ${audit.relationships.length}`);
console.log(`Conflicts: ${audit.conflicts.length}`);
console.log(`Export date: ${audit.export_date}`);

// Persist for compliance
const fs = require('fs');
fs.writeFileSync(
  `audit-${Date.now()}.json`,
  JSON.stringify(audit, null, 2)
);
```

### Task 7: Verify Integrity

```typescript
const atom = repo.getEvidenceById('EVI-001');

const valid = repo.verifyIntegrity(atom.evidence_id, atom.hash);
console.log(valid ? '✅ Not tampered' : '❌ Tampering detected!');
```

### Task 8: Check Certificate Expiry

```typescript
import { TemporalValidator } from './backend/evaluation/temporal-validator';

const atoms = repo.queryEvidence({ tender_id: 'TEN-001' });

const needsRenewal = TemporalValidator.detectRenewalNeeds(atoms, 60);  // 60 days warning
for (const cert of needsRenewal) {
  console.log(`⚠️  ${cert.evidence_type} expires in ${cert.days_until_expiry} days`);
}

const report = TemporalValidator.generateTimeline(atoms);
console.log(report);  // ASCII timeline
```

---

## API Reference

### EvidenceExtractor

```typescript
async extract(request, documentText, documentDate?): EvidenceExtractionResult

request = {
  document_id: string,
  document_type: string,           // BID_SUBMISSION, FINANCIAL_STATEMENTS, etc.
  tender_id: string,
  bidder_id?: string,
  target_evidence_types?: string[],  // ['COMPANY_NAME', 'TAX_ID']
  preferred_extraction_method?: string,
  require_consensus?: boolean,      // true = multi-extractor
  min_confidence?: number           // 0.85 = only high-confidence
}

result = {
  request_id: string,
  document_id: string,
  tender_id: string,
  evidence_atoms: EvidenceAtom[],
  conflicts: EvidenceConflict[],
  relationships: EvidenceRelationship[],
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED',
  errors: string[],
  execution_time_ms: number,
  total_extracted: number,
  total_failed: number
}
```

### EvidenceRepository

```typescript
// CRUD
createEvidence(atom: EvidenceAtom): EvidenceAtom
getEvidenceById(id: string): EvidenceAtom | null
queryEvidence(query: EvidenceQuery): EvidenceAtom[]
deleteEvidence(id: string): boolean  // throws if immutable

// Relationships
createRelationship(rel: EvidenceRelationship): EvidenceRelationship
getRelationships(evidenceId: string): EvidenceRelationship[]

// Conflicts
createConflict(conflict: EvidenceConflict): EvidenceConflict
getConflicts(evidenceId: string): EvidenceConflict[]
getUnresolvedConflicts(tenderId: string): EvidenceConflict[]
resolveConflict(conflictId: string, notes?: string): void

// Analytics
getStatistics(tenderId: string): { ... }
getBidderSummary(tenderId, bidderId): { ... }
verifyIntegrity(evidenceId, expectedHash): boolean
exportForAudit(tenderId, bidderId?): { evidence, relationships, conflicts, export_date }
```

### EvidenceValidator

```typescript
validateEvidenceAtom(atom, options?): { valid, status, errors, warnings }
detectConflict(evidence1, evidence2): EvidenceConflict | null
validateCollection(atoms, requiredTypes?): { valid, errors, conflicts }
validateCompletenessForStage(atoms, stage, schema?): { complete, missing, optional }
generateReport(result, evidence?): string
```

### ConfidenceScorer

```typescript
calculateOverallConfidence(extraction, ocr?, consensus?, formatValid?, weights?): ConfidenceBreakdown
determineValidationStatus(confidence, formatValid, errors?): EvidenceValidationStatus
scoreOCRQuality(accuracy, layoutConfidence?): number
scoreExtractionConfidence(modelConfidence, fieldPresence?, type?, value?): number
scoreConsensusConfidence(extractorResults): number
scoreFormatValidity(value, type, rules?): { valid, errors }
buildConfidenceQualityReport(atoms): ConfidenceQualityReport
```

### TemporalValidator

```typescript
validateCertificateExpiry(expiryDate, documentDate, minDaysValid?): TemporalValidity
validateDocumentDate(documentDate, maxAgeDays?, referenceDate?): TemporalValidity
validateTemporalOrder(atoms, requirementDate?): { valid, issues, timeline }
validateSubmissionTiming(submissionDate, atoms, deadline): { valid, ontime, issues }
detectAnomalies(atoms): string[]
calculateFreshness(documentDate, type?, referenceDate?): { freshness_score, interpretation }
detectRenewalNeeds(atoms, warningDays?): Array<{ evidence_id, evidence_type, days_until_expiry, renewal_suggested }>
generateTimeline(atoms): string
generateTemporalReport(atoms): TemporalConsistencyReport
```

---

## Debugging

### Issue: Low Confidence Scores

```typescript
const atom = repo.getEvidenceById('EVI-001');
console.log(`Extraction confidence: ${atom.extraction_confidence}`);
console.log(`OCR confidence: ${atom.ocr_confidence || 'N/A'}`);
console.log(`Consensus confidence: ${atom.consensus_confidence || 'N/A'}`);
console.log(`Format valid: ${atom.format_valid}`);
console.log(`Overall: ${atom.overall_confidence}`);
console.log(`Source: ${atom.source_extractor} via ${atom.extraction_method}`);
```

### Issue: Conflicts Detected

```typescript
const conflicts = repo.getConflicts('EVI-001');
for (const c of conflicts) {
  console.log(`Type: ${c.conflict_type}`);
  console.log(`Description: ${c.description}`);
  console.log(`Severity: ${c.severity}`);
  console.log(`Review status: ${c.review_status}`);
}
```

### Issue: Missing Evidence

```typescript
const completeness = EvidenceValidator.validateCompletenessForStage(
  repo.queryEvidence({ tender_id, bidder_id }),
  'TECHNICAL'
);
console.log('Missing:', completeness.missing);
console.log('Optional:', completeness.optional);
```

### Issue: Expired Certificates

```typescript
const atoms = repo.queryEvidence({ tender_id, expired: true });
for (const atom of atoms) {
  if (atom.effective_to && atom.effective_to < new Date()) {
    console.log(`${atom.evidence_type} expired: ${atom.effective_to}`);
  }
}
```

---

## Testing Your Integration

```typescript
import { Phase02EvidenceMigration } from './backend/database/migration-002-phase-02-evidence';

// Use in-memory DB for testing
const testDb = new Database(':memory:');
Phase02EvidenceMigration.create(testDb);

const testRepo = EvidenceRepository.initialize(testDb);

// Now test your code
const atom = {
  evidence_id: 'TEST-001',
  evidence_type: 'COMPANY_NAME',
  // ... other fields
};

testRepo.createEvidence(atom);
const retrieved = testRepo.getEvidenceById('TEST-001');
console.assert(retrieved !== null, 'Retrieval failed');
```

---

## Performance Tips

1. **Use consensus only for high-risk fields** (COMPANY_NAME, TAX_ID, CERTIFICATE_EXPIRY)
2. **Index queries by tender_id** first (most selective)
3. **Export/audit only when needed** (full scan)
4. **Batch evidence creation** if processing many documents
5. **Use queryEvidence() with filters** instead of loading all evidence

---

## Next: Using Evidence in Phase 03+

Phase 03 (Temporal Engine) will:
- Use `effective_from` / `effective_to` for time windows
- Reference evidence by `evidence_id`
- Check confidence for decision gates
- Track which evidence each decision used

Phase 04+ (Evaluation Engines) will:
- Reference evidence in rule evaluation
- Use confidence scores
- Track evidence in audit trail

---

## Where to Get Help

- **Architecture**: See PHASE-02-IMPLEMENTATION-COMPLETE.md
- **API Details**: See JSDoc in each TypeScript file
- **Examples**: See evidence.test.ts for comprehensive test examples
- **Database Schema**: See migration-002-phase-02-evidence.ts

---

## Key Takeaways

✅ Evidence is **immutable** — immutability enforced by database and repository  
✅ Evidence is **audited** — SHA256 hash, created_at, created_by, unique evidence_id  
✅ Evidence has **confidence scores** — combined signal from multiple sources  
✅ Evidence is **validatable** — format, temporal, collection-level validation  
✅ Evidence is **queryable** — indexed by tender, bidder, type, status, confidence  
✅ Evidence is **linkable** — relationships track connections between atoms  
✅ Conflicts are **detectable** — contradictions, duplicates, expiry  

**Ready to integrate Phase 02?** → See 5-Minute Setup above 🚀
