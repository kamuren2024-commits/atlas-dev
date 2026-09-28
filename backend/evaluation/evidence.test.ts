/**
 * PHASE 02: EETF EVIDENCE MODEL - UNIT TESTS
 * 
 * Comprehensive tests for:
 * - Evidence schema validation
 * - Confidence scoring
 * - Evidence validation
 * - Temporal validation
 * - Evidence extraction
 * - Database operations
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import {
  EvidenceAtom,
  EvidenceValidationStatus,
  isValidEvidenceAtom,
  CONFIDENCE_THRESHOLDS,
  EVIDENCE_TYPE_REGISTRY
} from '../evaluation/evidence-schema';
import { ConfidenceScorer, buildConfidenceQualityReport } from '../evaluation/confidence-scorer';
import { EvidenceValidator, buildBidderProfile } from '../evaluation/evidence-validator';
import {
  TemporalValidator,
  generateTemporalReport
} from '../evaluation/temporal-validator';
import { EvidenceExtractor } from '../evaluation/evidence-extractor';
import { EvidenceRepository } from '../evaluation/evidence-repository';
import { Phase02EvidenceMigration } from '../database/migration-002-phase-02-evidence';

describe('Phase 02: EETF Evidence Model', () => {
  let db: Database.Database;
  let repository: EvidenceRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    Phase02EvidenceMigration.create(db);
    repository = EvidenceRepository.initialize(db);
  });

  afterEach(() => {
    db.close();
  });

  // ===================================================================
  // EVIDENCE SCHEMA TESTS
  // ===================================================================

  describe('Evidence Schema', () => {
    it('should create valid evidence atom', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date('2026-01-15'),
        extracted_value: 'ACME Corporation',
        normalized_value: 'ACME Corporation',
        extraction_confidence: 0.95,
        ocr_confidence: 0.92,
        consensus_confidence: 0.94,
        format_valid: true,
        overall_confidence: 0.94,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date('2026-01-15'),
        effective_to: new Date('2027-01-15'),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'abc123',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      expect(isValidEvidenceAtom(atom)).toBe(true);
    });

    it('should reject invalid evidence atom', () => {
      const invalid = {
        evidence_id: 'EVI-001',
        // Missing required fields
      };

      expect(isValidEvidenceAtom(invalid)).toBe(false);
    });

    it('should have all registry evidence types', () => {
      expect(Object.keys(EVIDENCE_TYPE_REGISTRY).length).toBeGreaterThan(0);
      expect(EVIDENCE_TYPE_REGISTRY.COMPANY_NAME).toBeDefined();
      expect(EVIDENCE_TYPE_REGISTRY.CERTIFICATE_EXPIRY).toBeDefined();
      expect(EVIDENCE_TYPE_REGISTRY.TAX_ID).toBeDefined();
    });
  });

  // ===================================================================
  // CONFIDENCE SCORER TESTS
  // ===================================================================

  describe('Confidence Scorer', () => {
    it('should calculate high confidence', () => {
      const result = ConfidenceScorer.calculateOverallConfidence(0.95, 0.90, 0.93, true);
      expect(result.overall_confidence).toBeGreaterThan(0.90);
      expect(result.overall_confidence).toBeLessThanOrEqual(1.0);
    });

    it('should reduce confidence for format failures', () => {
      const withFormat = ConfidenceScorer.calculateOverallConfidence(0.9, undefined, undefined, true);
      const withoutFormat = ConfidenceScorer.calculateOverallConfidence(0.9, undefined, undefined, false);
      expect(withFormat.overall_confidence).toBeGreaterThan(withoutFormat.overall_confidence);
    });

    it('should boost confidence for consensus', () => {
      const noConsensus = ConfidenceScorer.calculateOverallConfidence(0.8, undefined, undefined, true);
      const withConsensus = ConfidenceScorer.calculateOverallConfidence(
        0.8,
        undefined,
        0.82,
        true
      );
      expect(withConsensus.overall_confidence).toBeGreaterThanOrEqual(noConsensus.overall_confidence);
    });

    it('should determine validation status', () => {
      const verified = ConfidenceScorer.determineValidationStatus(0.95, true, []);
      expect(verified).toBe('VERIFIED');

      const review = ConfidenceScorer.determineValidationStatus(0.70, true, []);
      expect(review).toBe('REQUIRES_REVIEW');

      const invalid = ConfidenceScorer.determineValidationStatus(0.2, false, ['Bad format']);
      expect(invalid).toBe('REQUIRES_REVIEW');
    });

    it('should score OCR quality', () => {
      const high = ConfidenceScorer.scoreOCRQuality(0.95, 0.90);
      expect(high).toBeGreaterThan(0.85);

      const low = ConfidenceScorer.scoreOCRQuality(0.5, 0.5);
      expect(low).toBeLessThan(0.6);
    });

    it('should score extraction confidence', () => {
      const present = ConfidenceScorer.scoreExtractionConfidence(0.9, true, 'TEXT', 'value');
      expect(present).toBeGreaterThan(0.8);

      const absent = ConfidenceScorer.scoreExtractionConfidence(0.9, false, 'TEXT', '');
      expect(absent).toBeLessThan(0.5);
    });

    it('should score consensus confidence', () => {
      const perfect = ConfidenceScorer.scoreConsensusConfidence([
        { value: 'ACME', confidence: 0.9 },
        { value: 'ACME', confidence: 0.85 }
      ]);
      expect(perfect).toBeGreaterThan(0.9);

      const disagreement = ConfidenceScorer.scoreConsensusConfidence([
        { value: 'ACME', confidence: 0.9 },
        { value: 'DIFFERENT', confidence: 0.8 }
      ]);
      expect(disagreement).toBeLessThan(perfect);
    });

    it('should generate confidence report', () => {
      const atoms: EvidenceAtom[] = [
        {
          evidence_id: 'EVI-001',
          evidence_type: 'COMPANY_NAME',
          data_type: 'TEXT',
          document_id: 'DOC-001',
          document_type: 'BID_SUBMISSION',
          document_date: new Date(),
          extracted_value: 'ACME',
          normalized_value: 'ACME',
          extraction_confidence: 0.95,
          format_valid: true,
          overall_confidence: 0.95,
          validation_status: 'VERIFIED',
          validation_errors: [],
          effective_from: new Date(),
          bidder_id: 'BID-001',
          tender_id: 'TEN-001',
          requirement_ids: [],
          created_at: new Date(),
          created_by: 'test',
          hash: 'hash1',
          immutable: true,
          source_extractor: 'TextExtractor',
          extraction_method: 'TEXT_EXTRACTION'
        }
      ];

      const report = buildConfidenceQualityReport(atoms);
      expect(report.total_evidence).toBe(1);
      expect(report.average_confidence).toBe(0.95);
      expect(report.confidence_distribution.high).toBe(1);
    });
  });

  // ===================================================================
  // EVIDENCE VALIDATOR TESTS
  // ===================================================================

  describe('Evidence Validator', () => {
    it('should validate correct evidence atom', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const result = EvidenceValidator.validateEvidenceAtom(atom);
      expect(result.valid).toBe(true);
      expect(result.status).toBe('VERIFIED');
    });

    it('should detect low confidence', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'Unclear',
        normalized_value: 'Unclear',
        extraction_confidence: 0.3,
        format_valid: true,
        overall_confidence: 0.3,
        validation_status: 'REQUIRES_REVIEW',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const result = EvidenceValidator.validateEvidenceAtom(atom, {
        requireMinimumConfidence: 0.85
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate collection completeness', () => {
      const atom1: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const result = EvidenceValidator.validateCollection([atom1], ['COMPANY_NAME']);
      expect(result.valid).toBe(true);

      const resultMissing = EvidenceValidator.validateCollection([atom1], [
        'COMPANY_NAME',
        'TAX_ID'
      ]);
      expect(resultMissing.valid).toBe(false);
      expect(resultMissing.errors.length).toBeGreaterThan(0);
    });

    it('should build bidder profile', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const profile = buildBidderProfile('BID-001', 'TEN-001', [atom]);
      expect(profile.bidder_id).toBe('BID-001');
      expect(profile.total_evidence).toBe(1);
      expect(profile.verified_evidence).toBe(1);
      expect(profile.validation_status).toBe('VERIFIED');
    });
  });

  // ===================================================================
  // TEMPORAL VALIDATOR TESTS
  // ===================================================================

  describe('Temporal Validator', () => {
    it('should validate certificate expiry', () => {
      const future = new Date();
      future.setDate(future.getDate() + 180);

      const result = TemporalValidator.validateCertificateExpiry(
        future,
        new Date(),
        90
      );
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
      expect(result.days_until_expiry).toBeGreaterThan(170);
    });

    it('should detect expired certificates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 30);

      const result = TemporalValidator.validateCertificateExpiry(
        past,
        new Date(),
        90
      );
      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should validate document date', () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);

      const result = TemporalValidator.validateDocumentDate(past, 365 * 3);
      expect(result.valid).toBe(true);
    });

    it('should reject future-dated documents', () => {
      const future = new Date();
      future.setDate(future.getDate() + 365);

      const result = TemporalValidator.validateDocumentDate(future, 365 * 3);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should generate temporal consistency report', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const report = generateTemporalReport([atom]);
      expect(report.collection_valid).toBe(true);
      expect(report.age_distribution.very_fresh).toBeGreaterThanOrEqual(0);
    });
  });

  // ===================================================================
  // EVIDENCE REPOSITORY TESTS
  // ===================================================================

  describe('Evidence Repository', () => {
    it('should create and retrieve evidence', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      const created = repository.createEvidence(atom);
      expect(created.evidence_id).toBe('EVI-001');

      const retrieved = repository.getEvidenceById('EVI-001');
      expect(retrieved).toBeDefined();
      expect(retrieved?.extracted_value).toBe('ACME');
    });

    it('should query evidence by filters', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      repository.createEvidence(atom);

      const results = repository.queryEvidence({ tender_id: 'TEN-001' });
      expect(results.length).toBe(1);
      expect(results[0].evidence_id).toBe('EVI-001');
    });

    it('should get statistics', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      repository.createEvidence(atom);

      const stats = repository.getStatistics('TEN-001');
      expect(stats.total_evidence).toBe(1);
      expect(stats.verified).toBe(1);
      expect(stats.average_confidence).toBeCloseTo(0.95, 1);
    });

    it('should enforce immutability', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'hash1',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      repository.createEvidence(atom);

      expect(() => repository.deleteEvidence('EVI-001')).toThrow();
    });

    it('should verify integrity with hash', () => {
      const atom: EvidenceAtom = {
        evidence_id: 'EVI-001',
        evidence_type: 'COMPANY_NAME',
        data_type: 'TEXT',
        document_id: 'DOC-001',
        document_type: 'BID_SUBMISSION',
        document_date: new Date(),
        extracted_value: 'ACME',
        normalized_value: 'ACME',
        extraction_confidence: 0.95,
        format_valid: true,
        overall_confidence: 0.95,
        validation_status: 'VERIFIED',
        validation_errors: [],
        effective_from: new Date(),
        bidder_id: 'BID-001',
        tender_id: 'TEN-001',
        requirement_ids: [],
        created_at: new Date(),
        created_by: 'test',
        hash: 'abc123',
        immutable: true,
        source_extractor: 'TextExtractor',
        extraction_method: 'TEXT_EXTRACTION'
      };

      repository.createEvidence(atom);

      const valid = repository.verifyIntegrity('EVI-001', 'abc123');
      expect(valid).toBe(true);

      const invalid = repository.verifyIntegrity('EVI-001', 'wronghash');
      expect(invalid).toBe(false);
    });
  });

  // ===================================================================
  // DATABASE MIGRATION TESTS
  // ===================================================================

  describe('Phase 02 Database Migration', () => {
    it('should verify tables were created', () => {
      const verified = Phase02EvidenceMigration.verify(db);
      expect(verified).toBe(true);
    });

    it('should have correct schema', () => {
      const tableInfo = db.prepare("PRAGMA table_info(evidence)").all();
      const columnNames = (tableInfo as any[]).map(col => col.name);

      expect(columnNames).toContain('evidence_id');
      expect(columnNames).toContain('evidence_type');
      expect(columnNames).toContain('overall_confidence');
      expect(columnNames).toContain('validation_status');
    });
  });
});
