/**
 * 01-13 — FINANCE ONTOLOGY MAPPING
 *
 * Maps normalized Finance records to the KETRACO Enterprise Ontology:
 *
 *   KETRACO → Finance → Budgets / Project Finance / Commitments / Payments / CAPEX / OPEX / Financial Performance
 *
 * Produces OntologyMapping records consumed by the graph sync service (01-14).
 * Never maps with fabricated IDs.
 */

import type { OntologyMapping, ResolutionStatus } from './types';

/**
 * KETRACO Enterprise Ontology classes supported for mapping.
 * Mirrors the authoritative Enterprise Ontology namespaces listed in the
 * Phase 00 audit so that Finance nodes integrate cleanly with the Atlas
 * knowledge graph without creating competing semantics.
 */
export const KETRACO_FINANCE_ONTOLOGY = {
  classes: [
    'FinancialPeriod',
    'Account',
    'ChartOfAccounts',
    'CostCentre',
    'ProfitCentre',
    'Department',
    'Budget',
    'BudgetLine',
    'Commitment',
    'Encumbrance',
    'Invoice',
    'Payment',
    'Receipt',
    'Journal',
    'JournalEntry',
    'Expense',
    'Revenue',
    'Funding',
    'Grant',
    'Loan',
    'Liability',
    'Receivable',
    'Payable',
    'CashAccount',
    'BankTransaction',
    'AssetValue',
    'Depreciation',
    'CAPEX',
    'OPEX',
    'ProjectFinance',
    'ProjectCost',
    'CostToComplete',
    'FinancialRisk',
    'FinancialMetric',
    'FinancialForecast',
    'FinancialDecision',
    'FinancialReport'
  ],
  relationships: [
    { from: 'Budget', rel: 'ALLOCATED_TO', to: 'Project' },
    { from: 'Commitment', rel: 'RELATES_TO', to: 'Contract' },
    { from: 'Commitment', rel: 'ENCUMBERS', to: 'Budget' },
    { from: 'Invoice', rel: 'RELATES_TO', to: 'Commitment' },
    { from: 'Payment', rel: 'SETTLES', to: 'Invoice' },
    { from: 'ProjectCost', rel: 'BELONGS_TO', to: 'Project' },
    { from: 'CAPEX', rel: 'CAPITALIZES', to: 'Asset' },
    { from: 'OPEX', rel: 'RELATES_TO', to: 'Department' },
    { from: 'OPEX', rel: 'RELATES_TO', to: 'Asset' },
    { from: 'OPEX', rel: 'RELATES_TO', to: 'Project' },
    { from: 'FinancialForecast', rel: 'FORECASTS', to: 'FinancialMetric' },
    { from: 'FinancialRisk', rel: 'AFFECTS', to: 'Project' },
    { from: 'FinancialReport', rel: 'REPORTS_ON', to: 'FinancialPeriod' }
  ]
};

export interface OntologyContext {
  entityHints: string[];
  amountField?: string;
  dateField?: string;
  actor?: string;
}

/**
 * Determine the primary ontology class for a normalized record using
 * explicit hints.  If ambiguous → leave unmapped.
 */
export function detectOntologyClass(hints: string[], record: Record<string, unknown>): { class: string; status: ResolutionStatus } {
  const hay = hints.join(' ') + ' ' + (record?.entityKind ?? '') + ' ' + (record?.capexOpex ?? '');
  const lower = hay.toLowerCase();

  const ordered: [RegExp, string][] = [
    [/budget/, 'Budget'],
    [/commitment|encumbrance|po\b|purchase.?order/, 'Commitment'],
    [/invoice/, 'Invoice'],
    [/payment/, 'Payment'],
    [/journal/, 'Journal'],
    [/capex/, 'CAPEX'],
    [/opex/, 'OPEX'],
    [/project.?cost|cost.?project/, 'ProjectCost'],
    [/project.?finance/, 'ProjectFinance'],
    [/risk/, 'FinancialRisk'],
    [/forecast/, 'FinancialForecast'],
    [/metric|kpi/, 'FinancialMetric'],
    [/report/, 'FinancialReport']
  ];
  for (const [r, cls] of ordered) {
    if (r.test(lower)) return { class: cls, status: 'RESOLVED' };
  }
  return { class: 'UnknownFinanceEntity', status: 'UNRESOLVED' };
}

/**
 * Map a normalized record plus its resolver results to the enterprise ontology.
 * Returns an array of OntologyMapping records, one per field-entity binding.
 */
export function mapToOntology(
  normalized: Record<string, unknown>,
  resolverResults: { kind: string; remoteId?: string; remoteKind?: string; status: ResolutionStatus }[],
  ctx: OntologyContext
): OntologyMapping[] {
  const mappings: OntologyMapping[] = [];
  const actor = ctx.actor ?? 'system:finance-ontology-mapper';

  const primary = detectOntologyClass(ctx.entityHints, normalized);
  mappings.push({
    sourceField: '__root__',
    targetOntologyClass: primary.class,
    mappingRule: `PRIMARY_CLASS_DETECT(${ctx.entityHints.join(',') || 'none'})`,
    status: primary.status
  });

  // Cross-domain mappings from resolver results
  for (const r of resolverResults) {
    if (r.status === 'UNRESOLVED' || r.status === 'AMBIGUOUS') {
      mappings.push({
        sourceField: r.kind,
        targetOntologyClass: r.remoteKind ?? 'UnresolvedExternal',
        status: r.status,
        mappingRule: 'RESOLVER_RETURNED_UNRESOLVED'
      });
      continue;
    }
    let target = 'Project';
    if (r.kind === 'supplierCode') target = 'Supplier';
    else if (r.kind === 'costCentre') target = 'CostCentre';
    else if (r.kind === 'accountCode') target = 'Account';
    else if (r.kind === 'assetId') target = 'Asset';
    else if (r.kind === 'department') target = 'Department';
    else if (r.remoteKind) target = r.remoteKind;

    mappings.push({
      sourceField: r.kind,
      targetOntologyClass: target,
      candidateId: r.remoteId,
      mappingRule: `ENTITY-RESOLVER(${r.kind}) → ${target}`,
      status: 'RESOLVED',
      confidence: 0.95
    });
  }

  // Amount → FinancialMetric / FinancialPerformance attribute
  if (normalized.amount !== undefined) {
    mappings.push({
      sourceField: ctx.amountField ?? 'amount',
      targetOntologyClass: primary.class,
      targetOntologyAttribute: 'amount',
      mappingRule: 'AMOUNT-ATTRIBUTE-BIND',
      status: 'RESOLVED',
      confidence: 1
    });
  }
  if (normalized.date) {
    mappings.push({
      sourceField: ctx.dateField ?? 'date',
      targetOntologyClass: 'FinancialPeriod',
      candidateId: String(normalized.period ?? normalized.date),
      mappingRule: 'DATE-FINANCIAL-PERIOD-BIND',
      status: normalized.period ? 'RESOLVED' : 'REQUIRES_REVIEW',
      confidence: normalized.period ? 0.9 : 0.4
    });
  }

  return mappings;
}
