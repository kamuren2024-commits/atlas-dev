# PHASE 13: OPERATIONAL DOCUMENT INTELLIGENCE & LIVE WORKFLOW VISUALIZATION

## ARCHITECTURE SCAN & IMPLEMENTATION PLAN

**Date**: 2026-09-02  
**Status**: RECONNAISSANCE COMPLETE → READY FOR IMPLEMENTATION  
**Scope**: EETF Evaluation Ops (Document Ingestion, AI Providers, Live Events, Workflow Visualization)  

---

## EXECUTIVE SUMMARY

Phase 13 transforms EETF from framework/mock implementation to **genuinely operational** document processing:

- An **SCM officer** uploads a real tender document
- The **document flows through a live state machine** (QUEUED → UPLOADED → CLASSIFIED → EXTRACTING → EXTRACTED → VALIDATED → COMPLETE)
- **Real AI providers** (Gemini, Ollama) process the document
- **Evidence is extracted** with confidence scores
- **Requirements are matched** against evidence
- **Rules execute** with audit trail
- **The UI shows REAL backend execution** - not simulated progress

**Key Principle**: No faked responses, no mock AI, no hardcoded extraction in production paths.

---

## PRODUCTION READINESS ASSESSMENT

### Components READY (90%+) - Can Deploy Today

| Component | Status | Score | Deployed | Action |
|-----------|--------|-------|----------|--------|
| Event Bus (pub/sub) | PRODUCTION | 95% | ✅ | Use as-is |
| Event API (12 routes) | PRODUCTION | 95% | ✅ | Use as-is |
| WebSocket/SSE Streaming | PRODUCTION | 85% | ✅ | Use as-is |
| AI Federation System | PRODUCTION | 90% | ✅ | Activate for EETF |
| Model Router (failover) | PRODUCTION | 95% | ✅ | Use for all AI tasks |
| Provider Health Tracking | PRODUCTION | 90% | ✅ | Monitor Gemini/Ollama |
| Audit Ledger (immutable) | PRODUCTION | 90% | ✅ | Log all operations |
| Frontend Components | PRODUCTION | 90% | ✅ | Display real data |
| Evidence Schema | PRODUCTION | 85% | ✅ | Use for atoms |
| Media Ingestion Service | PARTIAL | 80% | 🟡 | Add file storage |
| Knowledge Graph | PARTIAL | 75% | 🟡 | Use for relationships |

### Components PARTIAL (60-80%) - Need Work

| Component | Status | Score | What's Missing | Effort |
|-----------|--------|-------|-----------------|--------|
| Evidence Extractor | SKELETON | 35% | Implement extraction logic in 3 providers | 16 hrs |
| Document Classification | MOCK | 10% | Replace filename matching with Gemini | 8 hrs |
| File Storage | MOCK | 5% | Add real backend (S3/GCS/disk) | 24 hrs |
| Evaluation Pipeline | MOCK | 45% | Wire stage-by-stage execution | 20 hrs |
| Evaluation API Routes | MISSING | 0% | Create /upload, /trigger, /status endpoints | 8 hrs |
| OCR/PDF Services | MISSING | 0% | Add PDF parser + OCR engine | 32 hrs |
| Rule Executor | SKELETON | 60% | Wire to evidence atoms | 12 hrs |
| Requirement Matcher | SKELETON | 40% | Match extracted evidence to requirements | 16 hrs |

**Total Upgrade Effort**: ~136 hours (17 days at 8 hrs/day)

---

## CURRENT STATE BY COMPONENT

### ✅ 1. AI FEDERATION & PROVIDER SYSTEM (PRODUCTION READY)

**Status**: 90% complete, 8 providers integrated

**Implemented Providers**:
1. ✅ Gemini (Google) - Primary for document intelligence
2. ✅ Groq - Fast inference
3. ✅ OpenRouter - Aggregator
4. ✅ Cerebras - Large context
5. ✅ Ollama - Local fallback
6. ✅ OpenAI, Anthropic, DeepSeek, etc.

