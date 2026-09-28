/**
 * 01-09 — FINANCE VALIDATION ENGINE
 *
 * Validates normalized source records against the canonical Finance
 * contracts.  Severity model: VALID / WARNING / INVALID.
 *
 * INVALID records are quarantined — never silently promoted.
 * Every error surfaces: { record, field, rule, actualValue, expectedCondition, severity }.
 */

import type { ValidationError, ValidationSeverity } from './types';

export interface ValidationContext {
  expectedCurrency?: string[];
  expectedAccounts?: string[];
  expectedCostCentres?: string[];
  expectedProjects?: string[];
  strict?: boolean;
  referenceDate?: string;
  minimumDate?: string;
}

export interface ValidationResult {
  severity: ValidationSeverity;
  errors: ValidationError[];
  summary: { requiredFieldsMissing: number; typeErrors: number; semanticErrors: number; count: number };
}

type Validator = (
  record: Record<string, unknown>,
  recordId: string,
  ctx: ValidationContext,
  errors: ValidationError[]
) => void;

const E = (errors: ValidationError[], args: Omit<ValidationError, 'message'> & { message?: string }) => {
  errors.push({
    message: args.message ?? `${args.rule} failed on ${args.field}`,
    ...args
  });
};

function pushRequired(errors: ValidationError[], recordId: string, record: Record<string, unknown>, field: string, severity: ValidationSeverity = 'INVALID') {
  if (record[field] === undefined || record[field] === null || record[field] === '') {
    E(errors, {
      record: recordId, field, rule: 'REQUIRED-FIELD',
      actualValue: record[field], expectedCondition: `field "${field}" must be non-empty`,
      severity, message: `Missing required field: ${field}`
    });
  }
}

function pushType(errors: ValidationError[], recordId: string, record: Record<string, unknown>, field: string, type: string, severity: ValidationSeverity = 'INVALID') {
  const v = record[field];
  if (v === undefined || v === null) return;
  let ok = false;
  if (type === 'number') ok = typeof v === 'number';
  else if (type === 'string') ok = typeof v === 'string';
  else if (type === 'date') ok = typeof v === 'string' && !isNaN(new Date(v).getTime());
  else if (type === 'currency') ok = typeof v === 'string' && /^[A-Z]{3}$/.test(v);
  if (!ok) {
    E(errors, {
      record: recordId, field, rule: 'TYPE-MISMATCH',
      actualValue: v, expectedCondition: `expected ${type}`, severity
    });
  }
}

function pushAmountPositive(errors: ValidationError[], recordId: string, record: Record<string, unknown>, field = 'amount', severity: ValidationSeverity = 'WARNING') {
  const v = record[field];
  if (typeof v === 'number' && v < 0) {
    E(errors, {
      record: recordId, field, rule: 'AMOUNT-NEGATIVE',
      actualValue: v, expectedCondition: 'amount should be non-negative (debits/credits use signed journals)',
      severity
    });
  }
}

function pushCurrency(errors: ValidationError[], recordId: string, record: Record<string, unknown>, ctx: ValidationContext) {
  if (!ctx.expectedCurrency?.length) return;
  const c = String(record.currency ?? '').toUpperCase();
  if (!c) return;
  if (!ctx.expectedCurrency.includes(c)) {
    E(errors, {
      record: recordId, field: 'currency', rule: 'CURRENCY-NOT-EXPECTED',
      actualValue: c, expectedCondition: `one of ${ctx.expectedCurrency.join(',')}`,
      severity: 'WARNING', message: `Unexpected currency ${c}`
    });
  }
}

function pushDateRange(errors: ValidationError[], recordId: string, record: Record<string, unknown>, field = 'date', ctx: ValidationContext) {
  const v = record[field];
  if (typeof v !== 'string') return;
  const d = new Date(v).getTime();
  if (isNaN(d)) return;
  if (ctx.referenceDate) {
    const ref = new Date(ctx.referenceDate).getTime();
    if (d > ref) {
      E(errors, {
        record: recordId, field, rule: 'DATE-IN-FUTURE',
        actualValue: v, expectedCondition: `≤ ${ctx.referenceDate}`,
        severity: 'WARNING', message: 'Future date — possible post-dated document'
      });
    }
  }
  if (ctx.minimumDate) {
    const m = new Date(ctx.minimumDate).getTime();
    if (d < m) {
      E(errors, {
        record: recordId, field, rule: 'DATE-TOO-OLD',
        actualValue: v, expectedCondition: `≥ ${ctx.minimumDate}`,
        severity: 'WARNING'
      });
    }
  }
}

