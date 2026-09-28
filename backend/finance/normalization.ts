/**
 * 01-08 — FINANCE NORMALIZATION ENGINE
 *
 * Normalizes raw source records into canonical Finance contracts:
 *   dates, currencies, amounts, account identifiers, cost centres,
 *   projects, suppliers, departments, CAPEX/OPEX, financial periods,
 *   status values.
 *
 * Non-negotiable: Never destroys source values.  Every normalization
 * exposes: { rawValue, normalizedValue, normalizationRule }.
 */

import type { NormalizationTrace } from './types';

export interface NormalizationContext {
  defaultCurrency?: string;
  fiscalYearStart?: string;
  acceptedCurrencies?: string[];
  tenantId?: string;
  actorId?: string;
}

export interface NormalizationResult<T = Record<string, unknown>> {
  normalized: T;
  traces: NormalizationTrace[];
  warnings: string[];
  entityKindHints: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?)?$/;

const CAPEX_HINTS = ['capex', 'capital expenditure', 'capital', 'capex_oversight', 'capitalization'];
const OPEX_HINTS = ['opex', 'operating', 'operational', 'recurring', 'maintenance opex'];

/**
 * Normalize a date into its canonical string form:
 *   - pure date-only ISO ("2026-09-01") stays date-only (fiscal-day granularity,
 *     matches canonical Finance date contract, avoids UTC time-of-day drift)
 *   - full ISO-8601 datetimes normalize to UTC ISO-8601
 *   - Kenya DMY formats ("DD/MM/YYYY" / "DD-MM-YYYY") become UTC date-only
 */
function normalizeDate(value: unknown, field: string, traces: NormalizationTrace[], actorId: string): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;

  if (value instanceof Date) {
    const s = value.toISOString();
    traces.push({ field, rawValue: value, normalizedValue: s, normalizationRule: 'DATE-INSTANCE-ISO', appliedAt: new Date().toISOString(), actor: actorId });
    return s;
  }

  const s = String(value).trim();

  // Pure date-only ISO 8601 — preserve as-is with a UTC identity check.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    if (!isNaN(d.getTime())) {
      traces.push({ field, rawValue: value, normalizedValue: s, normalizationRule: 'ISO-8601-DATE-PARSE', appliedAt: new Date().toISOString(), actor: actorId });
      return s;
    }
  }

  // Full ISO 8601 with or without time component — normalize to UTC ISO-8601.
  if (ISO_DATE.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const iso = d.toISOString();
      traces.push({ field, rawValue: value, normalizedValue: iso, normalizationRule: 'ISO-8601-PARSE', appliedAt: new Date().toISOString(), actor: actorId });
      return iso;
    }
  }

  // Common alt formats — DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const slash = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    const day = Number(d); const month = Number(m) - 1; const year = Number(y);
    const parsed = new Date(Date.UTC(year, month, day));
    if (!isNaN(parsed.getTime())) {
      const dateOnly = parsed.toISOString().slice(0, 10);
      traces.push({ field, rawValue: value, normalizedValue: dateOnly, normalizationRule: 'KENYA-DMY-PARSE', appliedAt: new Date().toISOString(), actor: actorId });
      return dateOnly;
    }
  }

  traces.push({ field, rawValue: value, normalizedValue: null, normalizationRule: 'DATE-PARSE-FAILED', appliedAt: new Date().toISOString(), actor: actorId });
  return undefined;
}

function normalizeAmount(value: unknown, field: string, traces: NormalizationTrace[], actorId: string): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  let s = String(value).trim();
  const negative = s.startsWith('(') && s.endsWith(')');
  s = s.replace(/[\s,]/g, '').replace(/^\(/, '').replace(/\)$/, '').replace(/^KES|KSh|Ksh|USD|EUR|GBP/, '').trim();
  const n = Number(s);
  if (!isNaN(n) && isFinite(n)) {
    const out = negative ? -1 * n : n;
    traces.push({ field, rawValue: value, normalizedValue: out, normalizationRule: 'AMOUNT-NORMALIZE', appliedAt: new Date().toISOString(), actor: actorId });
    return out;
  }
  traces.push({ field, rawValue: value, normalizedValue: null, normalizationRule: 'AMOUNT-PARSE-FAILED', appliedAt: new Date().toISOString(), actor: actorId });
  return undefined;
}

