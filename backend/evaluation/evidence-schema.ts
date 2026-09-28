/**
 * PHASE 02: EETF EVIDENCE MODEL - EVIDENCE SCHEMA
 * 
 * TypeScript type definitions for evidence atoms, relationships, and conflicts.
 * Evidence forms the foundation for rule evaluation and audit trails.
 * 
 * Authority: PPADA 2015, PPADR 2020, Tender-Specific Criteria
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

/**
 * Evidence Data Types
 */
export type EvidenceDataType = 'TEXT' | 'DATE' | 'AMOUNT' | 'NUMBER' | 'ENTITY' | 'TABLE' | 'BOOLEAN' | 'IMAGE';

/**
 * Evidence Validation Status
 */
export type EvidenceValidationStatus = 'VERIFIED' | 'REQUIRES_REVIEW' | 'INVALID' | 'PENDING';

/**
 * Extraction Method (how was evidence obtained)
 */
export type ExtractionMethod = 'OCR' | 'TEXT_EXTRACTION' | 'FORM_PARSING' | 'TABLE_EXTRACTION' | 'MANUAL' | 'AI_EXTRACTION';

/**
 * Evidence Relationship Types (how two evidence atoms relate)
 */
export type EvidenceRelationshipType =
  | 'SAME_BIDDER'           // Same company across documents
  | 'SAME_AMOUNT'           // Same value in different documents
  | 'SAME_DATE'             // Same date in different documents
  | 'SAME_ENTITY'           // Same person/organization
  | 'SUPPORTING_EVIDENCE'   // One confirms another
  | 'CONTRADICTING'         // Values conflict
  | 'DEPENDENCY'            // One depends on other
  | 'CROSS_REFERENCE';      // Referenced in another document

/**
 * Conflict Types
 */
export type ConflictType =
  | 'CONTRADICTING_VALUES'     // Same field has different values
  | 'EXPIRED_DOCUMENT'         // Document/certificate is expired
  | 'MISSING_REQUIRED_FIELD'   // Required field not present
  | 'INSUFFICIENT_CONFIDENCE'  // Confidence below threshold
  | 'FORMAT_INVALID'           // Field doesn't match expected format
  | 'CANNOT_VERIFY'            // Cannot validate or verify
  | 'INCONSISTENT_DATES'       // Temporal inconsistency
  | 'DUPLICATE_SUBMISSION';    // Same document submitted twice

/**
 * Core Evidence Atom
 * 
 * Single piece of evidence extracted from a document.
 * Immutable after creation.
 */
export interface EvidenceAtom {
  // =====================================================
  // IDENTITY & CLASSIFICATION
  // =====================================================
  
  /** Unique evidence identifier (immutable) */
  evidence_id: string;
  
  /** Type of evidence (COMPANY_NAME, CERTIFICATE_EXPIRY, etc.) */
  evidence_type: string;
  
  /** Data type of extracted value */
  data_type: EvidenceDataType;
  
  // =====================================================
  // SOURCE & LOCATION
  // =====================================================
  
  /** Which document this came from */
  document_id: string;
  
  /** Document type (BID_SUBMISSION, FINANCIAL_STATEMENTS, etc.) */
  document_type: string;
  
  /** When was the document created/dated */
  document_date: Date;
  
  /** Page number (for multi-page documents) */
  page_number?: number;
  
  /** Named section within document (e.g., "Financial Summary") */
  section?: string;
  
  /** Precise location (e.g., "Line 5, Column 2") */
  location_text?: string;
  
  // =====================================================
  // EXTRACTED VALUE
  // =====================================================
  
  /** Raw extracted value (as-is from document) */
  extracted_value: string;
  
  /** Normalized/standardized form */
  normalized_value: string;
  
  // =====================================================
  // CONFIDENCE & QUALITY
  // =====================================================
  
  /** Model/extractor confidence (0-1) */
  extraction_confidence: number;
  
  /** OCR confidence (0-1), if OCR was used */
  ocr_confidence?: number;
  
  /** Consensus confidence (0-1), if multiple extractors used */
  consensus_confidence?: number;
  
  /** Format validation result (passes expected format) */
  format_valid: boolean;
  
  /** Overall composite confidence (0-1) */
  overall_confidence: number;
  
  // =====================================================
  // VALIDATION & STATUS
  // =====================================================
  
  /** Current validation status */
  validation_status: EvidenceValidationStatus;
  
  /** List of validation errors (if any) */
  validation_errors: string[];
  
