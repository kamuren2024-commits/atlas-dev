/**
 * PHASE 02: EETF EVIDENCE MODEL - CONFIDENCE SCORER
 * 
 * Calculates composite confidence scores for evidence atoms.
 * Combines:
 * - Model/extractor confidence
 * - OCR confidence (if applicable)
 * - Consensus confidence (if multiple extractors)
 * - Format validation confidence
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import {
  EvidenceAtom,
  ConfidenceBreakdown,
  CONFIDENCE_THRESHOLDS,
  EvidenceValidationStatus
} from './evidence-schema';

/**
 * ConfidenceScorer - Computes composite confidence for evidence
 */
export class ConfidenceScorer {
  /**
   * Default weights for confidence components
   */
  static readonly DEFAULT_WEIGHTS = {
    extraction_confidence: 0.40,    // AI model quality (largest factor)
    ocr_confidence: 0.20,           // OCR quality (if used)
    consensus_confidence: 0.20,     // Agreement across extractors
    format_valid: 0.20              // Format/validation checks
  };

  /**
   * Calculate overall confidence for an evidence atom
   * 
   * Combines multiple confidence signals into single 0-1 score.
   */
  static calculateOverallConfidence(
    extractionConfidence: number,
    ocrConfidence?: number,
    consensusConfidence?: number,
    formatValid: boolean = true,
    weights: Partial<typeof this.DEFAULT_WEIGHTS> = {}
  ): ConfidenceBreakdown {
    // Use defaults if not specified
    const w = { ...this.DEFAULT_WEIGHTS, ...weights };

    // Ensure values are in valid range [0, 1]
    const extraction = Math.max(0, Math.min(1, extractionConfidence));
    const ocr = ocrConfidence ? Math.max(0, Math.min(1, ocrConfidence)) : undefined;
    const consensus = consensusConfidence ? Math.max(0, Math.min(1, consensusConfidence)) : undefined;
    const formatScore = formatValid ? 1.0 : 0.0;

    // Calculate weighted average
    let totalWeight = w.extraction_confidence + w.format_valid;
    let weightedSum = (extraction * w.extraction_confidence) + (formatScore * w.format_valid);

    if (ocr !== undefined) {
      totalWeight += w.ocr_confidence;
      weightedSum += ocr * w.ocr_confidence;
    }

    if (consensus !== undefined) {
      totalWeight += w.consensus_confidence;
      weightedSum += consensus * w.consensus_confidence;
    }

    const overallConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      extraction_confidence: extraction,
      ocr_confidence: ocr,
      consensus_confidence: consensus,
      format_valid: formatValid,
      overall_confidence: Math.max(0, Math.min(1, overallConfidence)),
      calculation_method: 'weighted_average',
      weights: w,
      intermediate_values: {
        extraction_score: extraction,
        ocr_score: ocr || 0,
        consensus_score: consensus || 0,
        format_score: formatScore,
        weighted_sum: weightedSum,
        total_weight: totalWeight
      }
    };
  }

  /**
   * Determine validation status based on confidence and format
   */
  static determineValidationStatus(
    overallConfidence: number,
    formatValid: boolean,
    additionalErrors: string[] = []
  ): EvidenceValidationStatus {
    // If format is invalid, requires review
    if (!formatValid) {
      return 'REQUIRES_REVIEW';
    }

    // If there are validation errors, requires review
    if (additionalErrors.length > 0) {
      return 'REQUIRES_REVIEW';
    }

    // If confidence is high enough, verified
    if (overallConfidence >= CONFIDENCE_THRESHOLDS.VERIFIED_MINIMUM) {
      return 'VERIFIED';
    }

    // If confidence is too low, invalid
    if (overallConfidence < CONFIDENCE_THRESHOLDS.UNRELIABLE) {
      return 'INVALID';
    }

    // Otherwise, requires review
    return 'REQUIRES_REVIEW';
  }

  /**
   * Score OCR quality
   * 
   * Based on character-level accuracy metrics.
   */
  static scoreOCRQuality(
    characterAccuracy: number,      // 0-1, how many chars correct
    layoutConfidence: number = 1.0  // 0-1, how confident in layout
  ): number {
    // Combine character accuracy with layout confidence
    const ocr = (characterAccuracy * 0.7) + (layoutConfidence * 0.3);
    return Math.max(0, Math.min(1, ocr));
  }

  /**
   * Score model/extractor confidence
   * 
   * Based on model output confidence + supporting signals.
   */
  static scoreExtractionConfidence(
    modelConfidence: number,         // 0-1, from model
    fieldPresence: boolean = true,   // Is field present/detected
    expectedType: string = 'TEXT',   // Expected data type
    extractedValue: string = ''      // Value extracted
  ): number {
    // Start with model confidence
    let score = Math.max(0, Math.min(1, modelConfidence));

    // Adjust if field not present
    if (!fieldPresence) {
      score *= 0.5; // Reduce by 50%
    }

    // Adjust based on value characteristics
    if (extractedValue.length === 0) {
      score *= 0.3; // Very low if empty
    } else if (expectedType === 'DATE' && !this.looksLikeDate(extractedValue)) {
      score *= 0.7; // Reduce if doesn't look like date
    } else if (expectedType === 'AMOUNT' && !this.looksLikeAmount(extractedValue)) {
      score *= 0.7; // Reduce if doesn't look like amount
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Score consensus confidence
   * 
   * How much do multiple extractors agree?
   */
  static scoreConsensusConfidence(
    extractorResults: { value: string; confidence: number }[]
  ): number {
    if (extractorResults.length === 0) {
      return 0;
    }

    if (extractorResults.length === 1) {
      // Only one extractor, consensus doesn't apply
      return extractorResults[0].confidence;
    }

    // Check if values are identical (perfect agreement)
    const firstValue = extractorResults[0].value;
    const allIdentical = extractorResults.every(r => r.value === firstValue);

    if (allIdentical) {
      // All agree - high confidence
      const avgConfidence = extractorResults.reduce((sum, r) => sum + r.confidence, 0) / extractorResults.length;
      return Math.min(1, avgConfidence * 1.1); // Boost by 10% for consensus
    }

    // Values differ - check similarity
    const maxConfidence = Math.max(...extractorResults.map(r => r.confidence));
    const similarity = this.computeStringSimilarity(
      extractorResults[0].value,
      extractorResults[1]?.value || extractorResults[0].value
    );

    // Reduce confidence based on disagreement
    if (similarity > 0.9) {
      return maxConfidence * 0.95; // Minor variation
    } else if (similarity > 0.7) {
      return maxConfidence * 0.85; // Some variation
    } else {
      return maxConfidence * 0.6; // Significant disagreement
    }
  }

  /**
   * Score format validity
   * 
   * Does the value match expected format?
   */
  static scoreFormatValidity(
    value: string,
    expectedType: string,
    validationRules?: (value: string) => boolean[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic type validation
    switch (expectedType) {
      case 'DATE':
        if (!this.isValidDate(value)) {
          errors.push('Not a valid date format');
        }
        break;

      case 'AMOUNT':
        if (!this.isValidAmount(value)) {
          errors.push('Not a valid amount format');
        }
        break;

      case 'ENTITY':
        if (value.length === 0) {
          errors.push('Empty value');
        }
        break;

      case 'TEXT':
        if (value.length === 0) {
          errors.push('Empty text');
        }
        break;

      case 'BOOLEAN':
        if (!['true', 'false', 'yes', 'no', '1', '0'].includes(value.toLowerCase())) {
          errors.push('Not a valid boolean value');
        }
        break;
    }

    // Apply custom validation rules
    if (validationRules) {
      const customErrors = validationRules(value);
      errors.push(...customErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper: Check if string looks like a date
   */
  private static looksLikeDate(value: string): boolean {
    // Check for common date patterns: YYYY-MM-DD, DD/MM/YYYY, etc.
    const datePattern = /^\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}$/;
    return datePattern.test(value);
  }

  /**
   * Helper: Check if string looks like an amount
   */
  private static looksLikeAmount(value: string): boolean {
    // Check for number patterns (with or without currency symbols)
    const amountPattern = /^[A-Z]{1,3}\s?[\d,\.\s]+$/i;
    return amountPattern.test(value) || /^\d+([,\.]\d{1,2})?$/.test(value);
  }

  /**
   * Helper: Is valid date?
   */
  private static isValidDate(value: string): boolean {
    // Try to parse as date
    try {
      const parsed = new Date(value);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Helper: Is valid amount?
   */
  private static isValidAmount(value: string): boolean {
    // Remove currency and whitespace
    const cleaned = value.replace(/[A-Z\s]/gi, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 && num < 1e15; // Reasonable range
  }

  /**
   * Helper: Compute string similarity (0-1)
   */
  private static computeStringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) {
      return 1.0; // Both empty
    }

    const editDistance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Helper: Levenshtein distance (edit distance between strings)
   */
  private static levenshteinDistance(s1: string, s2: string): number {
    const costs: Record<string, number> = {};

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }

    return costs[s2.length];
  }

  /**
   * Compute confidence for temporal data
   * 
   * Special handling for dates and time-bound data.
   */
  static scoreTemporalConfidence(
    extractedDate: Date,
    documentDate: Date,
    confidence: number = 0.8
  ): number {
    // Dates far in future are suspicious
    const daysSinceDocument = (extractedDate.getTime() - documentDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceDocument < -100) {
      // Date in past (before document)
      return confidence * 0.5;
    } else if (daysSinceDocument > 10 * 365) {
      // Date more than 10 years in future
      return confidence * 0.7;
    }

    return confidence;
  }

  /**
   * Boost confidence for high-agreement scenarios
   */
  static boostForConsensus(
    baseConfidence: number,
    agreementPercentage: number  // 0-1, how many extractors agree
  ): number {
    // Each 10% agreement above 50% boosts confidence by 5%
    if (agreementPercentage > 0.5) {
      const boost = (agreementPercentage - 0.5) * 0.1; // Max 5% boost
      return Math.min(1, baseConfidence + boost);
    }
    return baseConfidence;
  }
}

/**
 * Confidence Quality Report
 * 
 * Summarizes confidence metrics across evidence collection.
 */
export interface ConfidenceQualityReport {
  total_evidence: number;
  average_confidence: number;
  confidence_distribution: {
    high: number;     // >= 0.85
    medium: number;   // 0.6-0.85
    low: number;      // < 0.6
  };
  extraction_methods_used: string[];
  ocr_used_for: number;
  consensus_reached: number;
  format_valid_percentage: number;
}

/**
 * Build quality report from evidence collection
 */
export function buildConfidenceQualityReport(
  evidenceAtoms: EvidenceAtom[]
): ConfidenceQualityReport {
  if (evidenceAtoms.length === 0) {
    return {
      total_evidence: 0,
      average_confidence: 0,
      confidence_distribution: { high: 0, medium: 0, low: 0 },
      extraction_methods_used: [],
      ocr_used_for: 0,
      consensus_reached: 0,
      format_valid_percentage: 0
    };
  }

  const confidenceValues = evidenceAtoms.map(e => e.overall_confidence);
  const average = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;

  const distribution = {
    high: confidenceValues.filter(c => c >= 0.85).length,
    medium: confidenceValues.filter(c => c >= 0.6 && c < 0.85).length,
    low: confidenceValues.filter(c => c < 0.6).length
  };

  const extractionMethods = Array.from(new Set(evidenceAtoms.map(e => e.extraction_method)));
  const ocrCount = evidenceAtoms.filter(e => e.extraction_method === 'OCR').length;
  const consensusCount = evidenceAtoms.filter(e => e.consensus_confidence !== undefined).length;
  const formatValidCount = evidenceAtoms.filter(e => e.format_valid).length;

  return {
    total_evidence: evidenceAtoms.length,
    average_confidence: average,
    confidence_distribution: distribution,
    extraction_methods_used: extractionMethods,
    ocr_used_for: ocrCount,
    consensus_reached: consensusCount,
    format_valid_percentage: (formatValidCount / evidenceAtoms.length) * 100
  };
}
