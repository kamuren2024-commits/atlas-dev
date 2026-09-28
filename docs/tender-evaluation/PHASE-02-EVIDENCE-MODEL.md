# PHASE 02: EETF EVIDENCE MODEL
## Document-to-Evidence Pipeline with Confidence Scoring

**Date:** 2026-08-31  
**Status:** DESIGN & IMPLEMENTATION  
**Duration:** 5-7 days (estimated)  
**Blocking:** NO - Can run parallel after Phase 01 foundation  
**Unblocks:** Phases 03, 04, 05 (Temporal, Evaluation, Graph)

---

## PHASE OBJECTIVE

Transform raw documents into **evidence atoms** with:
- ✅ Source traceability (document ID, page, section)
- ✅ Confidence scoring (0-1 scale)
- ✅ Structured extraction (dates, amounts, names, tables)
- ✅ Evidence relationships (same bidder across documents)
- ✅ Validation rules (required fields, format checks)
- ✅ Temporal metadata (document date, effective date, expiry)

**Input:** Raw tender documents (PDF, Word, images)  
**Output:** Structured evidence atoms ready for rule evaluation

---

## EVIDENCE MODEL ARCHITECTURE

```
Document Input
    ↓
[Document Classifier]
    ├─→ TENDER_DOCUMENT
    ├─→ BID_SUBMISSION
    ├─→ FINANCIAL_STATEMENTS
    ├─→ CERTIFICATE
    ├─→ etc.
    ↓
[Content Extractor]
    ├─→ OCR (if image/scan)
    ├─→ Text extraction (if PDF)
    ├─→ Layout analysis
    ├─→ Section segmentation
    ↓
[Field Extractor]
    ├─→ Primary extractor (AI-based)
    ├─→ Secondary extractor (fallback)
    ├─→ Consensus engine (detect conflicts)
    ├─→ Deterministic normalizer
    ↓
[Confidence Scorer]
    ├─→ OCR confidence
    ├─→ Model confidence
    ├─→ Extraction confidence
    ├─→ Consensus confidence
    ├─→ Format confidence
    ↓
[Evidence Validator]
    ├─→ Required fields check
    ├─→ Date validation
    ├─→ Amount validation
    ├─→ Cross-document consistency
    ├─→ Temporal rules
    ↓
[Evidence Atom Creation]
    ├─→ Create Evidence record
    ├─→ Store source references
    ├─→ Link to requirements
    ├─→ Store in evidence table
    ↓
Evidence Ready for Rule Evaluation
```

---

## EVIDENCE SCHEMA

### EvidenceAtom Interface

```typescript
export interface EvidenceAtom {
  // Identity
  evidence_id: string;              // Unique evidence ID
  evidence_type: string;            // 'COMPANY_NAME', 'REGISTRATION_DATE', etc.
  
  // Source
  document_id: string;              // Which document
  document_type: string;            // Document classification
  document_date: Date;              // Document creation date
  page_number?: number;             // Page number (if multi-page)
  section?: string;                 // Named section (e.g., "Financial Summary")
  location_text?: string;           // "Line 5, Column 2"
  
  // Value
  extracted_value: string;          // Raw extracted value
  normalized_value: string;         // Standardized form
  data_type: 'TEXT' | 'DATE' | 'AMOUNT' | 'NUMBER' | 'ENTITY' | 'TABLE';
  
  // Confidence & Quality
  extraction_confidence: number;    // 0-1, AI model confidence
  ocr_confidence?: number;          // 0-1, if OCR was used
  consensus_confidence?: number;    // 0-1, if multiple extractors
  format_valid: boolean;            // Passes format validation
  overall_confidence: number;       // Composite 0-1 score
  
  // Validation Status
  validation_status: 'VERIFIED' | 'REQUIRES_REVIEW' | 'INVALID';
  validation_errors: string[];      // List of validation failures
  
  // Temporal
  effective_from: Date;             // When this evidence is valid
  effective_to?: Date;              // When it expires (null = no expiry)
  
  // Relationship
  bidder_id?: string;               // Which bidder submitted this
  tender_id: string;                // Which tender
  requirement_ids?: string[];       // Which requirements does this satisfy
  
  // Audit
  created_at: Date;
  created_by: string;
  hash: string;                     // SHA256 of content (immutable)
  immutable: boolean;               // Never updated after creation
}
```