  // =====================================================
  // TEMPORAL VALIDITY
  // =====================================================
  
  /** When this evidence becomes valid (effective date) */
  effective_from: Date;
  
  /** When this evidence expires (null = no expiry) */
  effective_to?: Date;
  
  // =====================================================
  // RELATIONSHIPS
  // =====================================================
  
  /** Which bidder submitted this evidence */
  bidder_id?: string;
  
  /** Which tender is this evidence for */
  tender_id: string;
  
  /** Which requirements does this satisfy */
  requirement_ids: string[];
  
  // =====================================================
  // AUDIT & INTEGRITY
  // =====================================================
  
  /** When evidence was created */
  created_at: Date;
  
  /** Who created/extracted the evidence */
  created_by: string;
  
  /** SHA256 hash of content (immutable proof) */
  hash: string;
  
  /** Whether this evidence can be modified (should be true) */
  immutable: boolean;
  
  // =====================================================
  // EXTRACTION METADATA
  // =====================================================
  
  /** Which service/AI extracted this */
  source_extractor: string;
  
  /** How it was extracted (OCR, text parsing, etc.) */
  extraction_method: ExtractionMethod;
  
  /** Additional extraction context */
  extraction_context?: Record<string, any>;
}

/**
 * Evidence Relationship
 * 
 * Links two evidence atoms together.
 * Examples: same company across documents, same amount, supporting evidence.
 */
export interface EvidenceRelationship {
  /** Unique relationship ID */
  relationship_id: string;
  
  /** First evidence atom */
  evidence_id_1: string;
  
  /** Second evidence atom */
  evidence_id_2: string;
  
  /** Type of relationship */
  relationship_type: EvidenceRelationshipType;
  
  /** Human-readable description */
  description: string;
  
  /** Confidence in this relationship (0-1) */
  confidence: number;
  
  /** When relationship was discovered */
  created_at: Date;
  
  /** Bidirectional (works both ways) */
  bidirectional: boolean;
}

/**
 * Evidence Conflict
 * 
 * Detected inconsistency or problem with evidence.
 * Requires human review.
 */
export interface EvidenceConflict {
  /** Unique conflict ID */
  conflict_id: string;
  
  /** First evidence involved */
  evidence_id_1: string;
  
  /** Second evidence involved (if applicable) */
  evidence_id_2?: string;
  
  /** Type of conflict */
  conflict_type: ConflictType;
  
  /** Detailed description */
  description: string;
  
  /** Severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Whether this requires human review */
  requires_review: boolean;
  
  /** When conflict was detected */
  created_at: Date;
  
  /** Review status */
  review_status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  
  /** Notes from reviewer */
  review_notes?: string;
}

/**
 * Confidence Calculation Result
 * 
 * Breakdown of how overall confidence was calculated.
 */
export interface ConfidenceBreakdown {
  extraction_confidence: number;  // AI model quality
  ocr_confidence?: number;        // OCR quality
  consensus_confidence?: number;  // Multiple extractors agreement
  format_valid: boolean;          // Passes format checks
  overall_confidence: number;     // Final composite score
  
  // Calculation details
  calculation_method: string;
  weights: Record<string, number>;
  intermediate_values: Record<string, number>;
}

/**
 * Evidence Query Filter
 * 
 * Used to query evidence by various criteria.
 */
export interface EvidenceQuery {
  tender_id?: string;
  bidder_id?: string;
  document_id?: string;
  evidence_type?: string;
  validation_status?: EvidenceValidationStatus;
  min_confidence?: number;
  has_conflicts?: boolean;
  expired?: boolean;
  as_of_date?: Date;
}

/**
 * Evidence Extraction Request
 * 
 * Used to request extraction of evidence from a document.
 */
export interface EvidenceExtractionRequest {
  document_id: string;
  document_type: string;
  tender_id: string;
  bidder_id?: string;
  
  /** Which evidence types to extract */
  target_evidence_types?: string[];
  
  /** Preferred extraction method */
  preferred_extraction_method?: ExtractionMethod;
  
  /** Whether to require consensus (multiple extractors) */
  require_consensus?: boolean;
  
  /** Minimum acceptable confidence */
  min_confidence?: number;
}

/**
 * Evidence Extraction Result
 * 
 * Result of an extraction operation.
 */
export interface EvidenceExtractionResult {
  request_id: string;
  document_id: string;
  tender_id: string;
  
  /** Evidence atoms extracted */
  evidence_atoms: EvidenceAtom[];
  
  /** Any conflicts detected */
  conflicts: EvidenceConflict[];
  
