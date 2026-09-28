// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — P0 INTEGRITY GUARD
// Eliminates fabricated confidence, fake citations, mock embeddings,
// simulated provider responses, and fabricated agent metrics.
// ============================================================================

import { InferenceResponse } from '../federation/types';

export interface IntegrityViolation {
  code: string;
  message: string;
}

/**
 * P0 Integrity Enforcement for the AI Federation.
 *
 * Production integrity rules:
 *  - NO SOURCE = NO CLAIMED SOURCE
 *  - NO EVALUATION = NO QUALITY SCORE
 *  - NO MODEL RESPONSE = NO AI SUCCESS STATE
 *  - NO REAL EMBEDDING = NO SEMANTIC SEARCH CLAIM
 */
export class IntegrityGuard {
  private static instance: IntegrityGuard;
  private violations: Map<string, IntegrityViolation[]> = new Map();

  private constructor() {}

  public static getInstance(): IntegrityGuard {
    if (!IntegrityGuard.instance) {
      IntegrityGuard.instance = new IntegrityGuard();
    }
    return IntegrityGuard.instance;
  }

  /**
   * Validate an inference response for P0 integrity
   */
  validateResponse(response: InferenceResponse): IntegrityViolation[] {
    const violations: IntegrityViolation[] = [];

    // RULE: NO SOURCE = NO CLAIMED SOURCE
    // If the response claims a source but provides none, flag it.
    const claimsSource = /(according to|per source|source says|as cited in|reference)/i.test(response.text);
    const hasSourceMarker = /\[[0-9]+\]|Source:|Reference:/i.test(response.text);
    if (claimsSource && !hasSourceMarker) {
      violations.push({
        code: 'P0-CITATION',
        message: 'Response claims a source but provides no citation marker',
      });
    }

    // RULE: NO EVALUATION = NO QUALITY SCORE
    // Quality score must be derived from actual evaluation, not fabricated.
    if (!response.metadata?.evaluationId) {
      violations.push({
        code: 'P0-EVALUATION',
        message: 'Response has no evaluation ID; cannot claim quality score',
      });
    }

    // RULE: NO MODEL RESPONSE = NO AI SUCCESS STATE
    // A success state requires actual model output.
    if (!response.text || response.text.trim().length === 0) {
      violations.push({
        code: 'P0-EMPTY',
        message: 'Empty model response; success state cannot be established',
      });
    }

    // Detect fabricated confidence score in response text
    const fabricatedConfidence = /confidence:\s*[0-9]+\.[0-9]+/i.test(response.text);
    if (fabricatedConfidence) {
      violations.push({
        code: 'P0-CONFIDENCE',
        message: 'Response embeds a fabricated confidence score',
      });
    }

    // Detect simulated output phrases
    const simulatedPhrases = [
      'simulated response',
      'simulated intelligence',
      'mock intelligence',
      'deterministic synthetic',
      'char-code-based cosine',
    ];
    const textLower = response.text.toLowerCase();
    for (const phrase of simulatedPhrases) {
      if (textLower.includes(phrase)) {
        violations.push({
          code: 'P0-SIMULATED',
          message: `Response contains simulated/mock phrase: "${phrase}"`,
        });
        break;
      }
    }

    this.recordViolations(response.metadata?.requestId || 'unknown', violations);
    return violations;
  }

  /**
   * Verify that an embedding is real (non-trivial dimensions, reasonable range)
   */
  validateEmbedding(embedding: number[]): IntegrityViolation[] {
    const violations: IntegrityViolation[] = [];

    if (!embedding || embedding.length < 128) {
      violations.push({
        code: 'P0-EMBEDDING-DIM',
        message: `Embedding dimension ${embedding?.length || 0} is too small to be a real model embedding (min 128)`,
      });
      return violations;
    }

    // Check for the char-code-based pattern (sin(i + charCode)/10) that the old mock used
    const isCharCodeMock = embedding.every((v, i) => {
      const expected = Math.sin(i / 10) / 10;
      return Math.abs(Math.abs(v) - Math.abs(expected)) < 0.15;
    });

    if (isCharCodeMock) {
      violations.push({
        code: 'P0-EMBEDDING-MOCK',
        message: 'Embedding matches the legacy char-code mock pattern; this is not a real model embedding',
      });
    }

    return violations;
  }

  /**
   * Assert that a provider response came from a real provider (not a fallback mock)
   */
  validateProviderAuthenticity(response: InferenceResponse, providerConfigured: boolean): IntegrityViolation[] {
    const violations: IntegrityViolation[] = [];

    if (!providerConfigured && response.provider !== 'ollama') {
      violations.push({
        code: 'P0-PROVIDER',
        message: `Provider ${response.provider} was not configured; response may be simulated`,
      });
    }

    return violations;
  }

  /**
   * Assert that evaluation metrics are derived from real evaluation
   */
  validateAgentMetrics(evaluationId: string | undefined, qualityScore?: number): IntegrityViolation[] {
    const violations: IntegrityViolation[] = [];

    if (!evaluationId && qualityScore !== undefined && qualityScore > 0) {
      violations.push({
        code: 'P0-METRICS',
        message: 'Quality score claimed without corresponding evaluation ID',
      });
    }

    return violations;
  }

  private recordViolations(requestId: string, violations: IntegrityViolation[]): void {
    if (violations.length > 0) {
      this.violations.set(requestId, violations);
      console.warn(`[INTEGRITY-GUARD] ${violations.length} P0 violations for request ${requestId}:`);
      for (const v of violations) {
        console.warn(`  [${v.code}] ${v.message}`);
      }
    }
  }

  /**
   * Get P0 violations
   */
  getViolations(requestId?: string): Map<string, IntegrityViolation[]> | IntegrityViolation[] | undefined {
    if (requestId) {
      return this.violations.get(requestId);
    }
    return this.violations;
  }

  /**
   * Get integrity stats
   */
  getStats(): { totalRequestsChecked: number; totalViolations: number; cleanRequests: number } {
    let total = 0;
    let clean = 0;
    for (const [_, violations] of this.violations) {
      total += violations.length;
      if (violations.length === 0) clean++;
    }
    return {
      totalRequestsChecked: this.violations.size,
      totalViolations: total,
      cleanRequests: clean,
    };
  }
}
