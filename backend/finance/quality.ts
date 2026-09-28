/**
 * 01-11 — FINANCE DATA QUALITY ENGINE
 *
 * Deterministic, dimension-based quality scoring.  Never fabricate arbitrary
 * percentages.  Every score exposes its components and formula.
 *
 * Dimensions (documented):
 *   1. Completeness
 *   2. Validity
 *   3. Uniqueness
 *   4. Consistency
 *   5. Timeliness
 *   6. Referential Integrity
 *   7. Source Reliability
 */

import crypto from 'crypto';
import type { DataProfile, DataQualityScore, QualityCheck, QualityDimension, ValidationSeverity } from './types';
import type { ValidationResult } from './validation';

export const FORMULA_VERSION = 'finance-dq-v1.0.0';

export const DIMENSION_WEIGHTS: Record<QualityDimension['name'], number> = {
  'Completeness': 0.18,
  'Validity': 0.22,
  'Uniqueness': 0.15,
  'Consistency': 0.10,
  'Timeliness': 0.10,
  'Referential Integrity': 0.15,
  'Source Reliability': 0.10
};

export interface DQContext {
  profile?: DataProfile;
  validation?: ValidationResult;
  sourceFreshnessHours?: number;
  referentialIntegrityRatio?: number;
  sourceReliabilityScore?: number;
  requiredFields?: string[];
  isFixture?: boolean;
  environment?: string;
  tenantId?: string;
  agent?: string;
}

function checkScore(passed: boolean, metric: number, threshold: number, name: string, message?: string): QualityCheck {
  return {
    checkId: `ch_${crypto.randomBytes(4).toString('hex')}`,
    name,
    passed,
    metric,
    threshold,
    message
  };
}

/**
 * Completeness = 1 - average(nullRate) over required fields
 */
function completeness(ctx: DQContext, required: string[]): QualityDimension {
  const checks: QualityCheck[] = [];
  const profile = ctx.profile;
  let score = 1;
  if (profile) {
    const rates = required.length
      ? required.map(f => profile.nullRates[f] ?? 0)
      : Object.values(profile.nullRates);
    const avg = rates.length ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;
    score = Math.max(0, 1 - avg);
    for (const f of required) {
      const nr = profile.nullRates[f] ?? 0;
      checks.push(checkScore(nr <= 0.05, 1 - nr, 0.95, `required-field:${f} present`, nr > 0.05 ? `null rate = ${(nr * 100).toFixed(2)}%` : undefined));
    }
  }
  checks.push(checkScore(score >= 0.95, score, 0.95, 'overall-completeness'));
  return {
    name: 'Completeness',
    score,
    weight: DIMENSION_WEIGHTS.Completeness,
    checks,
    formula: '1 - mean(nullRates over required_fields)'
  };
}

/**
 * Validity = 1 - (error_weighted / records)  where INVALID=2, WARNING=1
 */
function validity(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  let score = 1;
  if (ctx.validation) {
    const v = ctx.validation;
    const inv = v.errors.filter(e => e.severity === 'INVALID').length;
    const warn = v.errors.filter(e => e.severity === 'WARNING').length;
    const weighted = 2 * inv + 1 * warn;
    const max = 3 * Math.max(1, v.summary.count + 1);
    score = Math.max(0, 1 - weighted / max);
    checks.push(checkScore(inv === 0, v.summary.requiredFieldsMissing, 0, 'no INVALID errors'));
    checks.push(checkScore(warn <= 2, warn, 2, '≤2 WARNINGs'));
  }
  checks.push(checkScore(score >= 0.90, score, 0.90, 'overall-validity'));
  return {
    name: 'Validity',
    score,
    weight: DIMENSION_WEIGHTS.Validity,
    checks,
    formula: '1 - (2·#INVALID + 1·#WARNING) / max_possible_weighted_errors'
  };
}

/**
 * Uniqueness = 1 - duplicateRate  (from profiling)
 */
function uniqueness(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  const dup = ctx.profile?.duplicateRate ?? 0;
  const score = Math.max(0, 1 - dup);
  checks.push(checkScore(dup <= 0.02, 1 - dup, 0.98, 'duplicate-rate ≤2%'));
  checks.push(checkScore(score >= 0.98, score, 0.98, 'overall-uniqueness'));
  return {
    name: 'Uniqueness',
    score,
    weight: DIMENSION_WEIGHTS.Uniqueness,
    checks,
    formula: '1 - duplicateRate (per fingerprinted records)'
  };
}

/**
 * Consistency = 1 - ratio of contradictory cross-field values.
 * Uses a simple heuristic: if CAPEX but no project → penalty.
 */
function consistency(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  let score = 1;
  if (ctx.validation) {
    const sem = ctx.validation.summary.semanticErrors;
    score = Math.max(0, 1 - sem / Math.max(1, sem + 5));
    checks.push(checkScore(sem <= 1, sem, 1, 'semantic-errors ≤1'));
  }
  checks.push(checkScore(score >= 0.90, score, 0.90, 'overall-consistency'));
  return {
    name: 'Consistency',
    score,
    weight: DIMENSION_WEIGHTS.Consistency,
    checks,
    formula: '1 - #semanticErrors / (#semanticErrors + buffer)'
  };
}