function normalizeCurrency(value: unknown, field: string, traces: NormalizationTrace[], accepted: string[] | undefined, fallback: string, actorId: string): string {
  if (!value) {
    traces.push({ field, rawValue: value, normalizedValue: fallback, normalizationRule: 'CURRENCY-DEFAULT', appliedAt: new Date().toISOString(), actor: actorId });
    return fallback;
  }
  let c = String(value).trim().toUpperCase();
  if (c === 'KSH' || c === 'KES.' || c === 'KENYA SHILLING' || c === 'KSH.') c = 'KES';
  if (c === '$' || c === 'US$') c = 'USD';
  if (accepted && !accepted.includes(c)) {
    traces.push({ field, rawValue: value, normalizedValue: c, normalizationRule: 'CURRENCY-PARSED-NOT-IN-ACCEPTED', appliedAt: new Date().toISOString(), actor: actorId });
  } else {
    traces.push({ field, rawValue: value, normalizedValue: c, normalizationRule: 'CURRENCY-PARSED', appliedAt: new Date().toISOString(), actor: actorId });
  }
  return c;
}

function normalizeString(value: unknown, field: string, rule: string, traces: NormalizationTrace[], actorId: string, coerce = (v: string) => v): string | undefined {
  if (value === null || value === undefined) return undefined;
  const raw = String(value);
  const out = coerce(raw);
  traces.push({ field, rawValue: value, normalizedValue: out, normalizationRule: rule, appliedAt: new Date().toISOString(), actor: actorId });
  return out;
}

function detectCapexOpex(record: Record<string, unknown>): { class: 'CAPEX' | 'OPEX' | 'UNKNOWN'; confidence: number } {
  const hay = JSON.stringify(record).toLowerCase();
  const capex = CAPEX_HINTS.some(h => hay.includes(h));
  const opex = OPEX_HINTS.some(h => hay.includes(h));
  if (capex && !opex) return { class: 'CAPEX', confidence: 0.85 };
  if (opex && !capex) return { class: 'OPEX', confidence: 0.85 };
  if (capex && opex) return { class: 'UNKNOWN', confidence: 0.5 };
  return { class: 'UNKNOWN', confidence: 0.25 };
}

/**
 * Normalize a single raw source record into the canonical Finance payload.
 * The result preserves traces, which must be persisted with the record so
 * Finance users can answer the mandatory "Where did this number come from?"
 * question (§13 / §15).
 */