**Key Files**:
- `backend/ai-federation/providers/*.ts` - Provider implementations
- `backend/ai-federation/routing/model-router.ts` - Intelligent routing with failover
- `backend/ai-federation/health/provider-status-service.ts` - Health tracking
- `backend/ai-federation/compliance/audit-ledger.ts` - Immutable trail

**Routing Strategy**:
```
Document arrives
    ↓
Determine capability needed (CLASSIFY, EXTRACT, VISION)
    ↓
Query available providers by capability
    ↓
ModelRouter selects based on: availability, health, latency, capability
    ↓
Failover chain if selected provider fails
    ↓
Audit trail for every decision
```

**Phase 13 Use**: Wire EETF document processing to these providers

---

### ✅ 2. EVENT BUS & REAL-TIME STREAMING (PRODUCTION READY)

**Status**: 95% complete, fully operational

**System Components**:
- **EventBus** (`backend/event-fabric/event-bus.ts`) - EventEmitter-based pub/sub
- **REST API** (`backend/event-fabric/event-api-routes.ts`) - 12 endpoints
- **WebSocket** (`backend/event-fabric/websocket-handler.ts`) - Real-time connections
- **SSE** (`backend/event-fabric/sse-handler.ts`) - HTTP streaming

**Available Events**:
- 6 built-in topics: telemetry, protection, alarms, outages, forecasts, incidents
- Custom event publishing supported
- Filtering by: category, severity, status, source, timestamp

**Phase 13 Use**: Emit workflow events as document flows through pipeline

**Example Events**:
```
{
  "id": "EV-001",
  "timestamp": "2026-09-02T10:24:33Z",
  "type": "WORKFLOW",
  "category": "document_processing",
  "severity": "INFO",
  "source": "eetf.evaluation",
  "payload": {
    "documentId": "DOC-001",
    "stage": "CLASSIFYING",
    "provider": "Gemini",
    "model": "gemini-1.5-pro",
    "progress": 33
  }
}
```

---

### ✅ 3. FRONTEND COMPONENTS (PRODUCTION READY)

**Status**: 90% complete, UI framework ready

**Main Components**:
- `EnterpriseEvaluationEngine.tsx` - 9-tab interface
  - Workflow (document analysis)
  - Agents (agent status)
  - Rules (rule management)
  - Audit (audit logs)
  - Timeline (procurement timeline)
  - Monitoring (executive dashboard)
  - Risk (risk intelligence)
  - Scorecard (explainable decisions)
  - Decision (decision intelligence)

- `TenderEvaluationWorkspace.tsx` - 8-stage pipeline visualization
  1. Document detection
  2. OCR
  3. Text cleanup
  4. Document classification
  5. Field extraction
  6. Requirement matching
  7. Compliance validation
  8. Evaluation indexing

- Sub-components: IntakeLayer, AgentRegistry, ActivityStream, EvidenceGraph, etc.

**Phase 13 Action**: Connect these components to real backend data via new API routes

---

### 🟡 4. DOCUMENT INGESTION & STORAGE (PARTIAL)

**Current State**: In-memory upload sessions, no persistent storage

**Files**:
- `services/ingestion/index.ts` - DroneMediaIngestionService (80% ready)
  - ✅ Resumable uploads with chunk tracking
  - ✅ SHA256 hashing for chain of custody
  - ❌ Missing: Real file storage backend

**Problem**: Currently all uploaded documents stored in memory (lost on restart)

**Phase 13 Upgrade**: Implement `DocumentStorageService`
- Store files to S3/GCS/local disk
- Maintain versioning
- Implement retention policies
- Checksum validation at storage layer

**Effort**: 24 hours

**New API Route**:
```typescript
POST /api/v2/evaluation/upload
  ← multipart/form-data (file + metadata)
  → { sessionId, documentId, progress: 0 }
```

---

### ❌ 5. DOCUMENT CLASSIFICATION (MOCK - NEEDS REPLACEMENT)

**Current State**: Filename pattern matching