function pushReferences(errors: ValidationError[], recordId: string, record: Record<string, unknown>, ctx: ValidationContext) {
  if (ctx.expectedAccounts?.length && record.accountCode && !ctx.expectedAccounts.includes(String(record.accountCode))) {
    E(errors, {
      record: recordId, field: 'accountCode', rule: 'ACCOUNT-NOT-IN-CHART',
      actualValue: record.accountCode, expectedCondition: 'account must exist in chart of accounts',
      severity: 'WARNING'
    });
  }
  if (ctx.expectedCostCentres?.length && record.costCentre && !ctx.expectedCostCentres.includes(String(record.costCentre))) {
    E(errors, {
      record: recordId, field: 'costCentre', rule: 'COST-CENTRE-NOT-REGISTERED',
      actualValue: record.costCentre, expectedCondition: 'cost centre must exist in registry',
      severity: 'WARNING'
    });
  }
  if (ctx.expectedProjects?.length && record.projectCode && !ctx.expectedProjects.includes(String(record.projectCode))) {
    E(errors, {
      record: recordId, field: 'projectCode', rule: 'PROJECT-NOT-REGISTERED',
      actualValue: record.projectCode, expectedCondition: 'project must exist in project system',
      severity: 'WARNING'
    });
  }
}

/**
 * Core validators — run in this order.  The strict flag bumps WARNING to INVALID
 * where appropriate.
 */
const CORE_VALIDATORS: Validator[] = [
  (r, id, _ctx, errs) => pushRequired(errs, id, r, 'amount'),
  (r, id, _ctx, errs) => pushType(errs, id, r, 'amount', 'number'),
  (r, id, _ctx, errs) => pushAmountPositive(errs, id, r),
  (r, id, _ctx, errs) => pushType(errs, id, r, 'currency', 'currency'),
  (r, id, _ctx, errs) => pushCurrency(errs, id, r, _ctx),
  (r, id, _ctx, errs) => pushDateRange(errs, id, r, 'date', _ctx),
  (r, id, _ctx, errs) => pushReferences(errs, id, r, _ctx),
  (r, id, _ctx, errs) => {
    // financial semantic: if both projectCode and capexOpex present but capex and no project, warn
    if (r.capexOpex === 'CAPEX' && !r.projectCode) {
      E(errs, {
        record: id, field: 'projectCode', rule: 'CAPEX-REQUIRES-PROJECT',
        actualValue: r.projectCode, expectedCondition: 'CAPEX line must reference a project code',
        severity: _ctx.strict ? 'INVALID' : 'WARNING'
      });
    }
  }
];

export function validateFinanceRecord(
  normalizedRecord: Record<string, unknown>,
  recordId: string,
  ctx: ValidationContext = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  for (const v of CORE_VALIDATORS) v(normalizedRecord, recordId, ctx, errors);

  let severity: ValidationSeverity = 'VALID';
  if (errors.some(e => e.severity === 'INVALID')) severity = 'INVALID';
  else if (errors.some(e => e.severity === 'WARNING')) severity = 'WARNING';

  const summary = {
    requiredFieldsMissing: errors.filter(e => e.rule === 'REQUIRED-FIELD').length,
    typeErrors: errors.filter(e => e.rule.startsWith('TYPE-')).length,
    semanticErrors: errors.filter(e => ['CAPEX-REQUIRES-PROJECT', 'ACCOUNT-NOT-IN-CHART', 'COST-CENTRE-NOT-REGISTERED', 'PROJECT-NOT-REGISTERED', 'CURRENCY-NOT-EXPECTED', 'DATE-IN-FUTURE', 'DATE-TOO-OLD', 'AMOUNT-NEGATIVE'].includes(e.rule)).length,
    count: errors.length
  };

  return { severity, errors, summary };
}

/**
 * Helper: partition a list of validation results into accepted and quarantine buckets
 * for the ingestion pipeline (§01-07 controlled retries + quarantine).
 */
export function partitionValidation<T>(records: T[], validate: (t: T) => ValidationResult): { accepted: T[]; warning: T[]; quarantine: T[] } {
  const accepted: T[] = []; const warning: T[] = []; const quarantine: T[] = [];
  for (const r of records) {
    const s = validate(r).severity;
    if (s === 'VALID') accepted.push(r);
    else if (s === 'WARNING') warning.push(r);
    else quarantine.push(r);
  }
  return { accepted, warning, quarantine };
}