### Confidence Scoring Algorithm

```
overall_confidence = weighted_average(
  extraction_confidence:     0.4,  // AI model quality
  ocr_confidence:           0.2,  // OCR quality (if applicable)
  consensus_confidence:     0.2,  // Agreement across extractors
  format_valid:            0.2,  // Passes format checks
)

If consensus_confidence < 0.6:
  validation_status = REQUIRES_REVIEW
  
If format_valid = FALSE:
  validation_status = REQUIRES_REVIEW
  
If all_validators_pass AND overall_confidence >= 0.8:
  validation_status = VERIFIED
```

---

## EVIDENCE TYPES

### Phase 02 Core Evidence Types

| Evidence Type | Data Type | Source | Validation | Temporal |
|---------------|-----------|--------|-----------|----------|
| COMPANY_NAME | TEXT | Firm Profile, Cert | Exact match across docs | Valid forever |
| REGISTRATION_NUMBER | TEXT | CR12, Cert | Format + registry check | Valid with cert |
| TAX_ID | TEXT | Tax Cert, Statements | Format check | Expiry date |
| BUSINESS_ADDRESS | TEXT | Firm Profile, Cert | Format check | Valid forever |
| AUTHORIZED_SIGNATORY | TEXT | POA, Signatures | Cross-reference | Valid with POA |
| BANK_ACCOUNT | TEXT | Bank Statement | Format check | Valid with statement |
| FINANCIAL_TURNOVER | AMOUNT | Statements, Invoices | Arithmetic check | Annual |
| COMPANY_AGE | TEXT | Cert, Statements | Date arithmetic | Dynamic |
| CERTIFICATE_EXPIRY | DATE | All certificates | Date format + future | Critical |
| SIGNATURE_PRESENT | BOOL | Documents | Visual detection | Document validity |
| DOCUMENT_DATE | DATE | Document metadata | Date parsing | Document validity |
| PROJECT_EXPERIENCE | TEXT | Experience Letters | Cross-reference | Historical |
| PAYMENT_HISTORY | TEXT | References | Verification | Recent |
| EQUIPMENT_LIST | TABLE | Technical submission | Parsing + verification | Current |
| PRICE_BREAKDOWN | TABLE | Price schedule | Arithmetic validation | Quoted |

---

## DATABASE SCHEMA

### Evidence Table

```sql
CREATE TABLE IF NOT EXISTS evidence (
  evidence_id TEXT PRIMARY KEY,
  evidence_type TEXT NOT NULL,
  
  -- Source
  document_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_date TEXT NOT NULL,
  page_number INTEGER,
  section TEXT,
  location_text TEXT,
  
  -- Value
  extracted_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  data_type TEXT NOT NULL,
  
  -- Confidence
  extraction_confidence REAL NOT NULL,
  ocr_confidence REAL,
  consensus_confidence REAL,
  format_valid INTEGER NOT NULL,
  overall_confidence REAL NOT NULL,
  
  -- Validation
  validation_status TEXT NOT NULL,
  validation_errors TEXT,
  
  -- Temporal
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  
  -- Relationship
  bidder_id TEXT,
  tender_id TEXT NOT NULL,
  requirement_ids TEXT,
  
  -- Audit
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  hash TEXT NOT NULL,
  immutable INTEGER DEFAULT 1,
  
  -- Metadata
  source_extractor TEXT,
  extraction_method TEXT,
  
  FOREIGN KEY(document_id) REFERENCES documents(document_id),
  FOREIGN KEY(bidder_id) REFERENCES bidders(bidder_id),
  FOREIGN KEY(tender_id) REFERENCES tenders(tender_id)
);

CREATE INDEX idx_evidence_doc ON evidence(document_id);
CREATE INDEX idx_evidence_bidder ON evidence(bidder_id);
CREATE INDEX idx_evidence_tender ON evidence(tender_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_confidence ON evidence(overall_confidence);
CREATE INDEX idx_evidence_validation ON evidence(validation_status);
CREATE INDEX idx_evidence_temporal ON evidence(effective_from, effective_to);
```

