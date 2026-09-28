/**
 * PHASE 02: EETF EVIDENCE MODEL - EVIDENCE EXTRACTOR
 * 
 * Extracts evidence atoms from documents:
 * - Document classification (BID_SUBMISSION, FINANCIAL_STATEMENTS, etc.)
 * - Field extraction (company name, tax ID, amounts, dates)
 * - Consensus engine (multiple extractors for high-risk fields)
 * - Confidence scoring
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import crypto from 'crypto';
import {
  EvidenceAtom,
  EvidenceExtractionRequest,
  EvidenceExtractionResult,
  ExtractionMethod,
  EVIDENCE_TYPE_REGISTRY,
  CONFIDENCE_THRESHOLDS
} from './evidence-schema';
import { ConfidenceScorer } from './confidence-scorer';
import { EvidenceValidator } from './evidence-validator';
import { TemporalValidator } from './temporal-validator';
import { generateId } from '../../../src/core/shared/crypto';

/**
 * Extraction provider (interface for pluggable extractors)
 */
export interface ExtractionProvider {
  name: string;
  method: ExtractionMethod;
  extract(text: string, fieldTypes: string[]): Promise<Map<string, { value: string; confidence: number }>>;
}

/**
 * EvidenceExtractor - Main extraction coordinator
 */
export class EvidenceExtractor {
  private providers: Map<string, ExtractionProvider> = new Map();
  private static instance: EvidenceExtractor;

