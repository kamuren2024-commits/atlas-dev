# Evidence Provenance

**Status: PARTIAL**

## Existing representations

The `evaluation_documents` table stores tender/bidder links, filename, content hash, storage path, upload time, OCR text/status, and a confidence value. `evaluation_evidences` stores document/tender/bidder references, optional requirement ID, criterion code, page/section, extracted content, confidence, extraction method, reviewer-validation text, hash, and creation time. The legacy `DocumentStorageService` writes an original file and JSON metadata into a local directory and hashes the original bytes.

These are separate storage paths. The v2 database document upload route is disabled until it can bind authenticated uploader identity and versioned object storage. The legacy filesystem API remains separate and is not treated as the evidence authority.

## Provenance gaps

The current schema does not provide the complete tenant/evaluation identity, immutable object version, source connector/provenance, classification lifecycle, verifier identity/time, and append-only evidence-state transitions required by Phase 06. A confidence field or OCR result does not establish verification. Existing reviewer-validation defaults must not be read as verified human review.

## Required evidence behavior

Evidence lifecycle states must be explicit: `UPLOADED`, `EXTRACTED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `CONFLICT`, `EXPIRED`, `REVOKED`, or `UNAVAILABLE`. Each evaluation conclusion must reference versioned source evidence and the verification state that existed at decision time. AI extraction and candidate mappings remain `AI-DERIVED`; only an authorized human control can verify evidence.

No production object-store integration, evidence replacement/deletion protection, or complete provenance-aware requirement-to-decision chain is verified.
