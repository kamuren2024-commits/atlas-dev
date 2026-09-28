/**
 * 01-16 — /api/finance API ROUTES
 * 01-17 — API Contracts (requests/responses typed)
 *
 * Mounted in server.ts as `/api/finance/*`.
 *
 * Reuses Atlas patterns:
 *   authenticate middleware   (§14)
 *   aiGuard                    (§14)
 *   error handling             (§14)
 *   validation                 (§14)
 *   observability              (§14)
 *   authorization (RBAC/ABAC)  (§15 via authorization-service)
 *
 * Minimum routes (spec §14):
 *   GET  /sources
 *   POST /sources
 *   GET  /sources/:id
 *   PATCH /sources/:id
 *   POST /ingestion
 *   GET  /ingestion
 *   GET  /ingestion/:batchId
 *   GET  /quality
 *   GET  /quality/:batchId
 *   GET  /lineage/:entityId
 *   GET  /accounts
 *   GET  /cost-centres
 *   GET  /budgets
 *   GET  /commitments
 *   GET  /invoices
 *   GET  /payments
 *   GET  /projects
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import type { DatabaseCore } from '../database/db-core';
import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import { AuthorizationService } from '../security/authorization-service';
import type { AuditLogger } from '../observability/audit-logger';
import {
  financeSourceRegistry,
  InMemoryFinanceConnector,
  financeConnectorFactory,
  financeObservability
} from './index';
import { runFinanceIngestion } from './ingestion';
import { createAllFinanceRepositories } from './repositories';
import { fixtureGuard, computeDataState } from './fixture-protection';
import { FinanceStateService } from './finance-state-service';
import type { FinanceSourceType, SourceStatus, ConnectionStatus, DataClassification } from './types';

// ----------------------------------------------------------------------
// Route factories — returns an express.Router() wired to the dependencies
// so it can be mounted at `/api/finance` in server.ts.
// ----------------------------------------------------------------------

export interface FinanceApiDeps {
  db: DatabaseCore;
  kg?: KnowledgeGraph;
  authz: AuthorizationService;
  audit: AuditLogger;
}

function ok(res: Response, body: unknown) {
  financeObservability.count('finance_api_calls_2xx', 1);
  res.status(200).json({ ok: true, data: body });
}
function fail(res: Response, status: number, code: string, message: string, details?: unknown) {
  if (status >= 500) financeObservability.count('finance_api_calls_5xx', 1);
  else if (status >= 400) financeObservability.count('finance_api_calls_4xx', 1);
  res.status(status).json({ ok: false, error: { code, message, details } });
}

const resourceFor = (kind: string) =>
  ({
    sources: 'finance_source',
    ingestion: 'finance_ingestion',
    quality: 'finance_quality',
    lineage: 'finance_lineage',
    accounts: 'finance_account',
    'cost-centres': 'finance_cost_centre',
    budgets: 'finance_budget',
    commitments: 'finance_commitment',
    invoices: 'finance_invoice',
    payments: 'finance_payment',
    projects: 'finance_project'
  } as Record<string, string>)[kind] ?? `finance_${kind}`;

/**
 * Extract the authenticated Atlas user from an incoming request.
 * Mirrors the pattern used by the SCM routes.
 */
function extractActor(req: Request): { id: string; roles: string[]; tenantId?: string; organizationId?: string; permissions?: string[] } {
  const u = (req as any).user;
  return {
    id: u?.id ?? u?.userId ?? u?.sub ?? 'anonymous',
    roles: u?.roles ?? u?.role ? [u.role].filter(Boolean) : [],
    tenantId: u?.tenantId,
    organizationId: u?.organizationId,
    permissions: u?.permissions
  };
}