**File**: `backend/evaluation/document-classification.ts`
```typescript
// ❌ CURRENT (MOCK)
classifyByFilename(filename) {
  if (filename.includes('tax')) return 'TAX_CERTIFICATE';
  if (filename.includes('bank')) return 'BANK_STATEMENT';
  return 'OTHER';
}
```

**Problem**: Classification is unreliable, not AI-driven

**Phase 13 Upgrade**: Replace with real Gemini classification

```typescript
// ✅ PHASE 13 (REAL)
async classifyDocument(text: string): Promise<Classification> {
  const provider = await ModelRouter.route({
    capability: 'DOCUMENT_CLASSIFICATION',
    documentSize: text.length
  });
  
  const response = await provider.invoke({
    prompt: `Classify this tender document: ${text.substring(0, 1000)}`,
    schema: DocumentTypeSchema
  });
  
  return {
    type: response.classification,
    confidence: response.confidence,
    provider: provider.name,
    model: provider.model,
    reasoning: response.reasoning
  };
}
```

**Effort**: 8 hours

---

### ❌ 6. OCR & PDF SERVICES (MISSING - CRITICAL BLOCKER)

**Current State**: Not implemented (0%)

**What's Needed**:
1. PDF Parser: `pdfjs` or `pdf-parse`
2. OCR Engine: Tesseract.js, Google Vision, or Paddle OCR
3. Image Processing: `sharp` or OpenCV

**Files to Create**:
- `backend/document-processing/pdf-service.ts`
- `backend/document-processing/ocr-service.ts`
- Integration tests

**Effort**: 32 hours

**Usage in Phase 13**:
```typescript
// PDF → text
const text = await pdfService.extractText(filePath);

// Scanned image → text
const ocrText = await ocrService.recognize(imagePath);

// Combined pipeline
const text = 
  filetype === 'PDF' 
    ? await pdfService.extractText(doc)
    : await ocrService.recognize(doc);
```

---

### 🟡 7. EVIDENCE EXTRACTION (SKELETON - NEEDS IMPLEMENTATION)

**Current State**: Framework exists with 3 skeleton providers (35% ready)

**Files**:
- `backend/evaluation/evidence-extractor.ts` - Orchestrator (real)
- `backend/evaluation/confidence-scorer.ts` - Scoring (real)
- `backend/evaluation/evidence-validator.ts` - Validation (real)

**Problem**: Extraction providers are mocks:
```typescript
// ❌ CURRENT (MOCK)
class TextExtractionProvider implements ExtractionProvider {
  async extract(text, fields) {
    return new Map([
      ['COMPANY_NAME', { value: 'Mock Corp', confidence: 0.5 }]
    ]);
  }
}
```

**Phase 13 Upgrade**: Wire to real AI extraction

```typescript
// ✅ PHASE 13 (REAL)
class AIExtractionProvider implements ExtractionProvider {
  async extract(text: string, fieldTypes: string[]) {
    const provider = await ModelRouter.route({
      capability: 'STRUCTURED_EXTRACTION',
      schema: evidenceSchema
    });
    
    const response = await provider.invoke({
      task: 'extract_structured_data',
      text,
      fields: fieldTypes,
      schema: EvidenceAtomSchema
    });
    
    return this.validateAndScoreResults(response);
  }
}
```

**Effort**: 16 hours

---

### ❌ 8. EVALUATION API ROUTES (MISSING - CRITICAL)

**Current State**: Not implemented (0%)

**Problem**: Frontend expects these endpoints but backend doesn't have them

**Files to Create**: `backend/evaluation/api-routes.ts`

**Routes Needed**:
```typescript
// Document management
POST   /api/v2/evaluation/upload           // Upload new document
GET    /api/v2/evaluation/documents        // List documents
GET    /api/v2/evaluation/documents/:id    // Get document details
DELETE /api/v2/evaluation/documents/:id    // Archive document

// Pipeline control
POST   /api/v2/evaluation/trigger          // Start evaluation pipeline
POST   /api/v2/evaluation/pause/:id        // Pause evaluation
POST   /api/v2/evaluation/resume/:id       // Resume evaluation

// Status & monitoring
GET    /api/v2/evaluation/status/:id       // Get document processing status
GET    /api/v2/evaluation/agents           // Get active agents
GET    /api/v2/evaluation/findings/:id     // Get extracted findings
GET    /api/v2/evaluation/audit/:id        // Get audit trail for document

// Batch operations
POST   /api/v2/evaluation/batch-upload    // Upload multiple documents
GET    /api/v2/evaluation/batch/:batchId  // Get batch status
```

