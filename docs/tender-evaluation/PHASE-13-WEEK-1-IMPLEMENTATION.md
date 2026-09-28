# Phase 13: Operational Document Intelligence - Week 1 Implementation Guide

## Overview

**Phase 13** transforms tender evaluation from a human-centric workflow into an **AI-powered document intelligence platform**. The SCM officer uploads documents and sees real-time analysis with AI extraction, evidence matching, rule execution, and decision making.

**Week 1 Focus**: Build the foundation - API routes, persistent document storage, and PDF/OCR integration.

---

## Week 1 Deliverables

### 1. Evaluation API Routes (`backend/evaluation/api-routes.ts`)
**Goal**: 12 REST endpoints enabling document upload, processing, status tracking, and result retrieval.

**Endpoints**:

#### Upload & Management
```
POST /api/evaluation/documents/upload
  Body: FormData with file, tender_id, bidder_id
  Response: { document_id, status: QUEUED, url }

GET /api/evaluation/documents/:document_id
  Response: Full document with all metadata, classification, evidence

GET /api/evaluation/documents?tender_id=&status=&limit=50&offset=0
  Response: Paginated list with summary fields

DELETE /api/evaluation/documents/:document_id
  Response: { success, deleted_at }
```

#### Processing Control
```
POST /api/evaluation/documents/:document_id/trigger
  Body: { action: "classify" | "extract" | "evaluate" }
  Response: { processing_id, action, status }

POST /api/evaluation/documents/:document_id/trigger-full-pipeline
  Body: { options: { use_ocr: true, use_vision: true } }
  Response: { pipeline_id, stages: [ ... ], progress: 0 }

GET /api/evaluation/documents/:document_id/status
  Response: { status, progress: 45, current_stage: "TEXT_EXTRACTION", next_stage: "FIELD_EXTRACTION" }
```

#### Results & Analysis
```
GET /api/evaluation/documents/:document_id/extracted-fields
  Response: { fields: { bid_amount: {...}, bid_date: {...}, ... }, confidence_scores }

GET /api/evaluation/documents/:document_id/matched-requirements
  Response: { matched: [ {...}, {...} ], unmatched: [ {...} ], coverage: 92.3 }

GET /api/evaluation/documents/:document_id/rule-evaluation
  Response: { rules_executed: 14, passed: 12, failed: 2, decision: "QUALIFIED", decision_reasons: [...] }

GET /api/evaluation/documents/:document_id/audit-trail
  Response: { events: [ { timestamp, action, actor, details }, ... ] }
```

#### Events
```
GET /api/evaluation/documents/:document_id/events
  Query: ?since_timestamp=1234567&include_errors=true
  Response: { events: [ ... ], next_timestamp: 1234568 }
  (WebSocket upgrade supported)
```

**Implementation Requirements**:
- Authentication via bearer token (extract from header)
- Validation: file type, size limits (100 MB), tender_id exists
- Transaction-safe: each endpoint wraps database ops in transactions
- Error handling: 400/401/403/404/409/500 with structured error body
- Logging: audit trail for each operation
- Rate limiting: 100 requests/min per user

---

### 2. Document Storage Service

#### Current State Problem
- Documents stored in **in-memory session objects**
- Lost on restart
- No persistence across requests
- Cannot scale to multiple API servers

#### Target State
Replace in-memory storage with **persistent file storage** (choice of 3 backends):

**Option A: Local Disk** (fastest for dev, suitable for single-server deployments)
- Store in `data/documents/{tender_id}/{document_id}/`
- Files: `original.pdf`, `metadata.json`, `extracted_text.txt`, `ocr_result.json`
- Database: track storage location, hash, size, access timestamps

**Option B: AWS S3** (production-grade, multi-region capable)
- Bucket: `{APP_NAME}-documents`
- Key structure: `documents/{tender_id}/{document_id}/original.pdf`
- Database: track S3 URLs, ETags, access times
- IAM policy: read/write/delete only for own documents

**Option C: Google Cloud Storage** (similar to S3)
- Bucket: `{APP_NAME}-documents`
- Service account credentials via `GOOGLE_CLOUD_KEY` env var

**Recommended**: Start with **Option A (Local Disk)** for Week 1, migrate to S3 in Week 2 if needed.

#### Implementation Details

**Interface**:
```typescript
interface DocumentStorageService {
  // Store uploaded file, return storage location + hash
  store(document_id: string, tender_id: string, file: Buffer, metadata: object): 
    Promise<{ location: string, hash: string, size_bytes: number, stored_at: DateTime }>
  
  // Retrieve file
  retrieve(document_id: string): Promise<Buffer>
  
  // Store derived artifacts (extracted text, OCR results, etc)
  storeArtifact(document_id: string, artifact_type: string, content: Buffer | string):
    Promise<{ artifact_id: string, location: string }>
  
  // Get artifact
  getArtifact(document_id: string, artifact_type: string): Promise<Buffer | string>
  
  // Delete entire document + artifacts
  delete(document_id: string): Promise<void>
  
  // Check if document exists
  exists(document_id: string): Promise<boolean>
}
```

