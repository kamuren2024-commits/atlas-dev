# KETRACO FINANCE INTELLIGENCE — FINANCE API SPEC (Phase 01)

**Program:** Salience Atlas / KETRACO Enterprise Intelligence OS
**Module:** Finance Intelligence (FIN-INTEL) — Phase 01 Finance Data Fabric
**Owner:** Office of the CFO — Finance Engineering
**Status:** COMPLETE (evidence-verified)

Routes mounted under `/api/finance` in `server.ts` (mount block ~L2135-2167),
entry guard `PHASE11_FINANCE_ROUTE_CONTRACTS` (`packages/contracts/index.ts`
L301). Audit: every action logged via `EvaluationAuditService.log(actorId,
'[FINANCE] ' + action, 'SYSTEM', JSON.stringify(attributes ?? {}))`.

## ROUTE SURFACE (verified counts)

- **Declared contract surfaces:** `PHASE11_FINANCE_ROUTE_CONTRACTS` (`packages/contracts/index.ts` L301-L344) = **35 entries**.
- **Handler definitions:** `backend/finance/api-routes.ts` = **16** `router.<verb>` definitions (entity endpoints generated via a loop over 7 resources).
- **Concrete endpoints mounted under `/api/finance`:** **28** — sources (GET/POST/GET:id/PATCH:id + POST :id/test-connection), ingestion (POST/GET/GET:batchId), quality (GET/GET:batchId), lineage (entity + batch), 7 entity resources × 2 (accounts, cost-centres, budgets, commitments, invoices, payments, projects), health, observability.

| # | Concrete endpoint | Method | Purpose |
|---|---|---|---|
| 1 | /api/finance/sources | GET | List finance sources |
| 2 | /api/finance/sources | POST | Register finance source |
| 3 | /api/finance/sources/:id | GET | Get finance source |
| 4 | /api/finance/sources/:id | PATCH | Update finance source |
| 5 | /api/finance/sources/:id/test-connection | POST | Test source connection |
| 6 | /api/finance/ingestion | POST | Trigger ingestion run |
| 7 | /api/finance/ingestion | GET | Ingestion status |
| 8 | /api/finance/ingestion/:batchId | GET | Batch status + records |
| 9 | /api/finance/quality | GET | Data-quality summary |
| 10 | /api/finance/quality/:batchId | GET | Quality per batch |
| 11 | /api/finance/lineage/entity/:entityKind/:entityId | GET | Entity lineage |
| 12 | /api/finance/lineage/batch/:batchId | GET | Batch lineage |
| 13-26 | /api/finance/{accounts,cost-centres,budgets,commitments,invoices,payments,projects}[/:id] | GET | Entity listing + detail |
| 27 | /api/finance/health | GET | Module health |
| 28 | /api/finance/observability | GET | Metrics snapshot |

**Known contract-implementation gap:** contract declares `POST /api/finance/sources/:id/test` while the router registers `POST /api/finance/sources/:id/test-connection`. Functional, but the declared surface string differs — tracked as a Phase 01 known item.

Source registration never accepts or returns credentials (source registry
carries connection metadata only).

## ACCESS CONTROLS

- Read routes: require authenticated KETRACO authority with at least
  `finance:view` / `finance:ingest` capability; ABAC attribute checks 2K/5M/50M
  threshold families applied to approve/execute actions.
- Approve flows (budget/payment/invoice/commitment) enforce creator-based
  segregation of duties (`actorId ?? createdBy ?? approverId`) via
  `backend/security/authorization-service.ts` Policy 5.

## ERROR CONTRACT

- `{ ok: false, error: { code, message } }` — codes include `SOURCE_NOT_FOUND`,
  `BATCH_NOT_FOUND`, `ENTITY_UNRESOLVED`, `SOURCE_UNAVAILABLE_*`,
  `DATABASE_WRITE_FAILED`, `PARSING_FAILED`, CP-03 `PROD_MODE_BLOCKED`.
- Idempotency: writes are upserts keyed on `(source_system, source_record_id,
  record_version)` / `idempotency_key`.