**Effort**: 8 hours

---

### 🟡 9. RULE EXECUTION (SKELETON - NEEDS WIRING)

**Current State**: Registry built but not wired to evidence (60% ready)

**Files**:
- `backend/evaluation/rule-schema.ts` - Type definitions (real)
- `backend/evaluation/rule-registry.ts` - Rule management (real)
- `backend/evaluation/rule-executor.ts` - Executor (framework)

**Problem**: Rule executor doesn't reference evidence atoms

**Phase 13 Upgrade**: Wire rule evaluation to evidence

```typescript
// ✅ PHASE 13 (WIRED)
async executeRule(rule: Rule, evidence: EvidenceAtom[]): Promise<RuleResult> {
  // Find applicable evidence for this rule
  const applicableEvidence = evidence.filter(
    e => e.evidence_type === rule.required_evidence_type
      && e.validation_status === 'VERIFIED'
      && e.overall_confidence >= 0.85
  );
  
  // Execute compiled rule against evidence
  const result = rule.compiled_fn(applicableEvidence);
  
  // Track which evidence was used
  result.evidence_references = applicableEvidence.map(e => ({
    evidence_id: e.evidence_id,
    evidence_type: e.evidence_type,
    value: e.extracted_value,
    confidence: e.overall_confidence
  }));
  
  // Audit trail
  await auditLedger.log({
    event: 'RULE_EXECUTED',
    rule_id: rule.id,
    evidence_count: applicableEvidence.length,
    result: result.passed ? 'PASS' : 'FAIL',
    timestamp: new Date()
  });
  
  return result;
}
```

**Effort**: 12 hours

---

### 🟡 10. KNOWLEDGE GRAPH & RELATIONSHIPS (PARTIAL - 75% READY)

**Status**: Basic queries work, needs enrichment

**Files**: `backend/evaluation/knowledge-graph.ts`

**Current Capabilities**:
- ✅ Node/edge management
- ✅ 8 default nodes (Ketraco, Tender, Suppliers, Directors, Rules)
- ✅ 6 default edges
- ❌ Missing: Enrichment algorithms, query optimization

**Phase 13 Use**: Graph updates as evidence is extracted
```
Document contains company X
  → Create/link Company node
  → Create "mentioned_in" edge to Document

Company X has director Y
  → Create/link Director node
  → Create "has_director" edge

Company X owns Company Z (collusion)
  → Create/detect ownership relationship
  → Flag potential collusion
```

**Effort**: 10 hours (enrichment algorithms)

---

## PHASE 13 IMPLEMENTATION ROADMAP

### CRITICAL PATH (Must complete in order)

#### Week 1: Foundation (40 hours)

1. **API Routes** (8 hrs)
   - Create `backend/evaluation/api-routes.ts`
   - Implement all 12 REST endpoints
   - Connect to existing services

2. **File Storage** (24 hrs)
   - Implement `DocumentStorageService`
   - Replace in-memory sessions with real storage
   - Add versioning, retention policies

3. **OCR & PDF** (32 hrs)
   - Integrate pdfjs or pdf-parse
   - Add OCR engine (Tesseract.js)
   - Create `PDFProcessingService` and `OCRService`
   - Test on real documents

#### Week 2: AI Integration (40 hours)

4. **Document Classification** (8 hrs)
   - Wire `DocumentClassifier` to ModelRouter
   - Add Gemini classification task
   - Confidence scoring

5. **Evidence Extraction** (16 hrs)
   - Replace mock providers in `EvidenceExtractor`
   - Implement `AIExtractionProvider`
   - Add consensus scoring

