# KETRACO FINANCE INTELLIGENCE — FINANCE DATA MODEL (Phase 01)

**Program:** Salience Atlas / KETRACO Enterprise Intelligence OS
**Module:** Finance Intelligence (FIN-INTEL) — Phase 01 Finance Data Fabric
**Owner:** Office of the CFO — Finance Engineering
**Status:** COMPLETE (evidence-verified)

This document is the canonical Phase 01 Finance data model: domain entities,
canonical field set, database tables (migration 003), and the source-tracking /
idempotency invariants that every finance record must satisfy.

Files that back this document:

- `packages/domain/index.ts` — Finance domain enums + roles + permission actions.
- `backend/finance/types.ts` — Finance contracts (30+ interfaces).
- `backend/database/migration-003-finance-data-fabric.ts` — 19 `finance_*` tables.
- `backend/database/db-core.ts` — migration 003 wired into `runMigrations()`.

---

## 1. UNIVERSAL CANONICAL FIELD SET

Every finance entity supports the source-tracking field set mandated by the
Directive (§4):

```
id, externalId, sourceSystem, sourceRecordId, status,
createdAt, updatedAt, version
```

Plus, where applicable:

```
effectiveDate, organizationId, ownerId, provenanceId
```

## 2. FINANCE DOMAIN ENTITIES

The Phase 01 canonical entity inventory (count 47) modelled in the Knowledge
Graph node vocabulary (`packages/graph-schema/index.ts`):

| # | Entity | Persisted Table | Notes |
|---|---|---|---|
| 1 | FINANCE_SOURCE | finance_sources | Registry entry, never stores credentials |
| 2 | FINANCE_BATCH | finance_batches | batchId/runId/correlationId |
| 3 | FINANCE_RECORD | finance_records | raw + normalized payloads, rawHash/recordVersion |
| 4 | FINANCIAL_PERIOD | finance_* (period ref) | ISO date contract |
| 5 | CHART_OF_ACCOUNTS | — (constraint set) | CoA codeset |
| 6 | ACCOUNT | finance_accounts | UNIQUE(chart_of_accounts_id, code) |
| 7 | COST_CENTRE | finance_cost_centres | UNIQUE(code) |
| 8 | PROFIT_CENTRE | finance_cost_centres | profit-centre flag |
| 9 | DEPARTMENT | (enterprise ontology) | cross-domain |
| 10 | BUDGET | finance_budgets | UNIQUE(code) |
| 11 | BUDGET_LINE | finance_budget_lines | UNIQUE(budget_id, line_number) |
| 12 | BUDGET_REVISION | finance_budget_lines | revision lineage |
| 13 | BUDGET_ALLOCATION | finance_budgets | allocation refs |
| 14 | COMMITMENT | finance_commitments | UNIQUE(idempotency_key) |
| 15 | ENCUMBRANCE | finance_commitments | encumbrance flag |
| 16 | INVOICE | finance_invoices | UNIQUE(idempotency_key) |
| 17 | PAYMENT | finance_payments | UNIQUE(idempotency_key) |
| 18 | RECEIPT | (phase >01) | reserved |
| 19 | JOURNAL | finance_journals | UNIQUE(idempotency_key) |
| 20 | JOURNAL_ENTRY | finance_journals | entry rows |
| 21 | EXPENSE | finance_costs | expense typed rows |
| 22 | REVENUE | (phase >01) | reserved |
| 23 | FUNDING | (phase >01) | reserved |
| 24 | GRANT | (phase >01) | reserved |
| 25 | LOAN | (phase >01) | reserved |
| 26 | LIABILITY | (phase >01) | reserved |
| 27 | RECEIVABLE | (phase >01) | reserved |
| 28 | PAYABLE | (phase >01) | reserved |
| 29 | CASH_ACCOUNT | finance_accounts | account_class CASH |
| 30 | BANK_TRANSACTION | finance_payments | bank tx fields |
| 31 | ASSET_VALUE | finance_costs | CAPEX/asset costs |
| 32 | DEPRECIATION | (phase 07) | reserved |
| 33 | CAPEX | finance_costs (class) | CAPEX-OPEX detection |
| 34 | OPEX | finance_costs (class) | CAPEX-OPEX detection |
| 35 | PROJECT_FINANCE | finance_projects | UNIQUE(project_id) |
| 36 | PROJECT_COST | finance_costs | UNIQUE(source_system, source_record_id) |
| 37 | COST_TO_COMPLETE | finance_forecasts | forecast subject kind PROJECT |
| 38 | FINANCIAL_RISK | finance_risks | UNIQUE(source_system, source_record_id) |
| 39 | FINANCIAL_METRIC | (semantic layer P03) | reserved |
| 40 | FINANCIAL_FORECAST | finance_forecasts | UNIQUE(source_system, source_record_id) |
| 41 | FINANCIAL_DECISION | (phase 11) | reserved |
| 42 | FINANCIAL_REPORT | (phase >01) | reserved |
| 43 | FINANCE_DATA_QUALITY | finance_data_quality | UNIQUE(batch_id, record_id) |
| 44 | FINANCE_DATA_PROFILE | finance_profiles | per-batch statistics |
| 45 | FINANCE_LINEAGE | finance_lineage | source→entity chain |
| 46 | FINANCE_MAPPING | finance_mappings | UNIQUE(finance_entity, remote_entity) |
| 47 | FINANCE_* (bulk event types) | (event catalog) | PHASE11_FINANCE_EVENTS |