export function normalizeFinanceRecord(
  raw: Record<string, unknown>,
  entityKindHints: string[],
  context: NormalizationContext = {}
): NormalizationResult {
  const actorId = context.actorId ?? 'system:finance-normalizer';
  const fallbackCurrency = context.defaultCurrency ?? 'KES';
  const traces: NormalizationTrace[] = [];
  const warnings: string[] = [];
  const normalized: Record<string, unknown> = {};

  // Pass 1: Walk known canonical fields.
  const fieldAliases: Record<string, string[]> = {
    amount: ['amount', 'value', 'total', 'netAmount', 'grossAmount'],
    date: ['date', 'postingDate', 'documentDate', 'transactionDate', 'effectiveDate', 'invoiceDate', 'paymentDate'],
    currency: ['currency', 'currencyCode', 'curr', 'ccy'],
    accountCode: ['accountCode', 'account', 'glAccount', 'glCode'],
    costCentre: ['costCentre', 'costCenter', 'cc', 'deptCode'],
    projectCode: ['projectCode', 'projectId', 'project', 'projectCodeReference'],
    supplierCode: ['supplierCode', 'supplierId', 'vendorCode', 'vendorId'],
    contractId: ['contractId', 'contract', 'contractNumber', 'contractReference', 'contractNo'],
    budgetNumber: ['budgetNumber', 'budgetNo', 'budgetReference', 'budgetRef'],
    commitmentNumber: ['commitmentNumber', 'commitmentNo', 'commitmentReference', 'poNumber', 'purchaseOrderNumber', 'purchaseOrder'],
    invoiceNumber: ['invoiceNumber', 'invoiceNo', 'invoiceReference', 'invoiceRef'],
    paymentNumber: ['paymentNumber', 'paymentNo', 'paymentReference', 'paymentRef', 'paymentId'],
    description: ['description', 'narrative', 'remarks', 'details'],
    period: ['period', 'fiscalPeriod', 'fiscalMonth', 'periodId']
  };
  function findField(target: string): unknown | undefined {
    for (const alias of fieldAliases[target]) {
      if (raw[alias] !== undefined) return raw[alias];
    }
    const lower = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
    for (const alias of fieldAliases[target]) {
      if (lower[alias.toLowerCase()] !== undefined) return lower[alias.toLowerCase()];
    }
    return undefined;
  }

  const amountVal = findField('amount');
  if (amountVal !== undefined) {
    const amt = normalizeAmount(amountVal, 'amount', traces, actorId);
    if (amt !== undefined) normalized.amount = amt;
    else warnings.push('amount field present but not parseable');
  }

  const dateVal = findField('date');
  if (dateVal !== undefined) {
    const d = normalizeDate(dateVal, 'date', traces, actorId);
    if (d) normalized.date = d;
    else warnings.push('date field present but not parseable');
  }

  const currencyVal = findField('currency');
  normalized.currency = normalizeCurrency(currencyVal, 'currency', traces, context.acceptedCurrencies, fallbackCurrency, actorId);

  const account = findField('accountCode');
  if (account !== undefined) normalized.accountCode = normalizeString(account, 'accountCode', 'ACCOUNT-TRIM-UPPERCASE', traces, actorId, v => v.trim().toUpperCase());

  const cc = findField('costCentre');
  if (cc !== undefined) normalized.costCentre = normalizeString(cc, 'costCentre', 'COST-CENTRE-TRIM', traces, actorId, v => v.trim());

  const proj = findField('projectCode');
  if (proj !== undefined) normalized.projectCode = normalizeString(proj, 'projectCode', 'PROJECT-CODE-TRIM', traces, actorId, v => v.trim());

  const supp = findField('supplierCode');
  if (supp !== undefined) normalized.supplierCode = normalizeString(supp, 'supplierCode', 'SUPPLIER-CODE-TRIM', traces, actorId, v => v.trim());

  const contract = findField('contractId');
  if (contract !== undefined) normalized.contractId = normalizeString(contract, 'contractId', 'CONTRACT-ID-TRIM', traces, actorId, v => v.trim());

  const budgetNo = findField('budgetNumber');
  if (budgetNo !== undefined) normalized.budgetNumber = normalizeString(budgetNo, 'budgetNumber', 'BUDGET-NUMBER-TRIM', traces, actorId, v => v.trim());

  const commitmentNo = findField('commitmentNumber');
  if (commitmentNo !== undefined) normalized.commitmentNumber = normalizeString(commitmentNo, 'commitmentNumber', 'COMMITMENT-NUMBER-TRIM', traces, actorId, v => v.trim());

  const invoiceNo = findField('invoiceNumber');
  if (invoiceNo !== undefined) normalized.invoiceNumber = normalizeString(invoiceNo, 'invoiceNumber', 'INVOICE-NUMBER-TRIM', traces, actorId, v => v.trim());

  const paymentNo = findField('paymentNumber');
  if (paymentNo !== undefined) normalized.paymentNumber = normalizeString(paymentNo, 'paymentNumber', 'PAYMENT-NUMBER-TRIM', traces, actorId, v => v.trim());

  const desc = findField('description');
  if (desc !== undefined) normalized.description = normalizeString(desc, 'description', 'DESCRIPTION-TRIM', traces, actorId, v => v.trim());

  const period = findField('period');
  if (period !== undefined) normalized.period = normalizeString(period, 'period', 'PERIOD-TRIM', traces, actorId, v => v.trim());

  // Infer CAPEX/OPEX class deterministically from hints; do not guess if ambiguous
  const co = detectCapexOpex(raw);
  if (co.class !== 'UNKNOWN') {
    normalized.capexOpex = co.class;
    traces.push({ field: 'capexOpex', rawValue: null, normalizedValue: co.class, normalizationRule: `CAPEX-OPEX-HINT-SCAN (confidence=${co.confidence})`, appliedAt: new Date().toISOString(), actor: actorId });
  } else {
    warnings.push('CAPEX/OPEX class could not be detected heuristically — left for upstream resolver');
  }

  // Pass 2: Copy remaining fields verbatim under `raw_` prefix so nothing is lost.
  for (const [k, v] of Object.entries(raw)) {
    if (!fieldAliases[k]) normalized[`raw_${k}`] = v;
  }

  // Entity-kind hints are propagated to the resolver / ontology mapper.
  const combinedHints = Array.from(new Set([...entityKindHints, ...(Array.isArray(raw._hints) ? raw._hints : [])]));

  return { normalized, traces, warnings, entityKindHints: combinedHints };
}