6. **Provider Integration** (16 hrs)
   - Verify Gemini API key configuration
   - Test Ollama connectivity
   - Implement capability-aware routing

#### Week 3: Workflow & Events (32 hours)

7. **Document State Machine** (12 hrs)
   - Implement full workflow states
   - Emit events at each transition
   - Update UI in real-time

8. **Requirement Matching** (12 hrs)
   - Match extracted evidence to tender requirements
   - Track satisfaction scores
   - Update audit trail

9. **Rule Execution** (8 hrs)
   - Wire Rule Executor to evidence
   - Execute evaluation rules
   - Log decisions

---

## EVENT FLOW DIAGRAM

```
SCM Officer uploads document
  │
  ├─→ EVENT: DOCUMENT_UPLOADED
  │     { documentId, filename, size, mime_type }
  │
  ├─→ STAGE: SECURITY_SCAN
  │     { scanning: true, stage: "SECURITY_SCAN" }
  │
  ├─→ STAGE: STORED
  │     { stored: true, path: "s3://bucket/doc-001" }
  │
  ├─→ STAGE: CLASSIFICATION_PENDING
  │     { pending: true }
  │
  ├─→ AI TASK: Classify document
  │     { provider: "Gemini", model: "gemini-1.5-pro" }
  │
  ├─→ EVENT: DOCUMENT_CLASSIFIED
  │     { type: "BID_SUBMISSION", confidence: 0.95 }
  │
  ├─→ STAGE: TEXT_EXTRACTION
  │     { provider: "Ollama", model: "qwen2.5:7b" }
  │
  ├─→ EVENT: TEXT_EXTRACTED
  │     { textLength: 5000, method: "pdf_parse" }
  │
  ├─→ STAGE: FIELD_EXTRACTION
  │     { provider: "Gemini", model: "gemini-1.5-pro" }
  │
  ├─→ EVENT: EVIDENCE_EXTRACTED
  │     { atoms: [EvidenceAtom, ...], confidence: [0.92, 0.88, ...] }
  │
  ├─→ STAGE: REQUIREMENT_MATCHING
  │     { matched: 8, unmatched: 2, coverage: 80% }
  │
  ├─→ EVENT: REQUIREMENTS_EVALUATED
  │     { satisfied: true, gaps: [] }
  │
  ├─→ STAGE: RULE_EXECUTION
  │     { rules_executed: 15, passed: 12, failed: 3 }
  │
  ├─→ EVENT: EVALUATION_COMPLETE
  │     { status: "PASS" | "FAIL" | "REVIEW", confidence: 0.88 }
  │
  └─→ UI: Shows real results with audit trail

```

---

## PROVIDER INTEGRATION REQUIREMENTS

### Gemini Integration

**Configuration**: Requires `GEMINI_API_KEY` in environment

**Never expose key to**:
- React/browser
- Client bundle
- Logs
- Error messages
- Audit payloads

**Backend-only invocation**:
```typescript
async classifyWithGemini(text: string) {
  const provider = new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY  // ← Backend only
  });
  
  return await provider.invoke({
    task: 'classify_document',
    text,
    schema: DocumentTypeSchema
  });
}
```

**Required Capabilities**:
- ✅ Document classification
- ✅ PDF understanding (vision)
- ✅ Structured extraction
- ✅ Table extraction assistance
- ✅ Requirement identification
- ✅ Evidence mapping

### Ollama Integration