function checkAuthz(
  deps: FinanceApiDeps,
  actor: ReturnType<typeof extractActor>,
  resourceKind: string,
  action: 'view' | 'create' | 'edit' | 'execute' | 'configure',
  attributes: Record<string, unknown> = {}
) {
  const resource = resourceFor(resourceKind);
  const res = deps.authz.evaluate(
    {
      id: actor.id,
      roles: actor.roles,
      tenantId: actor.tenantId,
      organizationId: actor.organizationId,
      permissions: actor.permissions
    },
    `${resource}:${action}`,
    resource,
    attributes
  );
  return res;
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const t0 = performance.now();
    Promise.resolve(fn(req, res, next)).catch(next).finally(() => {
      financeObservability.recordLatency('finance_api_route_ms', performance.now() - t0);
    });
  };
}

export function createFinanceApiRouter(deps: FinanceApiDeps): express.Router {
  const router = express.Router();
  const repos = () => createAllFinanceRepositories(deps.db);

  router.use((_req, _res, next) => {
    financeObservability.count('finance_api_calls_total', 1);
    next();
  });

  // ================================================================
  // SOURCES
  // ================================================================
  router.get('/sources', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const status = (req.query.status as SourceStatus | undefined);
    const isFixture = req.query.isFixture === 'true' ? true : req.query.isFixture === 'false' ? false : undefined;
    // Merge in-memory registry with DB persistence
    const dbSources = await repos().sources.list({ status, isFixture });
    const registrySources = financeSourceRegistry.list(
      status || isFixture ? { status: status as any, isFixture } : undefined
    );
    // Dedupe by sourceId, preferring DB rows
    const byId = new Map(dbSources.map(s => [s.sourceId, s]));
    for (const s of registrySources) if (!byId.has(s.sourceId)) byId.set(s.sourceId, s);
    ok(res, { sources: Array.from(byId.values()) });
  }));

  router.post('/sources', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'configure');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const b = req.body ?? {};
    if (!b.name || !b.sourceType) return fail(res, 400, 'VALIDATION', 'name and sourceType are required');
    const fg = fixtureGuard({ isFixture: !!b.isFixture, environment: b.environment ?? 'development' }, 'POST /sources', actor.id);
    if (fg.blocked) return fail(res, 400, 'CP-03-BLOCKED', fg.reason ?? 'Fixture rejected in PROD_MODE');
    const registered = financeSourceRegistry.register({
      name: b.name,
      sourceType: b.sourceType as FinanceSourceType,
      system: b.system,
      owner: b.owner ?? actor.id,
      dataClassification: b.dataClassification as DataClassification ?? 'FINANCE_SENSITIVE',
      configuration: b.configuration ?? {},
      isFixture: fg.dataState === 'DEVELOPMENT_FIXTURE',
      environment: (b.environment ?? 'development') as any
    });
    if (b.sourceType === 'MANUAL_ENTRY' || b.sourceType === 'EXCEL' || b.sourceType === 'CSV') {
      // Plug in an in-memory empty connector for fixture/data-entry sources so they can be tested.
      financeConnectorFactory.register(b.sourceType, (sourceId) => new InMemoryFinanceConnector(sourceId, b.sourceType, []));
    }
    await repos().sources.insertOrUpdate(registered);
    deps.audit.log(actor.id, 'Finance: Source registered', { sourceId: registered.sourceId, sourceType: registered.sourceType });
    ok(res, registered);
  }));

  router.get('/sources/:id', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const s = (await repos().sources.findById(req.params.id)) ?? financeSourceRegistry.get(req.params.id);
    if (!s) return fail(res, 404, 'NOT_FOUND', `source ${req.params.id} not registered`);
    ok(res, s);
  }));

  router.patch('/sources/:id', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'configure');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const existing = financeSourceRegistry.get(req.params.id) ?? (await repos().sources.findById(req.params.id));
    if (!existing) return fail(res, 404, 'NOT_FOUND', `source ${req.params.id} not registered`);
    const updated = financeSourceRegistry.update(req.params.id, req.body ?? {});
    if (updated) await repos().sources.insertOrUpdate(updated);
    deps.audit.log(actor.id, 'Finance: Source updated', { sourceId: req.params.id });
    ok(res, updated ?? existing);
  }));

  router.post('/sources/:id/test-connection', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const source = financeSourceRegistry.get(req.params.id) ?? (await repos().sources.findById(req.params.id));
    if (!source) return fail(res, 404, 'NOT_FOUND', `source ${req.params.id} not registered`);
    financeSourceRegistry.setConnectionStatus(source.sourceId, 'CONNECTING');
    const connector = financeConnectorFactory.build(source);
    const connect = await connector.connect();
    const auth = connect.ok ? await connector.authenticate() : { ok: false, error: 'connect failed' };
    const valid = auth.ok ? await connector.validateConnection() : { ok: false, error: 'auth failed' };
    const status = valid.ok ? 'CONNECTED' as ConnectionStatus : 'FAILED' as ConnectionStatus;
    financeSourceRegistry.setConnectionStatus(source.sourceId, status);
    if (valid.ok) financeSourceRegistry.markSuccessfulSync(source.sourceId);
    const db = financeSourceRegistry.get(source.sourceId);
    if (db) await repos().sources.insertOrUpdate(db);
    ok(res, { connect, auth, valid, status });
  }));

  // ================================================================
  // INGESTION
  // ================================================================
  router.post('/ingestion', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'ingestion', 'execute', { amountKES: Number(req.body?.amount) || 0 });
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const b = req.body ?? {};
    if (!b.sourceId) return fail(res, 400, 'VALIDATION', 'sourceId is required');
    const result = await runFinanceIngestion(deps.db, {
      sourceId: b.sourceId,
      actorId: actor.id,
      runId: b.runId,
      correlationId: b.correlationId,
      records: b.records,
      fetchOptions: b.fetchOptions,
      entityResolutionProviders: [],
      normalizationContext: b.normalizationContext,
      validationContext: b.validationContext,
      isFixture: !!b.isFixture,
      environment: b.environment ?? 'development',
      tenantId: actor.tenantId,
      kg: deps.kg
    });
    deps.audit.log(actor.id, 'Finance: Ingestion run', {
      batchId: result.batch.batchId, sourceId: result.batch.sourceId,
      recordCount: result.batch.recordCount, successCount: result.batch.successCount,
      status: result.batch.status
    });
    ok(res, result);
  }));

  router.get('/ingestion', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'ingestion', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const sourceId = (req.query.sourceId as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const limit = Math.min(200, Number(req.query.limit ?? 50));
    const batches = await repos().batches.list({ sourceId, status, limit });
    ok(res, { batches });
  }));

  router.get('/ingestion/:batchId', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'ingestion', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const batch = await repos().batches.findById(req.params.batchId);
    if (!batch) return fail(res, 404, 'NOT_FOUND', `batch ${req.params.batchId} not found`);
    const records = await repos().records.listByBatch(batch.batchId, { limit: 500 });
    ok(res, { batch, records });
  }));

  // ================================================================
  // QUALITY
  // ================================================================
  router.get('/quality', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'quality', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const sourceId = (req.query.sourceId as string) || undefined;
    const limit = Math.min(200, Number(req.query.limit ?? 100));
    const rows = sourceId
      ? (await repos().profiles.listBySource(sourceId, limit)).flatMap(async p => (await repos().quality.listByBatch(p.batchId)))
      : [];
    const results = await Promise.all(Array.isArray(rows) ? rows : []);
    const scores = results.flat();
    const realCount = (await repos().batches.list({ limit })).filter(b => !b.isFixture).length;
    const state = computeDataState({ realPresent: realCount > 0, fixtureOnly: realCount === 0, partialRatio: undefined });
    ok(res, { dataState: state, scores: scores.slice(0, limit) });
  }));

  router.get('/quality/:batchId', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'quality', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const scores = await repos().quality.listByBatch(req.params.batchId);
    ok(res, { batchId: req.params.batchId, scores });
  }));

  // ================================================================
  // LINEAGE
  // ================================================================
  router.get('/lineage/entity/:entityKind/:entityId', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'lineage', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const lines = await repos().lineage.forEntity(req.params.entityKind, req.params.entityId);
    ok(res, { entityKind: req.params.entityKind, entityId: req.params.entityId, lineage: lines });
  }));

  router.get('/lineage/batch/:batchId', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'lineage', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    const lines = await repos().lineage.forBatch(req.params.batchId);
    ok(res, { batchId: req.params.batchId, lineage: lines });
  }));

  // ================================================================
  // ENTITY LISTING ROUTES — accounts, cost-centres, budgets,
  // commitments, invoices, payments, projects
  // ================================================================
  const listRoute = (path: string, resourceKind: string, table: string, idColumn: string, fromRow: (r: any) => unknown) => {
    router.get(path, asyncHandler(async (req, res) => {
      const actor = extractActor(req);
      const z = checkAuthz(deps, actor, resourceKind, 'view');
      if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
      const limit = Math.min(200, Number(req.query.limit ?? 50));
      const status = (req.query.status as string) || undefined;
      const sql = `SELECT * FROM ${table} WHERE 1=1 ${status ? 'AND status = ?' : ''} ORDER BY created_at DESC LIMIT ?`;
      const params: unknown[] = [];
      if (status) params.push(status);
      params.push(limit);
      const rows = await deps.db.all(sql, params) as any[];
      const mapped = rows.map(fromRow);
      const fixtureOnly = rows.every(r => r.is_fixture === 1);
      const realPresent = rows.some(r => r.is_fixture !== 1);
      ok(res, {
        dataState: computeDataState({ realPresent, fixtureOnly }),
        count: mapped.length,
        [resourceKind.replace('-', '_')]: mapped
      });
    }));
    router.get(`${path}/:id`, asyncHandler(async (req, res) => {
      const actor = extractActor(req);
      const z = checkAuthz(deps, actor, resourceKind, 'view');
      if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
      const row = await deps.db.get(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [req.params.id]);
      if (!row) return fail(res, 404, 'NOT_FOUND', `${resourceKind} ${req.params.id} not found`);
      ok(res, fromRow(row));
    }));
  };

  listRoute('/accounts', 'accounts', 'finance_accounts', 'account_id', (r) => ({
    accountId: r.account_id, code: r.code, name: r.name, accountClass: r.account_class,
    currency: r.currency, status: r.status, isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/cost-centres', 'cost-centres', 'finance_cost_centres', 'cost_centre_id', (r) => ({
    costCentreId: r.cost_centre_id, code: r.code, name: r.name,
    departmentId: r.department_id, managerId: r.manager_id, currency: r.currency,
    status: r.status, isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/budgets', 'budgets', 'finance_budgets', 'budget_id', (r) => ({
    budgetId: r.budget_id, code: r.code, name: r.name, budgetStatus: r.budget_status,
    departmentId: r.department_id, costCentreId: r.cost_centre_id, projectId: r.project_id,
    currency: r.currency, totalAmount: r.total_amount, approvedAmount: r.approved_amount,
    revisedAmount: r.revised_amount, status: r.status,
    isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/commitments', 'commitments', 'finance_commitments', 'commitment_id', (r) => ({
    commitmentId: r.commitment_id, commitmentNumber: r.commitment_number, commitmentStatus: r.commitment_status,
    projectId: r.project_id, contractId: r.contract_id, supplierId: r.supplier_id,
    originalAmount: r.original_amount, currentAmount: r.current_amount, invoicedAmount: r.invoiced_amount,
    paidAmount: r.paid_amount, currency: r.currency, committedDate: r.committed_date,
    isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/invoices', 'invoices', 'finance_invoices', 'invoice_id', (r) => ({
    invoiceId: r.invoice_id, invoiceNumber: r.invoice_number, supplierId: r.supplier_id,
    commitmentId: r.commitment_id, contractId: r.contract_id,
    invoiceDate: r.invoice_date, dueDate: r.due_date,
    grossAmount: r.gross_amount, netAmount: r.net_amount, paidAmount: r.paid_amount,
    outstandingAmount: r.outstanding_amount, currency: r.currency, invoiceStatus: r.invoice_status,
    isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/payments', 'payments', 'finance_payments', 'payment_id', (r) => ({
    paymentId: r.payment_id, paymentNumber: r.payment_number, paymentStatus: r.payment_status,
    payeeSupplierId: r.payee_supplier_id, cashAccountId: r.cash_account_id,
    amount: r.amount, currency: r.currency, paymentDate: r.payment_date, method: r.method,
    reference: r.reference, bankTransactionId: r.bank_transaction_id,
    isFixture: r.is_fixture === 1, environment: r.environment
  }));
  listRoute('/projects', 'projects', 'finance_projects', 'project_finance_id', (r) => ({
    projectFinanceId: r.project_finance_id, projectId: r.project_id,
    currency: r.currency, approvedBudget: r.approved_budget, revisedBudget: r.revised_budget,
    actualCostToDate: r.actual_cost_to_date, commitmentsTotal: r.commitments_total,
    forecastCostAtCompletion: r.forecast_cost_at_completion,
    financialProgressPct: r.financial_progress_pct, physicalProgressPct: r.physical_progress_pct,
    healthScore: r.health_score, isFixture: r.is_fixture === 1, environment: r.environment
  }));

  // ================================================================
  // HEALTH + OBSERVABILITY
  // ================================================================
  router.get('/health', asyncHandler(async (_req, res) => {
    const sources = financeSourceRegistry.all().length;
    const snap = financeObservability.snapshot();
    ok(res, {
      status: 'OK',
      module: 'finance-data-fabric',
      sources: { registered: sources },
      metrics: snap
    });
  }));

  router.get('/observability', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const z = checkAuthz(deps, actor, 'sources', 'view');
    if (!z.isAuthorized) return fail(res, 403, 'FORBIDDEN', z.reason ?? 'No access');
    ok(res, financeObservability.snapshot());
  }));

  // ================================================================
  // FINANCE COMMAND STATE & FIRST VERTICAL SLICE
  // ================================================================
  router.get('/command-state', asyncHandler(async (_req, res) => {
    const stateService = FinanceStateService.getInstance(deps.db, deps.kg, deps.audit);
    const state = await stateService.getCommandState();
    ok(res, state);
  }));

  router.get('/audit-trail', asyncHandler(async (_req, res) => {
    const stateService = FinanceStateService.getInstance(deps.db, deps.kg, deps.audit);
    const trail = await stateService.getAuditTrail();
    ok(res, trail);
  }));

  router.get('/project-deepdive/:projectId', asyncHandler(async (req, res) => {
    const stateService = FinanceStateService.getInstance(deps.db, deps.kg, deps.audit);
    const state = await stateService.getCommandState();
    if (state.projectDeepDive.projectId === req.params.projectId || req.params.projectId === 'default') {
      ok(res, state.projectDeepDive);
    } else {
      ok(res, state.projectDeepDive);
    }
  }));

  router.post('/actions/execute', asyncHandler(async (req, res) => {
    const actor = extractActor(req);
    const { actionType, payload } = req.body || {};
    if (!actionType) {
      return fail(res, 400, 'BAD_REQUEST', 'actionType is required');
    }
    const stateService = FinanceStateService.getInstance(deps.db, deps.kg, deps.audit);
    const result = await stateService.executeAction(actionType, payload, actor);
    ok(res, result);
  }));

  return router;
}
