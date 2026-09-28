/**
 * PHASE 02: EETF EVIDENCE MODEL - EVIDENCE VALIDATOR
 * 
 * Validates evidence atoms for:
 * - Format compliance
 * - Required fields
 * - Cross-document consistency
 * - Temporal validity
 * - Data type correctness
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import {
  EvidenceAtom,
  EvidenceValidationStatus,
  EvidenceConflict,
  ConflictType,
  CONFIDENCE_THRESHOLDS,
  EVIDENCE_TYPE_REGISTRY
} from './evidence-schema';
import { ConfidenceScorer } from './confidence-scorer';
import { generateId } from '../../../src/core/shared/crypto';

/**
 * EvidenceValidator - Comprehensive validation for evidence atoms
 */
export class EvidenceValidator {
  /**
   * Validate a single evidence atom
   * 
   * Checks:
   * - All required fields present
   * - Correct data types
   * - Format compliance
   * - Temporal validity
   * - Confidence thresholds
   */
  static validateEvidenceAtom(
    evidence: EvidenceAtom,
    options: {
      requireMinimumConfidence?: number;
      enforceTemporalValidity?: boolean;
      strictFormatValidation?: boolean;
    } = {}
  ): {
    valid: boolean;
    status: EvidenceValidationStatus;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // =====================================================
    // REQUIRED FIELDS
    // =====================================================
    if (!evidence.evidence_id) {
      errors.push('Missing evidence_id');
    }
    if (!evidence.evidence_type) {
      errors.push('Missing evidence_type');
    }
    if (!evidence.document_id) {
      errors.push('Missing document_id');
    }
    if (!evidence.tender_id) {
      errors.push('Missing tender_id');
    }
    if (evidence.created_at === undefined || !(evidence.created_at instanceof Date)) {
      errors.push('Invalid created_at (must be Date)');
    }

    // =====================================================
    // DATA TYPE VALIDATION
    // =====================================================
    if (evidence.data_type && !this.isValidDataType(evidence.data_type, evidence.extracted_value)) {
      errors.push(`Value does not match data type ${evidence.data_type}`);
    }

    // =====================================================
    // CONFIDENCE VALIDATION
    // =====================================================
    const minConfidence = options.requireMinimumConfidence ?? CONFIDENCE_THRESHOLDS.REVIEW_THRESHOLD;
    if (evidence.overall_confidence < minConfidence) {
      errors.push(`Confidence ${evidence.overall_confidence} below minimum ${minConfidence}`);
    }

    // =====================================================
    // TEMPORAL VALIDITY
    // =====================================================
    if (options.enforceTemporalValidity !== false) {
      const temporalErrors = this.validateTemporalValidity(evidence);
      errors.push(...temporalErrors);
    }

    // =====================================================
    // FORMAT VALIDATION
    // =====================================================
    if (!evidence.format_valid) {
      if (options.strictFormatValidation !== false) {
        errors.push('Format validation failed');
      } else {
        warnings.push('Format validation failed (non-strict mode)');
      }
    }

    // =====================================================
    // IMMUTABILITY
    // =====================================================
    if (!evidence.immutable) {
      warnings.push('Evidence is mutable (should be immutable)');
    }

    // =====================================================
    // HASH VERIFICATION
    // =====================================================
    if (!evidence.hash) {
      warnings.push('Missing content hash (cannot verify integrity)');
    }

    // =====================================================
    // DETERMINE STATUS
    // =====================================================
    let status: EvidenceValidationStatus;
    if (errors.length > 0) {
      status = 'INVALID';
    } else if (evidence.overall_confidence >= CONFIDENCE_THRESHOLDS.VERIFIED_MINIMUM && evidence.format_valid) {
      status = 'VERIFIED';
    } else {
      status = 'REQUIRES_REVIEW';
    }

    return {
      valid: errors.length === 0,
      status,
      errors,
      warnings
    };
  }

  /**
   * Detect conflicts between two evidence atoms
   */
  static detectConflict(
    evidence1: EvidenceAtom,
    evidence2: EvidenceAtom
  ): EvidenceConflict | null {
    // Same field/bidder with different values = contradiction
    if (
      evidence1.evidence_type === evidence2.evidence_type &&
      evidence1.bidder_id === evidence2.bidder_id &&
      evidence1.tender_id === evidence2.tender_id &&
      evidence1.normalized_value !== evidence2.normalized_value
    ) {
      return {
        conflict_id: generateId('CONFLICT'),
        evidence_id_1: evidence1.evidence_id,
        evidence_id_2: evidence2.evidence_id,
        conflict_type: 'CONTRADICTING_VALUES',
        description: `Same field (${evidence1.evidence_type}) has different values: "${evidence1.extracted_value}" vs "${evidence2.extracted_value}"`,
        severity: 'HIGH',
        requires_review: true,
        created_at: new Date(),
        review_status: 'PENDING'
      };
    }

    // Expired document
    if (evidence2.effective_to && new Date() > evidence2.effective_to) {
      return {
        conflict_id: generateId('CONFLICT'),
        evidence_id_1: evidence2.evidence_id,
        conflict_type: 'EXPIRED_DOCUMENT',
        description: `Evidence expired on ${evidence2.effective_to.toISOString()}`,
        severity: 'CRITICAL',
        requires_review: true,
        created_at: new Date(),
        review_status: 'PENDING'
      };
    }

    // Insufficient confidence
    if (evidence1.overall_confidence < CONFIDENCE_THRESHOLDS.REVIEW_THRESHOLD) {
      return {
        conflict_id: generateId('CONFLICT'),
        evidence_id_1: evidence1.evidence_id,
        conflict_type: 'INSUFFICIENT_CONFIDENCE',
        description: `Confidence ${evidence1.overall_confidence} is below review threshold ${CONFIDENCE_THRESHOLDS.REVIEW_THRESHOLD}`,
        severity: 'MEDIUM',
        requires_review: true,
        created_at: new Date(),
        review_status: 'PENDING'
      };
    }

    return null;
  }