**Configuration**: `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)

**Health Discovery**:
```
GET /api/tags
```

**Determines**:
- Server reachability
- Available models
- Model capabilities (vision, context size)
- Current load/memory

**UI Status Display**:
```
OLLAMA
● ONLINE
Endpoint: 127.0.0.1:11434
Available Models: 3
Active Model: qwen2.5:7b
Capability: Document Reasoning
```

---

## SUCCESS CRITERIA FOR PHASE 13

An SCM officer should be able to:

1. ✅ Upload a real tender document via UI
2. ✅ See the document immediately appear in the pipeline
3. ✅ Watch the document flow through 8 stages in real-time
4. ✅ See which AI provider/model is processing each stage
5. ✅ See actual Gemini API execution (if configured)
6. ✅ See actual Ollama local model execution (if running)
7. ✅ See fallback behavior when providers fail
8. ✅ See extracted evidence in real-time on the UI
9. ✅ See requirements being matched against evidence
10. ✅ See rules executing with decision reasons
11. ✅ See certificate/contract expiry detection
12. ✅ See PASS/FAIL/REVIEW transitions
13. ✅ See graph relationships being created
14. ✅ See immutable audit events being written
15. ✅ Inspect every workflow step with no simulated progress

**Zero tolerance for**:
- ❌ Fake AI responses
- ❌ Hardcoded extraction results
- ❌ Mock confidence scores in production
- ❌ Simulated progress bars
- ❌ Unrealistic timings

---

## DEPENDENCIES & BLOCKERS

### Must Complete First
- ✅ Phase 01 (Rule Ontology) - COMPLETE
- ✅ Phase 02 (Evidence Model) - COMPLETE

### Unblocked by
- Phase 03-12 (Can work in parallel, not dependencies)

### Assumes
- Gemini API key available (or Ollama running locally)
- Database (SQLite) initialized
- Frontend built and deployed

---

## ARCHITECTURE DECISIONS

1. **Upgrade in place, don't rebuild**
   - Use existing AI Federation
   - Use existing Event Bus
   - Use existing Frontend
   - Add/wire missing pieces

2. **Backend-only AI invocation**
   - Never expose API keys to frontend
   - All AI requests go through backend
   - Audit all AI interactions

3. **Capability-aware routing**
   - Provider selection based on: availability, health, capability, model type, document size, latency
   - Not just "which is configured"

4. **No silent failures**
   - Emit failure events
   - Log fallback decisions
   - Show user what actually happened

5. **Full audit trail**
   - Every AI execution logged
   - Every rule decision logged
   - Every evidence extraction logged
   - Immutable ledger

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| AI provider fails | Failover chain (Gemini → Ollama → fallback) |
| File storage crashes | Implement backup strategy, versioning |
| OCR quality issues | Add confidence thresholds, manual review option |
| Slow processing | Async pipeline with progress events |
| Large documents | Implement pagination, chunking, streaming |
| API key exposure | Backend-only invocation, never in frontend |
| Mock data in production | Strict separation: test files use mocks, prod uses real |

---

## FILES TO CREATE/MODIFY

### Create (New)
- `backend/evaluation/api-routes.ts` (12 endpoints)
- `backend/document-processing/pdf-service.ts`
- `backend/document-processing/ocr-service.ts`
- `backend/document-processing/document-storage-service.ts`
- `backend/evaluation/model-selector.ts` (capability-aware routing)
- `docs/tender-evaluation/PHASE-13-IMPLEMENTATION-GUIDE.md`

### Modify (Existing)
- `backend/evaluation/evidence-extractor.ts` (wire to AI Federation)
- `backend/evaluation/document-classification.ts` (replace with Gemini)
- `backend/evaluation/rule-executor.ts` (wire to evidence)
- `services/ingestion/index.ts` (add real file storage)
- `src/components/ketraco/tender/EnterpriseEvaluationEngine.tsx` (connect to API)

---

## CONCLUSION

**Phase 13 transforms EETF from framework to operational system.**

The infrastructure (AI Federation, Event Bus, Frontend UI) already exists and is production-ready.

The work is:
1. Creating missing pieces (API routes, file storage, OCR)
2. Replacing mocks with real implementations (classification, extraction)
3. Wiring components together (routes ↔ services ↔ providers)
4. Adding observability (events, audit trail, UI feedback)

**Estimated Effort**: 136 hours (17 days @ 8 hrs/day)  
**Timeline**: Aggressive = 2 weeks, Realistic = 3-4 weeks  
**Starting Point**: Architecture scan complete, recommendations validated  

**Next Step**: Begin Week 1 implementation with API routes and file storage.