**Database Schema Addition**:
```sql
CREATE TABLE document_storage (
  document_id TEXT PRIMARY KEY,
  tender_id TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size_bytes INTEGER,
  storage_backend TEXT NOT NULL, -- "local_disk" | "s3" | "gcs"
  storage_location TEXT NOT NULL, -- file path or S3 URL
  content_type TEXT, -- "application/pdf" etc
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME, -- soft-delete date
  
  FOREIGN KEY (tender_id) REFERENCES tenders(id),
  UNIQUE(file_hash), -- prevent duplicate uploads
  INDEX idx_tender_created (tender_id, created_at)
);

CREATE TABLE document_artifacts (
  artifact_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL, -- "extracted_text" | "ocr_result" | "classification_result"
  storage_location TEXT NOT NULL,
  size_bytes INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE(document_id, artifact_type)
);
```

---

### 3. PDF Parser & OCR Integration

#### Current State
- No PDF parsing implemented
- No OCR implemented
- Document text extraction will fail

#### Target State
Implement **dual-path document processing**:

**Path 1: Digital PDFs** (text-searchable PDFs)
- Use `pdfjs-dist` or `pdf-parse` to extract text
- Confidence: 95%+ (OCR not needed)
- Speed: ~100 ms for typical 5-page document

**Path 2: Scanned PDFs** (image-based PDFs)
- Detect if PDF contains images only (check pdfjs output)
- Use **Tesseract.js** (local OCR) or **Google Vision API** (cloud OCR)
- Confidence: 60-85% (depends on image quality)
- Speed: 5-30 seconds per page

#### Implementation Details

**Interface**:
```typescript
interface DocumentProcessor {
  // Extract text from PDF
  extractTextFromPDF(file_path: string): Promise<{
    text: string,
    pages: Page[],
    is_scanned: boolean,
    language_detected: string
  }>
  
  // Run OCR on image
  runOCR(image_buffer: Buffer, language: string = "eng"): Promise<{
    text: string,
    confidence: number,
    bounding_boxes?: BoundingBox[]
  }>
  
  // Full pipeline: PDF → extract/OCR → return structured result
  processDocument(file_path: string, options: ProcessOptions): Promise<DocumentExtractionResult>
}

interface DocumentExtractionResult {
  document_id: string,
  extracted_text: string,
  pages: {
    page_number: number,
    text: string,
    is_scanned: boolean,
    ocr_confidence?: number,
    images?: Image[]
  }[],
  metadata: {
    total_pages: number,
    detected_language: string,
    processing_time_ms: number,
    contains_images: boolean,
    contains_tables: boolean,
    contains_handwriting: boolean
  },
  processing_method: "digital_pdf" | "ocr_only" | "hybrid",
  warnings: string[]
}
```

**Package Choices**:

| Component | Option A | Option B | Recommendation |
|-----------|----------|----------|-----------------|
| PDF Text | pdfjs-dist (browser) | pdf-parse (Node.js) | pdf-parse (native Node.js) |
| OCR Local | Tesseract.js (JS) | Tesseract CLI | Tesseract.js (no native deps) |
| OCR Cloud | Google Vision API | AWS Textract | Google Vision API (simpler) |
| Language Detection | langdetect (py) | textcat (rust) | use pdf-parse result |

**Database Schema Addition**:
```sql
CREATE TABLE document_processing_results (
  document_id TEXT PRIMARY KEY,
  extracted_text TEXT NOT NULL,
  total_pages INTEGER,
  detected_language TEXT,
  processing_method TEXT, -- "digital_pdf" | "ocr_only" | "hybrid"
  processing_time_ms INTEGER,
  contains_images BOOLEAN DEFAULT FALSE,
  contains_tables BOOLEAN DEFAULT FALSE,
  contains_handwriting BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  INDEX idx_created (created_at)
);

CREATE TABLE document_pages (
  page_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  text_content TEXT,
  is_scanned BOOLEAN DEFAULT FALSE,
  ocr_confidence FLOAT,
  extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE(document_id, page_number)
);
```

---

## Week 1 Implementation Schedule

### Day 1: Project Setup & API Routes (8 hours)
- [ ] Create `backend/evaluation/api-routes.ts`
- [ ] Implement POST /upload endpoint (FormData handling)
- [ ] Implement GET /documents/:id endpoint
- [ ] Add request validation middleware
- [ ] Add error handling & logging
- [ ] Write 5 route tests

### Day 2: Document Storage Service (8 hours)
- [ ] Create `backend/evaluation/document-storage.ts`
- [ ] Implement local disk storage backend
- [ ] Create database migration for document_storage + document_artifacts tables
- [ ] Add storage lifecycle tests
- [ ] Document storage backend architecture

### Day 3: PDF & OCR Integration (8 hours)
- [ ] Install pdf-parse + tesseract.js dependencies
- [ ] Create `backend/evaluation/document-processor.ts`
- [ ] Implement PDF text extraction
- [ ] Implement OCR detection + fallback
- [ ] Create database migration for document_processing_results
- [ ] Write 5 processor tests