  private constructor() {
    // Register default providers
    this.registerProvider(new TextExtractionProvider());
    this.registerProvider(new DateExtractionProvider());
    this.registerProvider(new AmountExtractionProvider());
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EvidenceExtractor {
    if (!this.instance) {
      this.instance = new EvidenceExtractor();
    }
    return this.instance;
  }

  /**
   * Register an extraction provider
   */
  registerProvider(provider: ExtractionProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Extract evidence from document text
   * 
   * Orchestrates:
   * 1. Document classification
   * 2. Field extraction (with optional consensus)
   * 3. Confidence scoring
   * 4. Validation
   * 5. Conflict detection
   */
  async extract(
    request: EvidenceExtractionRequest,
    documentText: string,
    documentDate: Date = new Date()
  ): Promise<EvidenceExtractionResult> {
    const requestId = generateId('EXR');
    const startTime = Date.now();
    const errors: string[] = [];
    const evidenceAtoms: EvidenceAtom[] = [];

    try {
      // =====================================================
      // Step 1: Classify document
      // =====================================================
      const classification = await this.classifyDocument(
        documentText,
        request.document_type
      );

      // =====================================================
      // Step 2: Determine target fields
      // =====================================================
      const targetFields = request.target_evidence_types || this.getDefaultFieldsForDocumentType(classification.type);

      // =====================================================
      // Step 3: Extract fields
      // =====================================================
      const extractedFields = await this.extractFields(
        documentText,
        targetFields,
        request.preferred_extraction_method,
        request.require_consensus ?? true
      );

      // =====================================================
      // Step 4: Create evidence atoms
      // =====================================================
      for (const [fieldType, extraction] of extractedFields.entries()) {
        const registryEntry = EVIDENCE_TYPE_REGISTRY[fieldType];
        if (!registryEntry) {
          errors.push(`Unknown evidence type: ${fieldType}`);
          continue;
        }

        // Calculate confidence
        const confidenceBreakdown = ConfidenceScorer.calculateOverallConfidence(
          extraction.confidence,
          extraction.ocr_confidence,
          extraction.consensus_confidence,
          extraction.format_valid
        );

        // Create evidence atom
        const atom: EvidenceAtom = {
          evidence_id: this.generateEvidenceId(),
          evidence_type: fieldType,
          data_type: registryEntry.data_type,
          document_id: request.document_id,
          document_type: request.document_type,
          document_date: documentDate,
          extracted_value: extraction.raw_value,
          normalized_value: extraction.normalized_value,
          extraction_confidence: extraction.confidence,
          ocr_confidence: extraction.ocr_confidence,
          consensus_confidence: extraction.consensus_confidence,
          format_valid: extraction.format_valid,
          overall_confidence: confidenceBreakdown.overall_confidence,
          validation_status: ConfidenceScorer.determineValidationStatus(
            confidenceBreakdown.overall_confidence,
            extraction.format_valid,
            extraction.validation_errors
          ),
          validation_errors: extraction.validation_errors,
          effective_from: documentDate,
          effective_to: extraction.expiry_date,
          bidder_id: request.bidder_id,
          tender_id: request.tender_id,
          requirement_ids: [],
          created_at: new Date(),
          created_by: 'EvidenceExtractor',
          hash: this.generateHash(extraction.raw_value + documentDate.toISOString()),
          immutable: true,
          source_extractor: extraction.source_extractor,
          extraction_method: extraction.method,
          extraction_context: extraction.context
        };

        // Validate minimum confidence
        if (!request.min_confidence || atom.overall_confidence >= request.min_confidence) {
          evidenceAtoms.push(atom);
        } else {
          errors.push(
            `${fieldType}: confidence ${atom.overall_confidence.toFixed(3)} below minimum ${request.min_confidence}`
          );
        }
      }

      // =====================================================
      // Step 5: Detect conflicts
      // =====================================================
      const conflicts = this.detectConflicts(evidenceAtoms);

      // =====================================================
      // Step 6: Detect relationships
      // =====================================================
      const relationships = this.detectRelationships(evidenceAtoms);

      return {
        request_id: requestId,
        document_id: request.document_id,
        tender_id: request.tender_id,
        evidence_atoms: evidenceAtoms,
        conflicts,
        relationships,
        status: errors.length === 0 ? 'SUCCESS' : evidenceAtoms.length > 0 ? 'PARTIAL' : 'FAILED',
        errors,
        execution_time_ms: Date.now() - startTime,
        total_extracted: evidenceAtoms.length,
        total_failed: errors.length
      };
    } catch (error) {
      return {
        request_id: requestId,
        document_id: request.document_id,
        tender_id: request.tender_id,
        evidence_atoms: evidenceAtoms,
        conflicts: [],
        relationships: [],
        status: 'FAILED',
        errors: [...errors, `Extraction error: ${error instanceof Error ? error.message : String(error)}`],
        execution_time_ms: Date.now() - startTime,
        total_extracted: evidenceAtoms.length,
        total_failed: errors.length
      };
    }
  }

  /**
   * Classify document type
   */
  private async classifyDocument(
    text: string,
    hintType: string
  ): Promise<{ type: string; confidence: number }> {
    // Simple heuristic-based classification (can be replaced with ML model)
    const lowerText = text.toLowerCase();

    const patterns: Record<string, { keywords: string[]; type: string }> = {
      FINANCIAL: {
        keywords: ['revenue', 'profit', 'balance sheet', 'financial', 'statement'],
        type: 'FINANCIAL_STATEMENTS'
      },
      TECHNICAL: {
        keywords: ['technical', 'proposal', 'methodology', 'approach', 'solution'],
        type: 'TECHNICAL_PROPOSAL'
      },
      BID: {
        keywords: ['bid', 'offer', 'price', 'proposal', 'tender'],
        type: 'BID_SUBMISSION'
      },
      CERTIFICATE: {
        keywords: ['certificate', 'cert', 'expiry', 'valid', 'issued'],
        type: 'CERTIFICATE'
      }
    };

    let bestMatch = hintType || 'UNKNOWN';
    let bestScore = 0;

    for (const [, pattern] of Object.entries(patterns)) {
      const score = pattern.keywords.filter(kw => lowerText.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern.type;
      }
    }

    return {
      type: bestMatch,
      confidence: Math.min(1, bestScore * 0.3)
    };
  }

  /**
   * Get default extraction fields for document type
   */
  private getDefaultFieldsForDocumentType(documentType: string): string[] {
    const defaults: Record<string, string[]> = {
      FINANCIAL_STATEMENTS: ['COMPANY_NAME', 'TAX_ID', 'FINANCIAL_TURNOVER'],
      TECHNICAL_PROPOSAL: ['COMPANY_NAME', 'PROJECT_EXPERIENCE', 'EQUIPMENT_LIST'],
      BID_SUBMISSION: ['COMPANY_NAME', 'PRICE_BREAKDOWN', 'SIGNATURE_PRESENT'],
      CERTIFICATE: ['CERTIFICATE_EXPIRY', 'DOCUMENT_DATE']
    };

    return defaults[documentType] || ['COMPANY_NAME'];
  }

  /**
   * Extract fields from document text
   */
  private async extractFields(
    text: string,
    fieldTypes: string[],
    preferredMethod?: ExtractionMethod,
    requireConsensus: boolean = true
  ): Promise<Map<string, {
    raw_value: string;
    normalized_value: string;
    confidence: number;
    ocr_confidence?: number;
    consensus_confidence?: number;
    format_valid: boolean;
    validation_errors: string[];
    expiry_date?: Date;
    source_extractor: string;
    method: ExtractionMethod;
    context?: Record<string, any>;
  }>> {
    const results = new Map<string, any>();

    for (const fieldType of fieldTypes) {
      // Try primary extractor
      const provider = this.selectProvider(fieldType, preferredMethod);
      const extraction = await this.extractField(text, fieldType, provider.name);

      if (requireConsensus && this.needsConsensus(fieldType)) {
        // Try secondary extractor for consensus
        const secondaryProvider = this.selectAlternativeProvider(fieldType, provider.name);
        if (secondaryProvider) {
          const secondaryExtraction = await this.extractField(text, fieldType, secondaryProvider.name);
          // Merge results with consensus scoring
          const merged = this.mergeExtractions(extraction, secondaryExtraction);
          results.set(fieldType, merged);
        } else {
          results.set(fieldType, extraction);
        }
      } else {
        results.set(fieldType, extraction);
      }
    }

    return results;
  }

  /**
   * Extract single field
   */
  private async extractField(
    text: string,
    fieldType: string,
    providerName: string
  ): Promise<{
    raw_value: string;
    normalized_value: string;
    confidence: number;
    ocr_confidence?: number;
    consensus_confidence?: number;
    format_valid: boolean;
    validation_errors: string[];
    expiry_date?: Date;
    source_extractor: string;
    method: ExtractionMethod;
    context?: Record<string, any>;
  }> {
    const provider = this.providers.get(providerName) || Array.from(this.providers.values())[0];
    const fieldMap = await provider.extract(text, [fieldType]);
    const field = fieldMap.get(fieldType);

    if (!field) {
      return {
        raw_value: '',
        normalized_value: '',
        confidence: 0,
        format_valid: false,
        validation_errors: ['No value extracted'],
        source_extractor: provider.name,
        method: provider.method
      };
    }

    const validation = EvidenceValidator.scoreFormatValidity(field.value, 'TEXT');
    const normalized = this.normalizeValue(field.value, fieldType);

    return {
      raw_value: field.value,
      normalized_value: normalized,
      confidence: field.confidence,
      format_valid: validation.valid,
      validation_errors: validation.errors,
      source_extractor: provider.name,
      method: provider.method
    };
  }

  /**
   * Select primary extraction provider
   */
  private selectProvider(fieldType: string, preferred?: ExtractionMethod): ExtractionProvider {
    if (preferred) {
      for (const provider of this.providers.values()) {
        if (provider.method === preferred) return provider;
      }
    }

    // Default selection based on field type
    if (fieldType === 'CERTIFICATE_EXPIRY' || fieldType === 'DOCUMENT_DATE') {
      return this.providers.get('DateExtractor') || Array.from(this.providers.values())[0];
    }
    if (fieldType === 'FINANCIAL_TURNOVER' || fieldType === 'PRICE_BREAKDOWN') {
      return this.providers.get('AmountExtractor') || Array.from(this.providers.values())[0];
    }

    return Array.from(this.providers.values())[0];
  }

  /**
   * Select alternative provider for consensus
   */
  private selectAlternativeProvider(fieldType: string, excludeName: string): ExtractionProvider | null {
    for (const provider of this.providers.values()) {
      if (provider.name !== excludeName) return provider;
    }
    return null;
  }

  /**
   * Does this field need consensus extraction?
   */
  private needsConsensus(fieldType: string): boolean {
    // High-risk fields require consensus
    const highRiskFields = [
      'COMPANY_NAME',
      'FINANCIAL_TURNOVER',
      'TAX_ID',
      'CERTIFICATE_EXPIRY'
    ];
    return highRiskFields.includes(fieldType);
  }

  /**
   * Merge extraction results from multiple providers
   */
  private mergeExtractions(
    primary: any,
    secondary: any
  ): any {
    // If values match, high confidence
    if (primary.raw_value === secondary.raw_value) {
      return {
        ...primary,
        consensus_confidence: Math.max(primary.confidence, secondary.confidence)
      };
    }

    // If values differ, use primary but reduce confidence
    return {
      ...primary,
      consensus_confidence: Math.min(primary.confidence, secondary.confidence) * 0.8
    };
  }

  /**
   * Normalize field value
   */
  private normalizeValue(value: string, fieldType: string): string {
    if (fieldType === 'CERTIFICATE_EXPIRY' || fieldType === 'DOCUMENT_DATE') {
      // Normalize to ISO date
      try {
        const date = new Date(value);
        return date.toISOString().split('T')[0];
      } catch {
        return value;
      }
    }

    if (fieldType === 'FINANCIAL_TURNOVER' || fieldType === 'PRICE_BREAKDOWN') {
      // Normalize to number
      const cleaned = value.replace(/[^0-9.\-]/g, '');
      return cleaned;
    }

    // Text normalization
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Detect conflicts between extracted values
   */
  private detectConflicts(atoms: EvidenceAtom[]): any[] {
    const conflicts = [];
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const conflict = EvidenceValidator.detectConflict(atoms[i], atoms[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    return conflicts;
  }

  /**
   * Detect relationships between extracted values
   */
  private detectRelationships(atoms: EvidenceAtom[]): any[] {
    const relationships = [];

    // Same company across documents
    const companies = new Map<string, EvidenceAtom[]>();
    for (const atom of atoms) {
      if (atom.evidence_type === 'COMPANY_NAME') {
        if (!companies.has(atom.normalized_value)) {
          companies.set(atom.normalized_value, []);
        }
        companies.get(atom.normalized_value)!.push(atom);
      }
    }

    for (const [company, atoms_] of companies.entries()) {
      if (atoms_.length > 1) {
        for (let i = 0; i < atoms_.length - 1; i++) {
          relationships.push({
            relationship_id: generateId('REL'),
            evidence_id_1: atoms_[i].evidence_id,
            evidence_id_2: atoms_[i + 1].evidence_id,
            relationship_type: 'SAME_ENTITY',
            description: `Same company "${company}" in multiple documents`,
            confidence: 0.95,
            created_at: new Date(),
            bidirectional: true
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Generate unique evidence ID
   */
  private generateEvidenceId(): string {
    return generateId('EVI');
  }

  /**
   * Generate content hash
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

/**
 * Default text extraction provider
 */
class TextExtractionProvider implements ExtractionProvider {
  name = 'TextExtractor';
  method: ExtractionMethod = 'TEXT_EXTRACTION';

  async extract(text: string, fieldTypes: string[]): Promise<Map<string, { value: string; confidence: number }>> {
    const results = new Map<string, { value: string; confidence: number }>();

    for (const fieldType of fieldTypes) {
      const pattern = this.getPatternForField(fieldType);
      const match = text.match(pattern);

      if (match) {
        results.set(fieldType, {
          value: match[1].trim(),
          confidence: 0.8
        });
      }
    }

    return results;
  }

  private getPatternForField(fieldType: string): RegExp {
    const patterns: Record<string, RegExp> = {
      COMPANY_NAME: /company\s*(?:name)?:?\s*([^\n]+)/i,
      TAX_ID: /(?:tax\s*id|tin|vat\s*(?:id)?):?\s*([A-Z0-9\-\/]+)/i,
      REGISTRATION_NUMBER: /(?:registration|reg)\s*(?:no|number)?:?\s*([A-Z0-9\-\/]+)/i
    };

    return patterns[fieldType] || /(.+)/;
  }
}

/**
 * Date extraction provider
 */
class DateExtractionProvider implements ExtractionProvider {
  name = 'DateExtractor';
  method: ExtractionMethod = 'TEXT_EXTRACTION';

  async extract(text: string, fieldTypes: string[]): Promise<Map<string, { value: string; confidence: number }>> {
    const results = new Map<string, { value: string; confidence: number }>();

    for (const fieldType of fieldTypes) {
      if (fieldType.includes('DATE') || fieldType.includes('EXPIRY')) {
        const datePattern = /(\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4})/g;
        const matches = text.match(datePattern);

        if (matches && matches.length > 0) {
          // Take last date (usually expiry)
          results.set(fieldType, {
            value: matches[matches.length - 1],
            confidence: 0.75
          });
        }
      }
    }

    return results;
  }
}

/**
 * Amount extraction provider
 */
class AmountExtractionProvider implements ExtractionProvider {
  name = 'AmountExtractor';
  method: ExtractionMethod = 'TEXT_EXTRACTION';

  async extract(text: string, fieldTypes: string[]): Promise<Map<string, { value: string; confidence: number }>> {
    const results = new Map<string, { value: string; confidence: number }>();

    for (const fieldType of fieldTypes) {
      if (fieldType.includes('TURNOVER') || fieldType.includes('PRICE') || fieldType.includes('AMOUNT')) {
        const amountPattern = /([\d,\.]+(?:\s*(?:million|thousand|hundred|crore|lakh))?(?:\s*(?:USD|EUR|GBP|INR))?)/gi;
        const matches = text.match(amountPattern);

        if (matches && matches.length > 0) {
          results.set(fieldType, {
            value: matches[0].trim(),
            confidence: 0.7
          });
        }
      }
    }

    return results;
  }
}