  /** Relationships discovered */
  relationships: EvidenceRelationship[];
  
  /** Extraction status */
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  
  /** Any error messages */
  errors: string[];
  
  /** Execution time (ms) */
  execution_time_ms: number;
  
  /** Number of fields extracted */
  total_extracted: number;
  
  /** Number of fields that failed */
  total_failed: number;
}

/**
 * Evidence Statistics
 * 
 * Metrics about evidence quality and coverage.
 */
export interface EvidenceStatistics {
  tender_id: string;
  
  // Counts
  total_evidence_atoms: number;
  verified_evidence: number;
  requires_review_evidence: number;
  invalid_evidence: number;
  
  // Confidence
  average_confidence: number;
  min_confidence: number;
  max_confidence: number;
  
  // Conflicts
  total_conflicts: number;
  critical_conflicts: number;
  
  // Coverage
  evidence_types_present: Record<string, number>;
  documents_processed: number;
  bidders_processed: number;
}

/**
 * Evidence Summary (for UI/reporting)
 * 
 * Aggregated view of evidence for a bidder.
 */
export interface EvidenceSummary {
  bidder_id: string;
  tender_id: string;
  
  // Status
  evidence_complete: boolean;
  percent_complete: number;
  
  // Quality
  average_confidence: number;
  conflicts_count: number;
  requires_review_count: number;
  
  // Timeline
  submitted_date: Date;
  last_updated: Date;
  
  // Details
  critical_missing: string[];  // Critical evidence not provided
  confidence_issues: string[]; // Evidence with low confidence
  conflicts_identified: string[]; // Major conflicts found
}

/**
 * Type Guard: Is this a valid EvidenceAtom?
 */
export function isValidEvidenceAtom(obj: any): obj is EvidenceAtom {
  return (
    obj &&
    typeof obj.evidence_id === 'string' &&
    typeof obj.evidence_type === 'string' &&
    typeof obj.extracted_value === 'string' &&
    typeof obj.overall_confidence === 'number' &&
    obj.overall_confidence >= 0 &&
    obj.overall_confidence <= 1 &&
    obj.created_at instanceof Date
  );
}

/**
 * Confidence Threshold Constants
 */
export const CONFIDENCE_THRESHOLDS = {
  VERIFIED_MINIMUM: 0.85,       // Minimum for VERIFIED status
  REVIEW_THRESHOLD: 0.6,        // Below this requires review
  MANUAL_ONLY: 0.3,             // Only for manual extraction
  UNRELIABLE: 0.2,              // Very low, likely wrong
};

/**
 * Evidence Type Registry
 * 
 * Catalog of all possible evidence types with metadata.
 */
export const EVIDENCE_TYPE_REGISTRY: Record<string, {
  name: string;
  data_type: EvidenceDataType;
  required_by_phase: number;  // First phase requiring this evidence
  validation_rules?: string[];
}> = {
  COMPANY_NAME: {
    name: 'Company Name',
    data_type: 'TEXT',
    required_by_phase: 2
  },
  REGISTRATION_NUMBER: {
    name: 'Company Registration Number',
    data_type: 'TEXT',
    required_by_phase: 2
  },
  TAX_ID: {
    name: 'Tax ID / PIN',
    data_type: 'TEXT',
    required_by_phase: 2
  },
  CERTIFICATE_EXPIRY: {
    name: 'Certificate Expiry Date',
    data_type: 'DATE',
    required_by_phase: 2
  },
  FINANCIAL_TURNOVER: {
    name: 'Financial Turnover',
    data_type: 'AMOUNT',
    required_by_phase: 2
  },
  AUTHORIZED_SIGNATORY: {
    name: 'Authorized Signatory',
    data_type: 'TEXT',
    required_by_phase: 2
  },
  SIGNATURE_PRESENT: {
    name: 'Signature Present',
    data_type: 'BOOLEAN',
    required_by_phase: 2
  },
  DOCUMENT_DATE: {
    name: 'Document Date',
    data_type: 'DATE',
    required_by_phase: 2
  },
  PROJECT_EXPERIENCE: {
    name: 'Project Experience',
    data_type: 'TEXT',
    required_by_phase: 3
  },
  EQUIPMENT_LIST: {
    name: 'Equipment List',
    data_type: 'TABLE',
    required_by_phase: 3
  },
  PRICE_BREAKDOWN: {
    name: 'Price Breakdown',
    data_type: 'TABLE',
    required_by_phase: 3
  },
};