## 3. FINANCE ROLES + PERMISSION ACTIONS (§01-01 / §01-18)

`packages/domain/index.ts` L447-L471:

- **FinanceUserRoles (8):** FINANCE_VIEWER, FINANCE_ANALYST, FINANCE_OFFICER,
  FINANCE_MANAGER, FINANCE_DIRECTOR, FINANCE_ADMIN, AUDITOR, EXECUTIVE.
- **FinancePermissionActions (8):** view, create, update, ingest, export,
  configure_source, approve, execute_financial_action.

## 4. DATABASE — MIGRATION 003 (19 TABLES)

Table inventory (all `finance_*`, idempotency-aware):

| Table | Unique / Enforced Keys |
|---|---|
| finance_sources | UNIQUE(source_type, system, name); indexes status + environment |
| finance_batches | index source, status, started_at DESC, correlation_id |
| finance_records | UNIQUE(source_system, source_record_id, record_version) |
| finance_accounts | UNIQUE(chart_of_accounts_id, code); UNIQUE(source_system, source_record_id) |
| finance_cost_centres | UNIQUE(code); UNIQUE(source_system, source_record_id) |
| finance_budgets | UNIQUE(code); UNIQUE(source_system, source_record_id) |
| finance_budget_lines | UNIQUE(budget_id, line_number); UNIQUE(source_system, source_record_id) |
| finance_commitments | UNIQUE(idempotency_key); UNIQUE(source_system, source_record_id) |
| finance_invoices | UNIQUE(idempotency_key); UNIQUE(source_system, source_record_id) |
| finance_payments | UNIQUE(idempotency_key); UNIQUE(source_system, source_record_id) |
| finance_journals | UNIQUE(idempotency_key); UNIQUE(source_system, source_record_id) |
| finance_projects | UNIQUE(project_id); UNIQUE(source_system, source_record_id) |
| finance_costs | UNIQUE(source_system, source_record_id); index project_id |
| finance_forecasts | UNIQUE(source_system, source_record_id); index subject_kind/subject_id |
| finance_risks | UNIQUE(source_system, source_record_id); index level + risk_type |
| finance_lineage | indexes entity, batch, record, flow |
| finance_mappings | UNIQUE(finance_kind, finance_entity_id, remote_domain, remote_kind, remote_id) |
| finance_data_quality | index batch, record, entity |
| finance_profiles | index source_id, batch_id |

All tables carry `is_fixture`, `environment`, `tenant_id` CP-03 columns where
applicable; records persist `sourceSystem + sourceRecordId + batchId +
ingestedAt` on every row so "where did this number come from?" is always
answerable.

## 5. INVARIANTS (Non-Negotiable)

1. Source values are never destroyed — normalized output carries a trace of
   `{ rawValue, normalizedValue, normalizationRule }` (`backend/finance/normalization.ts`).
2. Dates keep the canonical Finance date contract: date-only ISO inputs stay
   date-only (`YYYY-MM-DD`); full datetimes normalize to UTC ISO-8601.
3. Every record upsert is idempotent via the unique keys above; re-ingesting
   the same source records yields the same logical entities.
4. Fixtures are never treated as real: `decorateFixtureMeta` + `fixtureGuard`
   enforce CP-03 (blocked in PROD_MODE with explicit `UNAVAILABLE` state).
5. Entity resolution never guesses — insufficient evidence ⇒ `UNRESOLVED`.