  /**
   * Validate temporal properties (dates, expiry)
   */
  private static validateTemporalValidity(evidence: EvidenceAtom): string[] {
    const errors: string[] = [];

    // effective_from must be before effective_to
    if (evidence.effective_to && evidence.effective_from > evidence.effective_to) {
      errors.push('effective_from is after effective_to');
    }

    // Expiry should be in future (unless historical)
    if (evidence.effective_to && evidence.effective_to < new Date()) {
      errors.push(`Evidence expired on ${evidence.effective_to.toISOString()}`);
    }

    // Document date should be reasonable
    if (evidence.document_date) {
      const daysSinceDocument = (new Date().getTime() - evidence.document_date.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDocument > 365 * 10) {
        errors.push('Document is older than 10 years');
      }
      if (evidence.document_date > new Date()) {
        errors.push('Document date is in the future');
      }
    }

    return errors;
  }

  /**
   * Check if value matches data type
   */
  private static isValidDataType(dataType: string, value: string): boolean {
    if (!value) return false;

    switch (dataType) {
      case 'DATE':
        return this.isValidDateFormat(value);
      case 'AMOUNT':
        return this.isValidAmountFormat(value);
      case 'NUMBER':
        return !isNaN(parseFloat(value));
      case 'BOOLEAN':
        return ['true', 'false', 'yes', 'no', '1', '0'].includes(value.toLowerCase());
      case 'TEXT':
        return value.length > 0;
      case 'ENTITY':
        return value.length > 0 && value.length <= 500;
      case 'TABLE':
        return value.length > 0; // Just check non-empty
      case 'IMAGE':
        return true; // Would need actual image validation
      default:
        return false;
    }
  }