### Evidence Relationship Table

```sql
CREATE TABLE IF NOT EXISTS evidence_relationships (
  relationship_id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id_1 TEXT NOT NULL,
  evidence_id_2 TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  description TEXT,
  confidence REAL,
  created_at TEXT NOT NULL,
  
  FOREIGN KEY(evidence_id_1) REFERENCES evidence(evidence_id),
  FOREIGN KEY(evidence_id_2) REFERENCES evidence(evidence_id),
  UNIQUE(evidence_id_1, evidence_id_2, relationship_type)
);

-- Relationship types:
-- SAME_BIDDER (same company across docs)
-- SAME_AMOUNT (same value in different docs)
-- SAME_DATE (same date in different docs)
-- CONFLICTING_VALUE (contradictory values)
-- SUPPORTING_EVIDENCE (one confirms other)
```

### Evidence Conflict Table

```sql
CREATE TABLE IF NOT EXISTS evidence_conflicts (
  conflict_id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id_1 TEXT NOT NULL,
  evidence_id_2 TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT,
  requires_review INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  
  FOREIGN KEY(evidence_id_1) REFERENCES evidence(evidence_id),
  FOREIGN KEY(evidence_id_2) REFERENCES evidence(evidence_id)
);

-- Conflict types:
-- CONTRADICTING_VALUES (Company name different)
-- EXPIRED_DOCUMENT (Certificate expired)
-- MISSING_REQUIRED_FIELD (Required field empty)
-- INSUFFICIENT_CONFIDENCE (Too low confidence)
-- CANNOT_VERIFY (Cannot validate format/date)
```

---

## IMPLEMENTATION COMPONENTS

### 1. Evidence Schema Types (evidence-schema.ts)
- TypeScript interfaces for EvidenceAtom, Evidence relationships, conflicts
- Type guards and validators
- Constants for evidence types and confidence thresholds

### 2. Evidence Extractor (evidence-extractor.ts)
- Document classification (which document type)
- Field extraction from documents
- Primary + Secondary extractors
- Consensus engine

### 3. Confidence Scorer (confidence-scorer.ts)
- Composite confidence calculation
- Per-extractor confidence weighting
- Consensus confidence
- Format validation confidence

### 4. Evidence Validator (evidence-validator.ts)
- Required field validation
- Date format/range validation
- Amount validation (positive, reasonable size)
- Cross-document consistency checks

### 5. Temporal Validator (temporal-validator.ts)
- Certificate expiry checking
- License validity periods
- Document date validation
- Effective-from and effective-to calculation

### 6. Evidence Repository (evidence-repository.ts)
- Create/store evidence (immutable)
- Query evidence by document, bidder, tender
- Find evidence conflicts
- Generate evidence relationships

### 7. Database Migration (migration-002-phase-02-evidence.ts)
- Create evidence, relationships, conflicts tables
- Indices for performance

### 8. Unit Tests (evidence.test.ts)
- Evidence schema validation
- Confidence scoring
- Validator tests
- Integration tests

---

## EVIDENCE EXTRACTION EXAMPLES

### Example 1: Company Name Extraction

```
Input: "GENERAL EQUIPMENT LIMITED"
       (extracted from: FIRM_PROFILE.pdf, page 1, section "Company Details")

Extraction:
  - Primary extractor: "GENERAL EQUIPMENT LIMITED" (confidence: 0.95)
  - Secondary extractor: "GENERAL EQUIPMENT LTD" (confidence: 0.92)
  
Consensus:
  - Different (one has "LIMITED" vs "LTD")
  - Consensus confidence: 0.85 (high, minor variant)
  
Normalization:
  - Normalized: "GENERAL EQUIPMENT LIMITED"
  - Format valid: TRUE
  
Result:
  - Evidence: COMPANY_NAME
  - Value: "GENERAL EQUIPMENT LIMITED"
  - Confidence: 0.88 (average extraction + consensus)
  - Status: VERIFIED
```

### Example 2: Certificate Expiry Extraction

