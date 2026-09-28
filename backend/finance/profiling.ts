/**
 * 01-10 — FINANCE DATA PROFILER
 *
 * Computes descriptive statistics over a dataset so downstream quality
 * and analytics services have a baseline:
 *   rowCount, columnCount, nullRate, duplicateRate, uniqueRate,
 *   typeDistribution, dateRange, amountRange, currencyDistribution,
 *   schemaChanges, and likely-field inferences (totals, subtotals,
 *   financial periods, accounts, projects, suppliers, cost centres).
 *
 * Deterministic only.  No stochastic heuristics, no ML guesses.
 */

import crypto from 'crypto';
import type { DataProfile } from './types';

export interface ProfilingInput {
  datasetName: string;
  sourceId: string;
  batchId: string;
  records: Record<string, unknown>[];
  isFixture?: boolean;
  environment?: string;
  tenantId?: string;
  previousSchemaSignature?: string;
}

export interface ProfilingResult {
  profile: DataProfile;
  inferredTotalsFields: string[];
  inferredSubtotalsFields: string[];
  inferredPeriodsFields: string[];
  inferredAccountsFields: string[];
  inferredProjectsFields: string[];
  inferredSuppliersFields: string[];
  inferredCostCentresFields: string[];
}

function typeofValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (v instanceof Date) return 'date';
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return 'date';
    const trimmed = v.replace(/[,\s]/g, '');
    if (trimmed.length > 0 && trimmed.length < 40 && !isNaN(Number(trimmed))) return 'number-string';
    return 'string';
  }
  return typeof v;
}

function hashSignature(schemaRecord: string): string {
  return crypto.createHash('sha256').update(schemaRecord, 'utf8').digest('hex').slice(0, 16);
}