  /**
   * Validate date format
   */
  private static isValidDateFormat(value: string): boolean {
    try {
      const date = new Date(value);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Validate amount format
   */
  private static isValidAmountFormat(value: string): boolean {
    // Remove currency and spaces
    const cleaned = value.replace(/[A-Z\s]/gi, '').replace(/,/g, '.');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 && num < 1e15;
  }

  /**
   * Validate consistency across evidence collection
   * 
   * Checks for:
   * - Duplicate submissions
   * - Contradicting values
   * - Missing required evidence
   */
  static validateCollection(
    evidenceAtoms: EvidenceAtom[],
    requiredEvidenceTypes?: string[]
  ): {
    valid: boolean;
    errors: string[];
    conflicts: EvidenceConflict[];
  } {
    const errors: string[] = [];
    const conflicts: EvidenceConflict[] = [];
    const seen = new Map<string, EvidenceAtom>();

    // =====================================================
    // CHECK FOR DUPLICATES
    // =====================================================
    for (const atom of evidenceAtoms) {
      const key = `${atom.bidder_id}|${atom.evidence_type}`;
      if (seen.has(key)) {
        const existing = seen.get(key)!;
        if (existing.normalized_value === atom.normalized_value) {
          const conflict: EvidenceConflict = {
            conflict_id: generateId('CONFLICT'),
            evidence_id_1: existing.evidence_id,
            evidence_id_2: atom.evidence_id,
            conflict_type: 'DUPLICATE_SUBMISSION',
            description: `Same evidence submitted twice: ${atom.evidence_type}`,
            severity: 'MEDIUM',
            requires_review: true,
            created_at: new Date(),
            review_status: 'PENDING'
          };
          conflicts.push(conflict);
        }
      } else {
        seen.set(key, atom);
      }
    }

    // =====================================================
    // CHECK FOR CONTRADICTIONS
    // =====================================================
    for (let i = 0; i < evidenceAtoms.length; i++) {
      for (let j = i + 1; j < evidenceAtoms.length; j++) {
        const conflict = this.detectConflict(evidenceAtoms[i], evidenceAtoms[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    // =====================================================
    // CHECK FOR REQUIRED EVIDENCE
    // =====================================================
    if (requiredEvidenceTypes) {
      const presentTypes = new Set(evidenceAtoms.map(e => e.evidence_type));
      for (const required of requiredEvidenceTypes) {
        if (!presentTypes.has(required)) {
          errors.push(`Missing required evidence type: ${required}`);
          conflicts.push({
            conflict_id: generateId('CONFLICT'),
            evidence_id_1: 'COLLECTION',
            conflict_type: 'MISSING_REQUIRED_FIELD',
            description: `Required evidence type not found: ${required}`,
            severity: 'CRITICAL',
            requires_review: true,
            created_at: new Date(),
            review_status: 'PENDING'
          });
        }
      }
    }

    return {
      valid: errors.length === 0 && conflicts.length === 0,
      errors,
      conflicts
    };
  }

  /**
   * Validate evidence completeness for tender stage
   */
  static validateCompletenessForStage(
    evidenceAtoms: EvidenceAtom[],
    stage: 'TECHNICAL' | 'FINANCIAL' | 'COMMERCIAL',
    schema?: Record<string, { required: boolean; types: string[] }>
  ): {
    complete: boolean;
    missing: string[];
    optional: string[];
  } {
    const stageRequirements: Record<string, string[]> = {
      TECHNICAL: [
        'COMPANY_NAME',
        'REGISTRATION_NUMBER',
        'AUTHORIZED_SIGNATORY',
        'PROJECT_EXPERIENCE',
        'EQUIPMENT_LIST'
      ],
      FINANCIAL: [
        'COMPANY_NAME',
        'TAX_ID',
        'FINANCIAL_TURNOVER',
        'CERTIFICATE_EXPIRY'
      ],
      COMMERCIAL: [
        'COMPANY_NAME',
        'PRICE_BREAKDOWN',
        'SIGNATURE_PRESENT'
      ]
    };

    const required = schema ? Object.keys(schema).filter(k => schema[k].required) : stageRequirements[stage] || [];

    const presentTypes = new Set(evidenceAtoms.map(e => e.evidence_type));
    const missing = required.filter(r => !presentTypes.has(r));

    // Optional = all types in registry for this stage that aren't present
    const stageTypes = Object.keys(EVIDENCE_TYPE_REGISTRY)
      .filter(type => !required.includes(type) && !presentTypes.has(type));

    return {
      complete: missing.length === 0,
      missing,
      optional: stageTypes
    };
  }

  /**
   * Generate human-readable validation report
   */
  static generateReport(
    validationResult: {
      valid: boolean;
      status: EvidenceValidationStatus;
      errors: string[];
      warnings: string[];
    },
    evidence?: EvidenceAtom
  ): string {
    const lines: string[] = [
      `Validation Report for ${evidence?.evidence_type || 'Evidence'}`,
      `Status: ${validationResult.status}`,
      `Valid: ${validationResult.valid}`,
      ''
    ];

    if (evidence) {
      lines.push(`Evidence ID: ${evidence.evidence_id}`);
      lines.push(`Value: ${evidence.extracted_value}`);
      lines.push(`Confidence: ${(evidence.overall_confidence * 100).toFixed(1)}%`);
      lines.push('');
    }

    if (validationResult.errors.length > 0) {
      lines.push('ERRORS:');
      validationResult.errors.forEach(e => lines.push(`  - ${e}`));
      lines.push('');
    }

    if (validationResult.warnings.length > 0) {
      lines.push('WARNINGS:');
      validationResult.warnings.forEach(w => lines.push(`  - ${w}`));
    }

    return lines.join('\n');
  }
}

/**
 * Bidder Evidence Profile
 * 
 * Summary of all evidence for one bidder
 */
export interface BidderEvidenceProfile {
  bidder_id: string;
  tender_id: string;
  evidence_atoms: EvidenceAtom[];
  validation_status: EvidenceValidationStatus;
  total_evidence: number;
  verified_evidence: number;
  requires_review_count: number;
  conflicts_count: number;
  average_confidence: number;
}

/**
 * Build bidder profile from evidence collection
 */
export function buildBidderProfile(
  bidder_id: string,
  tender_id: string,
  evidenceAtoms: EvidenceAtom[]
): BidderEvidenceProfile {
  const verified = evidenceAtoms.filter(e => e.validation_status === 'VERIFIED').length;
  const requiresReview = evidenceAtoms.filter(e => e.validation_status === 'REQUIRES_REVIEW').length;

  // Detect conflicts
  let conflictCount = 0;
  for (let i = 0; i < evidenceAtoms.length; i++) {
    for (let j = i + 1; j < evidenceAtoms.length; j++) {
      if (EvidenceValidator.detectConflict(evidenceAtoms[i], evidenceAtoms[j])) {
        conflictCount++;
      }
    }
  }

  const average = evidenceAtoms.length > 0
    ? evidenceAtoms.reduce((sum, e) => sum + e.overall_confidence, 0) / evidenceAtoms.length
    : 0;

  // Determine overall status
  let status: EvidenceValidationStatus = 'VERIFIED';
  if (conflictCount > 0) status = 'INVALID';
  else if (requiresReview > 0) status = 'REQUIRES_REVIEW';

  return {
    bidder_id,
    tender_id,
    evidence_atoms: evidenceAtoms,
    validation_status: status,
    total_evidence: evidenceAtoms.length,
    verified_evidence: verified,
    requires_review_count: requiresReview,
    conflicts_count: conflictCount,
    average_confidence: average
  };
}