```
Input: "Certificate valid until: 15/12/2025"
       (extracted from: TAX_CERTIFICATE.pdf, page 1)

Extraction:
  - OCR: "15/12/2025" (confidence: 0.98, clear date format)
  - Parsed: 2025-12-15
  
Validation:
  - Date format: VALID
  - Date is in future: VALID
  - Type check: VALID
  
Temporal:
  - Effective from: 2025-01-01 (assumed start of certificate year)
  - Effective to: 2025-12-15 (expiry date)
  
Comparison with Tender:
  - Tender closing: 2026-02-01
  - Certificate expires: 2025-12-15
  - Status: EXPIRED (expires before tender close)
  
Result:
  - Evidence: CERTIFICATE_EXPIRY
  - Value: "2025-12-15"
  - Validation: INVALID (expired relative to tender)
  - Status: REQUIRES_REVIEW (flag for officer review)
  - Conflict: Created (expired before tender close)
```

### Example 3: Conflicting Financial Data

```
Input: Two documents with different amounts

Document 1 (FINANCIAL_STATEMENTS.pdf):
  "Total turnover 2025: KES 15,500,000"
  
Document 2 (PRICE_QUOTE.pdf):
  "Company turnover (3-year avg): KES 12,000,000"

Evidence created:
  Evidence 1: FINANCIAL_TURNOVER, value: 15,500,000, source: financial statements
  Evidence 2: FINANCIAL_TURNOVER, value: 12,000,000, source: price quote
  
Conflict Detection:
  - Type: CONFLICTING_VALUES
  - Amount difference: 3,500,000 (23% variance)
  - Severity: HIGH (material difference)
  - Requires review: YES
  
Result:
  - Both marked as REQUIRES_REVIEW
  - Conflict record created
  - Flag: "Financial turnover conflict - Review both sources"
```

---

## PHASE 02 DELIVERABLES

### Code Components (6 files, ~80 KB estimated)

- [ ] `backend/evaluation/evidence-schema.ts` - Type definitions
- [ ] `backend/evaluation/evidence-extractor.ts` - Document extraction
- [ ] `backend/evaluation/confidence-scorer.ts` - Confidence calculation
- [ ] `backend/evaluation/evidence-validator.ts` - Field validation
- [ ] `backend/evaluation/temporal-validator.ts` - Date/expiry checks
- [ ] `backend/evaluation/evidence-repository.ts` - Data access layer

### Database

- [ ] `backend/database/migration-002-phase-02-evidence.ts` - Schema creation

### Testing

- [ ] `backend/evaluation/evidence.test.ts` - 30+ unit tests

### Documentation

- [ ] `docs/tender-evaluation/PHASE-02-EVIDENCE-MODEL.md` - Complete design
- [ ] `docs/tender-evaluation/PHASE-02-EVIDENCE-EXAMPLES.md` - Detailed examples
- [ ] `docs/EVIDENCE-TYPES-REGISTRY.md` - Catalog of all evidence types

---

## PHASE 02 COMPLETION CRITERIA

- [ ] All 6 code components implemented
- [ ] Database migration created and tested
- [ ] 30+ unit tests written and passing
- [ ] Evidence schema documented
- [ ] Evidence types catalog created
- [ ] Confidence scoring algorithm verified
- [ ] Temporal validation tested
- [ ] Cross-document conflict detection tested
- [ ] No breaking changes to Phase 01
- [ ] All components integrate with Rule Registry

---

## PHASE 02 → PHASE 03 HANDOFF

Phase 03 (Temporal Engine) will use Phase 02's:
- Evidence atoms with temporal metadata (effective_from, effective_to)
- Date extraction and validation
- Temporal validator foundation
- Confidence scoring (for temporal certainty)

Phase 03 will add:
- Complex temporal relationships (license validity windows)
- Time-based rule execution
- Temporal graph relationships

---

## NEXT PHASE AFTER 02

Phase 03: Temporal Engine (5-7 days)
- Implement time-based rule evaluation
- Build temporal validation engine
- Create license/certificate validity checking

---

**Status:** Ready to implement  
**Priority:** HIGH (Unblocks Phases 03, 04, 05)  
**Expected Completion:** 2026-09-07