### Day 4: API Route Completion (8 hours)
- [ ] Implement status endpoint
- [ ] Implement trigger endpoints (classify, extract, evaluate)
- [ ] Implement results endpoints (matched-requirements, rule-evaluation)
- [ ] Add WebSocket support for real-time status
- [ ] Write 10 route tests

### Day 5: Integration & Testing (8 hours)
- [ ] Wire DocumentStorageService into routes
- [ ] Wire DocumentProcessor into routes
- [ ] End-to-end test: upload → extract → retrieve
- [ ] Performance testing (measure latency)
- [ ] Documentation & deployment guide

---

## Critical Success Criteria for Week 1

✅ SCM officer can upload a PDF file via `/upload` endpoint
✅ File is persisted to disk (not lost on restart)
✅ Text extraction runs automatically (digital PDF)
✅ OCR fallback works (scanned PDF)
✅ Extracted text accessible via `/documents/:id/extracted-fields`
✅ All API endpoints have comprehensive error handling
✅ Request/response logging for audit trail
✅ 40+ unit tests covering all components
✅ README with setup + example requests
✅ No hardcoded credentials or mock data in production paths

---

## Key Technical Decisions

### Decision 1: Storage Backend
**Chosen: Local Disk for Week 1, migrate to S3 in Week 2**
- Local disk fastest for development/testing
- S3 migration will be straightforward (interface abstraction)
- No new infrastructure this week

### Decision 2: PDF Parser
**Chosen: pdf-parse (Node.js native, no browser dependencies)**
- Faster than pdfjs in Node.js environment
- Simpler integration with Express backend
- No re-rendering overhead

### Decision 3: OCR Library
**Chosen: Tesseract.js (local, open-source)**
- No external API calls (self-contained)
- Good accuracy for typical scanned documents
- Can migrate to Google Vision in Week 2 if needed

### Decision 4: Document State Machine
**Not implemented in Week 1** - focus on core storage/extraction
- State machine will be added in Week 2 with event bus
- For now, documents move: QUEUED → UPLOADED → TEXT_EXTRACTED → ready for classification

---

## Integration Points with Existing Phases

**Phase 01 (Rule Ontology)**
- Rules can be loaded to inform document classification
- Week 2 will wire rule execution to extracted fields

**Phase 02 (Evidence Model)**
- Evidence atoms created from extracted fields
- EvidenceRepository used to store extraction results
- Confidence scores from Phase 02 will score extraction accuracy

**Existing Event Bus**
- Will emit DOCUMENT_UPLOADED, DOCUMENT_PROCESSING_STARTED, DOCUMENT_TEXT_EXTRACTED events
- Week 2 integration via EventBus.emit() calls

**Existing Frontend**
- Tab 2 (Document Upload) will call POST /upload
- Tab 3 (Processing) will call GET /status + WebSocket for real-time updates
- Tab 4 (Results) will call GET /matched-requirements + GET /rule-evaluation

---

## Blockers & Assumptions

### Blockers Identified
1. **Gemini API Key** - Is `GEMINI_API_KEY` environment variable available?
2. **Ollama Instance** - Is local Ollama running on `localhost:11434`?
3. **Storage Permissions** - Can backend process write to `data/documents/`?

### Assumptions Made
1. SQLite database can support 10,000+ documents (indices optimized)
2. PDF files < 100 MB typical size (validation enforced)
3. OCR processing async (won't block API responses)
4. Documents retained for 90 days (soft-delete via expires_at)
5. No PII scrubbing needed (data classified as audit documents)

---

## Dependencies to Install

```bash
npm install pdf-parse@3.1.0
npm install tesseract.js@5.0.0
npm install multer@1.4.5 # file upload handling
npm install sharp@0.33.0 # image processing utilities
```

---

## Deployment Checklist

- [ ] `backend/evaluation/api-routes.ts` created and tested
- [ ] `backend/evaluation/document-storage.ts` created and tested
- [ ] `backend/evaluation/document-processor.ts` created and tested
- [ ] Database migrations run (document_storage, document_artifacts, document_processing_results tables)
- [ ] Environment variables configured (FILE_STORAGE_BACKEND, PDF_PARSER_TYPE, OCR_ENGINE)
- [ ] API documentation updated (README or Swagger)
- [ ] 40+ unit tests passing
- [ ] 3 end-to-end integration tests passing
- [ ] Load testing: 100 concurrent uploads (no 5xx errors)
- [ ] Documentation deployed (PHASE-13-WEEK-1-README.md)

---

## Next Steps (Week 2)

Week 2 will focus on **AI Integration & Classification**:
1. Wire ModelRouter to document classification
2. Replace mock extraction with real Gemini/Ollama calls
3. Implement full state machine with event emission
4. Test Gemini and Ollama connectivity
5. Implement requirement matching logic

See `PHASE-13-WEEK-2-ROADMAP.md` for details.