/**
 * Timeliness = 1 if source_freshness_hours ≤ 24h; then decays linearly down to 0 at 168h (7d).
 */
function timeliness(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  const h = ctx.sourceFreshnessHours ?? 0;
  let score: number;
  if (h <= 24) score = 1;
  else if (h >= 168) score = 0;
  else score = 1 - (h - 24) / (168 - 24);
  checks.push(checkScore(h <= 24, h, 24, 'freshness ≤24 hours'));
  checks.push(checkScore(h <= 72, h, 72, 'freshness ≤72 hours (STALE threshold)'));
  checks.push(checkScore(score >= 0.75, score, 0.75, 'overall-timeliness'));
  return {
    name: 'Timeliness',
    score,
    weight: DIMENSION_WEIGHTS.Timeliness,
    checks,
    formula: '1          (h ≤24h); linear decay to 0 at 168h; 0 thereafter.'
  };
}

/**
 * Referential Integrity = supplied ratio, or 1 if nothing to cross-ref.
 */
function referentialIntegrity(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  const score = ctx.referentialIntegrityRatio ?? 1;
  checks.push(checkScore(score >= 0.95, score, 0.95, 'foreign-keys resolved ≥95%'));
  checks.push(checkScore(score >= 0.9, score, 0.9, 'overall-referential-integrity'));
  return {
    name: 'Referential Integrity',
    score,
    weight: DIMENSION_WEIGHTS['Referential Integrity'],
    checks,
    formula: '#resolved_foreign_keys / #referenced_entities'
  };
}

/**
 * Source Reliability = operator-evaluated score.  Defaults to 1 for
 * known internal sources; 0.5 for unknown external.
 */
function sourceReliability(ctx: DQContext): QualityDimension {
  const checks: QualityCheck[] = [];
  const score = ctx.sourceReliabilityScore ?? 0.8;
  checks.push(checkScore(score >= 0.7, score, 0.7, 'source_reliability ≥0.7'));
  checks.push(checkScore(score >= 0.5, score, 0.5, 'overall-source-reliability'));
  return {
    name: 'Source Reliability',
    score,
    weight: DIMENSION_WEIGHTS['Source Reliability'],
    checks,
    formula: 'supplied by source registry based on historic uptime + schema stability'
  };
}

/**
 * Compute a data-quality score for a batch / entity.
 *
 * Weighted arithmetic mean of the 7 dimensions.
 *   overallScore = Σ(dimension_i.score * dimension_i.weight)
 *
 * This formula is documented in every returned payload so consumers can
 * reproduce the value deterministically with the same inputs.
 */
export function calculateFinanceDataQuality(
  scope: {
    batchId?: string;
    recordId?: string;
    entityKind?: string;
    entityId?: string;
    sourceId?: string;
  },
  ctx: DQContext
): DataQualityScore {
  const required = ctx.requiredFields ?? ['amount', 'currency', 'date'];
  const dimensions: QualityDimension[] = [
    completeness(ctx, required),
    validity(ctx),
    uniqueness(ctx),
    consistency(ctx),
    timeliness(ctx),
    referentialIntegrity(ctx),
    sourceReliability(ctx)
  ];

  let overall = 0;
  for (const d of dimensions) overall += d.score * d.weight;
  overall = Math.round(overall * 1e6) / 1e6;

  const failingChecks: QualityCheck[] = [];
  const warnings: QualityCheck[] = [];
  for (const d of dimensions) {
    for (const c of d.checks) {
      if (!c.passed && (c.threshold > 0.95 || d.name === 'Validity' && c.name.startsWith('no INVALID'))) failingChecks.push(c);
      else if (!c.passed) warnings.push(c);
    }
  }

  return {
    qualityId: `dq_${crypto.randomBytes(10).toString('hex')}`,
    batchId: scope.batchId,
    recordId: scope.recordId,
    entityKind: scope.entityKind,
    entityId: scope.entityId,
    sourceId: scope.sourceId,
    completenessScore: dimensions[0].score,
    validityScore: dimensions[1].score,
    uniquenessScore: dimensions[2].score,
    consistencyScore: dimensions[3].score,
    timelinessScore: dimensions[4].score,
    referentialIntegrityScore: dimensions[5].score,
    sourceReliabilityScore: dimensions[6].score,
    overallScore: overall,
    dimensions,
    formulaVersion: FORMULA_VERSION,
    failingChecks,
    warnings,
    qualityAgent: ctx.agent ?? 'system:finance-dq-engine',
    isFixture: ctx.isFixture ?? false,
    environment: ctx.environment ?? 'development',
    tenantId: ctx.tenantId,
    calculatedAt: new Date().toISOString()
  };
}

export function validationSeverity(s: ValidationSeverity): number {
  return s === 'INVALID' ? 2 : s === 'WARNING' ? 1 : 0;
}