export function profileFinanceDataset(input: ProfilingInput): ProfilingResult {
  const { records } = input;
  const now = new Date().toISOString();
  const rowCount = records.length;
  const columns = new Set<string>();
  for (const r of records) for (const k of Object.keys(r)) columns.add(k);
  const columnCount = columns.size;

  const perColumnNulls: Record<string, number> = {};
  const perColumnUniques: Record<string, Set<string>> = {};
  const perColumnTypes: Record<string, Record<string, number>> = {};
  const perColumnDates: Record<string, string[]> = {};
  const perColumnAmounts: Record<string, number[]> = {};
  const perColumnCurrencies: Record<string, number> = {};

  for (const r of records) {
    for (const col of columns) {
      const v = r[col];
      if (v === undefined || v === null || v === '') {
        perColumnNulls[col] = (perColumnNulls[col] ?? 0) + 1;
        continue;
      }
      const t = typeofValue(v);
      const typeBucket = perColumnTypes[col] ?? ({} as Record<string, number>);
      typeBucket[t] = (typeBucket[t] ?? 0) + 1;
      perColumnTypes[col] = typeBucket;
      const asStr = String(v);
      const uniqSet = perColumnUniques[col] ?? new Set<string>();
      uniqSet.add(asStr);
      perColumnUniques[col] = uniqSet;
      if (t === 'date') {
        const dates = perColumnDates[col] ?? [];
        dates.push(asStr);
        perColumnDates[col] = dates;
      }
      if (t === 'number' || t === 'number-string') {
        const n = Number(asStr.replace(/[,\s]/g, ''));
        if (!isNaN(n)) {
          const amounts = perColumnAmounts[col] ?? [];
          amounts.push(n);
          perColumnAmounts[col] = amounts;
        }
      }
      if (t === 'string' && /^[A-Z]{3}$/.test(asStr)) {
        perColumnCurrencies[asStr] = (perColumnCurrencies[asStr] ?? 0) + 1;
      }
    }
  }

  const nullRates: Record<string, number> = {};
  const uniqueRates: Record<string, number> = {};
  const typeDistribution: Record<string, string> = {};
  for (const col of columns) {
    nullRates[col] = rowCount ? (perColumnNulls[col] ?? 0) / rowCount : 0;
    const uniq = perColumnUniques[col]?.size ?? 0;
    uniqueRates[col] = rowCount ? uniq / rowCount : 0;
    const types = (perColumnTypes[col] ?? {}) as Record<string, number>;
    const entries = Object.entries(types) as [string, number][];
    const dominant = entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'null';
    typeDistribution[col] = dominant;
  }

  // Duplicate rate = count of records whose canonical JSON fingerprint repeats
  const fingerprint = new Map<string, number>();
  for (const r of records) {
    const fp = JSON.stringify(r, Object.keys(r).sort());
    fingerprint.set(fp, (fingerprint.get(fp) ?? 0) + 1);
  }
  const duplicates = Array.from(fingerprint.values()).filter(v => v > 1).reduce((s, v) => s + (v - 1), 0);
  const duplicateRate = rowCount ? duplicates / rowCount : 0;

  // Date + amount ranges
  let dateRange: DataProfile['dateRange'];
  let amountRange: DataProfile['amountRange'];
  let dateColWithMost: string | undefined;
  let dateColCount = 0;
  for (const [c, arr] of Object.entries(perColumnDates)) {
    if (arr.length > dateColCount) { dateColCount = arr.length; dateColWithMost = c; }
  }
  if (dateColWithMost) {
    const sorted = perColumnDates[dateColWithMost].slice().sort();
    dateRange = { min: sorted[0], max: sorted[sorted.length - 1], field: dateColWithMost };
  }
  let amtColWithMost: string | undefined;
  let amtColCount = 0;
  for (const [c, arr] of Object.entries(perColumnAmounts)) {
    if (arr.length > amtColCount) { amtColCount = arr.length; amtColWithMost = c; }
  }
  if (amtColWithMost) {
    const sorted = perColumnAmounts[amtColWithMost].slice().sort((a, b) => a - b);
    amountRange = { min: sorted[0], max: sorted[sorted.length - 1], field: amtColWithMost };
  }

  // Schema change detection — signature = sorted(columns.join(","))
  const schemaRecord = Array.from(columns).sort().join(',');
  const signature = hashSignature(schemaRecord);
  let schemaChangeSignature = signature;
  if (input.previousSchemaSignature && input.previousSchemaSignature !== signature) {
    schemaChangeSignature = `${input.previousSchemaSignature}→${signature}`;
  }

  // Likely field inferences — deterministic name-based heuristics + type matching
  const inferredTotals: string[] = [];
  const inferredSubtotals: string[] = [];
  const inferredPeriods: string[] = [];
  const inferredAccounts: string[] = [];
  const inferredProjects: string[] = [];
  const inferredSuppliers: string[] = [];
  const inferredCostCentres: string[] = [];

  const L = (s: string) => s.toLowerCase();
  for (const c of columns) {
    const lc = L(c);
    if (lc.includes('total') || lc === 'amount' || lc === 'netamount' || lc === 'grossamount') inferredTotals.push(c);
    else if (lc.includes('subtotal') || lc.includes('sub total') || lc.includes('sub_total')) inferredSubtotals.push(c);
    if (lc.includes('period') || lc === 'fiscalmonth' || lc === 'fiscalyear' || lc === 'month') inferredPeriods.push(c);
    if (lc.startsWith('account') || lc.startsWith('gl') || lc.includes('accountcode')) inferredAccounts.push(c);
    if (lc.includes('project') || lc === 'prjcode' || lc === 'projectid') inferredProjects.push(c);
    if (lc.includes('supplier') || lc.includes('vendor')) inferredSuppliers.push(c);
    if (lc.includes('costcentre') || lc.includes('costcenter') || lc === 'cc') inferredCostCentres.push(c);
  }

  const inferredEntities = Array.from(new Set([
    ...(inferredTotals.length ? ['totals'] : []),
    ...(inferredPeriods.length ? ['periods'] : []),
    ...(inferredAccounts.length ? ['accounts'] : []),
    ...(inferredProjects.length ? ['projects'] : []),
    ...(inferredSuppliers.length ? ['suppliers'] : []),
    ...(inferredCostCentres.length ? ['cost_centres'] : [])
  ]));

  const profile: DataProfile = {
    profileId: `prof_${crypto.randomBytes(8).toString('hex')}`,
    sourceId: input.sourceId,
    batchId: input.batchId,
    datasetName: input.datasetName,
    rowCount, columnCount, nullRates, duplicateRate, uniqueRates, typeDistribution,
    dateRange, amountRange,
    currencyDistribution: perColumnCurrencies,
    schemaChangeSignature,
    inferredEntities,
    isFixture: input.isFixture ?? false,
    environment: input.environment ?? 'development',
    tenantId: input.tenantId,
    profiledAt: now
  };

  return {
    profile,
    inferredTotalsFields: inferredTotals,
    inferredSubtotalsFields: inferredSubtotals,
    inferredPeriodsFields: inferredPeriods,
    inferredAccountsFields: inferredAccounts,
    inferredProjectsFields: inferredProjects,
    inferredSuppliersFields: inferredSuppliers,
    inferredCostCentresFields: inferredCostCentres
  };
}
