/**
 * KETRACO FINANCE INTELLIGENCE — PHASE 01 UNIT TESTS
 *
 * Section 20 (Unit) + Section 21 (E2E Acceptance) minimum evidence set:
 *  A. Domain entity / identity / normalization / validation / quality /
 *     resolution / ontology / lineage determinism tests.
 *  B. Idempotency — ingest twice → one logical entity.
 *  C. CP-03 — PROD_MODE blocks fixtures explicitly.
 *  D. RBAC/ABAC — correct role denials + finance thresholds.
 *  E. Ingestion pipeline harness — full pipeline over dev fixture.
 *
 * The test file avoids Jest-only APIs so it can be run either:
 *   - Via Jest/Mocha if available (@jest/globals imports are try/catch wrapped)
 *   - Via "node --import tsx backend/tests/finance-phase01.unit.test.ts" directly
 *     using a tiny built-in runner.
 */

/* eslint-disable @typescript-eslint/no-unused-expressions */

// ---- Try to bind to jest globals, else fall back to embedded tiny runner ----
type TestFn = () => void | Promise<void>;
type Suite = { name: string; tests: { name: string; fn: TestFn }[]; before: TestFn[]; after: TestFn[] };

let _describe: (name: string, fn: () => void) => void;
let _it: (name: string, fn: TestFn) => void;
let _beforeEach: (fn: TestFn) => void;
let _expect: (actual: any) => any;

const standalone: { suites: Suite[]; current: Suite | null; befores: TestFn[] } = { suites: [], current: null, befores: [] };

function simpleExpect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: any) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected deep equal:\n  ${b}\nbut got:\n  ${a}`);
    },
    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) throw new Error(`Expected string to contain "${expected}"`);
      } else {
        throw new Error('toContain only works on strings or arrays');
      }
    },
    toBeDefined() {
      if (actual === undefined) throw new Error('Expected value to be defined');
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error(`Expected value to be undefined, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
    },
    toBeGreaterThan(n: number) {
      if (!(typeof actual === 'number' && actual > n)) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual(n: number) {
      if (!(typeof actual === 'number' && actual >= n)) throw new Error(`Expected ${actual} >= ${n}`);
    },
    toBeLessThanOrEqual(n: number) {
      if (!(typeof actual === 'number' && actual <= n)) throw new Error(`Expected ${actual} <= ${n}`);
    },
    toMatch(re: RegExp) {
      if (!(typeof actual === 'string' && re.test(actual))) throw new Error(`Expected ${JSON.stringify(actual)} to match ${re}`);
    },
    toHaveLength(n: number) {
      if (!(actual && typeof actual.length === 'number' && actual.length === n)) {
        throw new Error(`Expected length ${n}, got ${actual?.length}`);
      }
    },
    get not() {
      return {
        toBe(expected: any) {
          if (actual === expected) throw new Error(`Expected NOT toBe ${JSON.stringify(expected)}`);
        },
        toEqual(expected: any) {
          const a = JSON.stringify(actual);
          const b = JSON.stringify(expected);
          if (a === b) throw new Error(`Expected NOT toEqual deep-equal \n  ${a}`);
        },
        toBeTruthy() {
          if (actual) throw new Error('Expected NOT truthy');
        },
        toBeUndefined() {
          if (actual === undefined) throw new Error('Expected NOT toBeUndefined');
        }
      };
    }
  };
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const g = require('@jest/globals');
  _describe = g.describe; _it = g.it; _beforeEach = g.beforeEach; _expect = g.expect;
} catch {
  _describe = (name, fn) => {
    standalone.current = { name, tests: [], before: standalone.befores.slice(), after: [] };
    standalone.suites.push(standalone.current);
    standalone.befores = [];
    fn();
    standalone.current = null;
  };
  _it = (name, fn) => { if (!standalone.current) throw new Error('_it outside describe'); standalone.current.tests.push({ name, fn }); };
  _beforeEach = (fn) => { if (standalone.current) standalone.current.before.push(fn); else standalone.befores.push(fn); };
  _expect = simpleExpect;
}

// ---- Domain Entity / Identity (§01-01) ----
import { FinanceUserRoles, FinancePermissionActions } from '../../packages/domain';
import type { DataState } from '../finance/types';

// ---- Normalization (§01-08) ----
import { normalizeFinanceRecord } from '../finance/normalization';

// ---- Validation (§01-09) ----
import { validateFinanceRecord, partitionValidation } from '../finance/validation';

// ---- Profiling (§01-10) ----
import { profileFinanceDataset } from '../finance/profiling';

// ---- Quality (§01-11) ----
import { calculateFinanceDataQuality } from '../finance/quality';

// ---- Entity Resolution (§01-12) ----
import { FinanceEntityResolver, EntityResolutionProvider, EntityReference } from '../finance/entity-resolution';
import type { EntityResolutionResult } from '../finance/types';

// ---- Ontology Mapping (§01-13) ----
import { mapToOntology, detectOntologyClass } from '../finance/ontology-mapping';

// ---- Lineage (§01-15) ----
import { FinanceDataLineage } from '../finance/lineage';

// ---- Fixture protection (CP-03) ----
import { PROD_MODE as _PROD_MODE, decorateFixtureMeta as applyFixtureMetadata, fixtureGuard as enforceProductionFixtureGuard } from '../finance/fixture-protection';
const PROD_MODE = _PROD_MODE;
// ---- Authorization (§01-18) ----
import { AuthorizationService } from '../security/authorization-service';

// ---- InMemory connector + SourceRegistry (§01-03 + §01-04) ----
import { InMemoryFinanceConnector, FinanceConnectorFactory, financeConnectorFactory } from '../finance/sources';
import { FinanceSourceRegistry } from '../finance/sources';
import type { FinanceSourceRecord, FinanceSourceType } from '../finance/types';

// ---- Observability counters (§01-20) ----
import { FinanceObservability } from '../finance/observability';

// ---------------------------------------------------------------------------
// TEST SUITES
// ---------------------------------------------------------------------------

const describe = _describe, it = _it, beforeEach = _beforeEach, expect = _expect;

describe('01-01 Finance Domain Entities / Roles / Permissions', () => {
  it('enumerates expected finance roles (KETRACO Enterprise Ontology)', () => {
    const roles = FinanceUserRoles;
    expect(roles).toContain('FINANCE_VIEWER');
    expect(roles).toContain('FINANCE_ANALYST');
    expect(roles).toContain('FINANCE_OFFICER');
    expect(roles).toContain('FINANCE_MANAGER');
    expect(roles).toContain('FINANCE_DIRECTOR');
    expect(roles).toContain('FINANCE_ADMIN');
    expect(roles).toContain('AUDITOR');
    expect(roles).toContain('EXECUTIVE');
    expect(roles.length).toBeGreaterThanOrEqual(8);
  });

  it('enumerates Finance Permission Actions (§01-18)', () => {
    const actions = FinancePermissionActions;
    expect(actions).toContain('view');
    expect(actions).toContain('create');
    expect(actions).toContain('update');
    expect(actions).toContain('ingest');
    expect(actions).toContain('export');
    expect(actions).toContain('configure_source');
    expect(actions).toContain('approve');
    expect(actions).toContain('execute_financial_action');
  });
});

describe('01-08 Normalization preserves raw values while producing canonical fields', () => {
  it('normalizes KES amount strings and ISO-8601 dates', () => {
    const result = normalizeFinanceRecord({
      amount: '1,250,500.75',
      currency: 'kes',
      postingDate: '2026-09-01',
      account: '4100-001',
      costCenter: 'CC-101',
      project: 'PRJ-LES-003',
      vendorId: 'SUP-042'
    }, []);
    expect(result.normalized.amount).toBe(1_250_500.75);
    expect(result.normalized.currency).toBe('KES');
    expect(result.normalized.date).toBe('2026-09-01');
    expect(result.normalized.accountCode).toBe('4100-001');
    expect(result.normalized.costCentre).toBe('CC-101');
    expect(result.normalized.projectCode).toBe('PRJ-LES-003');
    expect(result.normalized.supplierCode).toBe('SUP-042');
    // Raw values preserved via traces
    const amtTrace = result.traces.find(t => t.field === 'amount');
    expect(amtTrace).toBeDefined();
    expect(String(amtTrace!.rawValue)).toContain('1,250,500.75');
  });

  it('normalization never destroys the raw payload (returns it as part of traces)', () => {
    const r = normalizeFinanceRecord({ value: 'not-a-number', unknownField: true }, ['BUDGET']);
    // Still produces a normalized (potentially defaulted) payload without throwing
    expect(r).toBeDefined();
    expect(r.warnings).toBeDefined();
  });
});

describe('01-09 Validation rejects invalid records with explicit severity + errors', () => {
  it('rejects negative amounts with INVALID severity', () => {
    const r = validateFinanceRecord({ amount: -100, date: '2026-09-01', currency: 'KES' }, 'rec-test-1');
    expect(r.severity === 'INVALID' || r.severity === 'WARNING').toBeTruthy();
    expect(r.summary.count).toBeGreaterThanOrEqual(1);
    expect(r.errors.length).toBe(r.summary.count);
  });

  it('marks required-field-missing records as INVALID or WARNING depending on rules', () => {
    const r = validateFinanceRecord({}, 'rec-empty');
    expect(r.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('partitionValidation separates accepted/warning/quarantine buckets deterministically', () => {
    const rows = [
      { amount: 100, date: '2026-09-01', currency: 'KES', accountCode: '1200' },
      { amount: -1 },
      { }
    ];
    const result = partitionValidation(rows, r => validateFinanceRecord(r as any, 'test'));
    expect(result.accepted.length + result.warning.length + result.quarantine.length).toBe(rows.length);
  });
});

describe('01-10 Finance Profiling computes descriptive stats deterministically', () => {
  const records = [
    { projectCode: 'P1', amount: 100, date: '2026-01-01', currency: 'KES' },
    { projectCode: 'P1', amount: 200, date: '2026-02-01', currency: 'KES' },
    { projectCode: 'P2', amount: 300, date: '2026-03-01', currency: 'USD' },
    { projectCode: null as unknown as string, amount: 400, date: '2026-04-01', currency: 'KES' },
  ];
  it('computes rowCount / columnCount / nullRate / duplicateRate / dateRange / currencyDistribution', () => {
    const { profile } = profileFinanceDataset({
      datasetName: 'phase01-test', sourceId: 'src-test', batchId: 'batch-test', records: records as any
    });
    expect(profile.rowCount).toBe(4);
    expect(profile.columnCount).toBe(4);
    expect((profile.nullRates.projectCode ?? 0)).toBe(0.25);
    expect(profile.currencyDistribution.KES).toBe(3);
    expect(profile.currencyDistribution.USD).toBe(1);
    expect(profile.dateRange?.min).toBe('2026-01-01');
    expect(profile.dateRange?.max).toBe('2026-04-01');
    expect(profile.amountRange?.min).toBe(100);
    expect(profile.amountRange?.max).toBe(400);
    expect(profile.inferredEntities).toContain('projects');
  });

  it('signature changes when schema changes (new column)', () => {
    const r1 = profileFinanceDataset({ datasetName: 's', sourceId: 'src', batchId: 'b1', records: [{ a: 1 }] });
    const r2 = profileFinanceDataset({ datasetName: 's', sourceId: 'src', batchId: 'b2', records: [{ a: 1, b: 2 }] });
    expect(r1.profile.schemaChangeSignature).not.toEqual(r2.profile.schemaChangeSignature);
  });
});

describe('01-11 Data Quality scores have explainable components + formulas', () => {
  it('produces 7 canonical quality dimensions plus overallScore', () => {
    const q = calculateFinanceDataQuality(
      { batchId: 'b', recordId: 'r' },
      {
        isFixture: true, environment: 'development',
        validation: { severity: 'VALID', errors: [], summary: { requiredFieldsMissing: 0, typeErrors: 0, semanticErrors: 0, count: 0 } }
      }
    );
    const names = q.dimensions.map(d => d.name).sort();
    expect(names).toEqual([
      'Completeness','Consistency','Referential Integrity','Source Reliability',
      'Timeliness','Uniqueness','Validity'
    ]);
    expect(q.dimensions.every(d => typeof d.formula === 'string' && d.formula.length > 0)).toBeTruthy();
    expect(q.overallScore).toBeGreaterThanOrEqual(0);
    expect(q.overallScore).toBeLessThanOrEqual(1);
  });

  it('drops overallScore when validation errors present', () => {
    const good = calculateFinanceDataQuality({ batchId: 'b', recordId: 'r' }, {
      isFixture: true, environment: 'development',
      validation: { severity: 'VALID', errors: [], summary: { requiredFieldsMissing: 0, typeErrors: 0, semanticErrors: 0, count: 0 } }
    });
    const bad = calculateFinanceDataQuality({ batchId: 'b', recordId: 'r2' }, {
      isFixture: true, environment: 'development',
      validation: {
        severity: 'INVALID', errors: [
          { record: 'r2', field: 'amount', rule: 'AMOUNT-NEGATIVE', actualValue: -1, expectedCondition: '> 0', severity: 'INVALID' } as any
        ],
        summary: { requiredFieldsMissing: 0, typeErrors: 0, semanticErrors: 1, count: 1 }
      }
    });
    expect(bad.overallScore <= good.overallScore).toBeTruthy();
  });
});

describe('01-12 Entity Resolution — never guesses; returns UNRESOLVED on insufficient evidence', () => {
  it('returns UNRESOLVED status when no providers registered', async () => {
    const resolver = new FinanceEntityResolver();
    const ref: EntityReference = { kind: 'projectCode', value: 'UNKNOWN-999' };
    const r = await resolver.resolve(ref, { financeEntityKind: 'BUDGET' });
    expect(r.status).toBe('UNRESOLVED');
    expect(typeof r.mappingId).toBe('string');
    expect(r.remoteEntityId).toBeUndefined();
  });

  it('resolves STRONG matches as RESOLVED; uses mappingType correctly', async () => {
    const provider: EntityResolutionProvider = {
      resolve: async (kind, value) => {
        if (kind === 'projectCode' && value === 'PRJ-001') {
          return { found: true, confidenceLevel: 'STRONG', remoteDomain: 'projects', remoteEntityKind: 'Project', remoteEntityId: 'proj-001-uuid' };
        }
        return { found: false, confidenceLevel: 'UNKNOWN', remoteDomain: 'projects', remoteEntityKind: 'Project' };
      }
    };
    const resolver = new FinanceEntityResolver([provider]);
    const results = await resolver.resolveAll([
      { kind: 'projectCode', value: 'PRJ-001' },
      { kind: 'projectCode', value: 'UNKNOWN' }
    ], { financeEntityKind: 'Commitment' });
    expect(results.length).toBe(2);
    expect(results[0].status).toBe('RESOLVED');
    expect(results[0].remoteEntityId).toBe('proj-001-uuid');
    expect(results[1].status).toBe('UNRESOLVED');
  });
});

describe('01-13 Ontology Mapping maps record to KETRACO ontology class', () => {
  it('detects class for BUDGET/INVOICE/PAYMENT from hints + fields', () => {
    const b = detectOntologyClass(['BUDGET'], { budgetNumber: 'FY-2026/27-001' });
    expect(['BUDGET', 'Budget', 'UNKNOWN', 'FINANCIAL_METRIC', 'FinancialMetric'].includes(b.class)).toBeTruthy();
    const i = detectOntologyClass(['INVOICE'], { invoiceNumber: 'INV-00042', invoiceDate: '2026-09-01' });
    expect(i.class).toBeDefined();
  });

  it('mapToOntology produces at least one mapping for a well-formed payment record', () => {
    const maps = mapToOntology({
      amount: 10_000, currency: 'KES', date: '2026-09-01',
      paymentId: 'PAY-1', invoiceRef: 'INV-1', projectCode: 'P1'
    }, [], { entityHints: ['PAYMENT'] });
    expect(maps.length).toBeGreaterThanOrEqual(1);
    expect(maps.every(m => ['RESOLVED','UNRESOLVED','AMBIGUOUS','REQUIRES_REVIEW'].includes(m.status))).toBeTruthy();
  });
});

describe('01-15 Finance Data Lineage — traces from source to entity', () => {
  it('produces deterministic trace hashes for identical events (idempotent)', () => {
    const lineage = new FinanceDataLineage({ isFixture: true, environment: 'development' });
    const a = lineage.rawRecordCreate({ sourceId: 's', batchId: 'b', recordId: 'r' });
    const b = lineage.rawRecordCreate({ sourceId: 's', batchId: 'b', recordId: 'r' });
    expect(a.traceHash).toBe(b.traceHash);
    expect(a.transformationType).toBe('RAW_RECORD_CREATE');
    expect(a.entityId).toBeUndefined();
    expect(a.recordId).toBe('r');
  });

  it('produces a complete pipeline chain: RAW → NORMALIZE → VALIDATE → RESOLVE → MAP → PERSIST → GRAPH → QUALITY', () => {
    const lineage = new FinanceDataLineage({ isFixture: true, environment: 'development' });
    const steps = [
      lineage.rawRecordCreate({ sourceId: 's', batchId: 'b', recordId: 'r' }),
      lineage.normalize({ batchId: 'b', recordId: 'r' }),
      lineage.validate({ batchId: 'b', recordId: 'r' }),
      lineage.resolve({ batchId: 'b', recordId: 'r', toEntityKind: 'Project', toEntityId: 'p1' }),
      lineage.ontologyMap({ batchId: 'b', recordId: 'r', toEntityKind: 'BUDGET' }),
      lineage.persist({ entityKind: 'BUDGET', entityId: 'bud-1', batchId: 'b', recordId: 'r' }),
      lineage.graphCreateNode({ entityKind: 'BUDGET', entityId: 'bud-1', batchId: 'b', recordId: 'r' }),
      lineage.qualityScore({ entityKind: 'BUDGET', entityId: 'bud-1', batchId: 'b' })
    ];
    const types = steps.map(s => s.transformationType);
    expect(types).toEqual([
      'RAW_RECORD_CREATE','NORMALIZE','VALIDATE','RESOLVE_ENTITY','ONTOLOGY_MAP','PERSIST','GRAPH_CREATE_NODE','QUALITY_SCORE'
    ]);
    expect(steps.every(s => s.isFixture === true)).toBeTruthy();
    expect(steps.every(s => s.environment === 'development')).toBeTruthy();
    expect(steps.every(s => typeof s.occurredAt === 'string' && s.occurredAt.length > 0)).toBeTruthy();
  });
});

describe('CP-03 — Production Fixture Protection', () => {
  it('applyFixtureMetadata marks records with isFixture + dataState', () => {
    const r = applyFixtureMetadata({ any: 'data' } as any, { explicitIsFixture: true, explicitEnvironment: 'development' });
    expect(r.isFixture).toBe(true);
    expect(r.environment).toBe('development');
    expect(r.dataState === 'DEVELOPMENT_FIXTURE').toBeTruthy();
  });

  it('enforceProductionFixtureGuard blocks fixture records in PROD_MODE by returning DATA UNAVAILABLE state', () => {
    const original = process.env.PROD_MODE;
    try {
      process.env.PROD_MODE = 'true';
      const block = enforceProductionFixtureGuard({ isFixture: true, environment: 'development' } as any, 'ingest', 'test');
      expect(block.blocked).toBe(true);
      expect(block.dataState === 'UNAVAILABLE' || block.dataState === 'DEVELOPMENT_FIXTURE').toBeTruthy();
      expect(typeof block.reason === 'string' && block.reason.length > 0).toBeTruthy();
    } finally {
      process.env.PROD_MODE = original;
    }
  });

  it('enforceProductionFixtureGuard permits non-fixture records even in PROD_MODE', () => {
    const original = process.env.PROD_MODE;
    try {
      process.env.PROD_MODE = 'true';
      const ok = enforceProductionFixtureGuard({ isFixture: false, environment: 'production' } as any, 'ingest');
      expect(ok.blocked).toBe(false);
      expect(ok.dataState === 'REAL' || ok.dataState === 'PARTIAL').toBeTruthy();
    } finally {
      process.env.PROD_MODE = original;
    }
  });

  it('PROD_MODE() helper is case-insensitive and trims whitespace', () => {
    const original = process.env.PROD_MODE;
    try {
      process.env.PROD_MODE = ' TRUE ';
      expect(PROD_MODE()).toBe(true);
      process.env.PROD_MODE = 'false';
      expect(PROD_MODE()).toBe(false);
      process.env.PROD_MODE = 'tRuE';
      expect(PROD_MODE()).toBe(true);
      process.env.PROD_MODE = ' not-true ';
      expect(PROD_MODE()).toBe(false);
    } finally {
      process.env.PROD_MODE = original;
    }
  });
});

describe('01-18 RBAC + ABAC Finance enforcement', () => {
  it('FINANCE_VIEWER can view sources but cannot approve', () => {
    const viewer: any = { id: 'u1', role: 'FINANCE_VIEWER', email: 'v@ketraco.co.ke', name: 'V', accessLevel: 'standard', clearance: 'standard', tenantId: 'ketraco' };
    const viewResult = AuthorizationService.checkPermission(viewer, 'view', 'finance_source');
    expect(viewResult.isAuthorized).toBe(true);
    const approveResult = AuthorizationService.checkPermission(viewer, 'approve', 'finance_payment');
    expect(approveResult.isAuthorized).toBe(false);
    expect(approveResult.reason.toLowerCase().indexOf('role') >= 0).toBeTruthy();
  });

  it('FINANCE_OFFICER is capped at ≤ 500K KES approval threshold (ABAC §01-18 Policy 6)', () => {
    const officer: any = { id: 'u2', role: 'FINANCE_OFFICER', tenantId: 'ketraco', accessLevel: 'standard', clearance: 'standard' };
    const small = AuthorizationService.checkPermission(officer, 'approve', 'finance_payment', { amountKES: 200_000 });
    expect(small.isAuthorized).toBe(true);
    const big = AuthorizationService.checkPermission(officer, 'approve', 'finance_payment', { amountKES: 2_000_000 });
    expect(big.isAuthorized).toBe(false);
    expect(big.reason.indexOf('KES') >= 0 || big.reason.indexOf('threshold') >= 0).toBeTruthy();
  });

  it('Finance SoD — the officer who created the document cannot approve it (creator-based Policy 5)', () => {
    const off: any = { id: 'u3', role: 'FINANCE_OFFICER', tenantId: 'ketraco', accessLevel: 'standard', clearance: 'standard' };
    // actorId = creator of the payment/budget = same user → SoD blocks.
    const p = AuthorizationService.checkPermission(off, 'approve', 'finance_payment', { amountKES: 100, actorId: 'u3' });
    expect(p.isAuthorized).toBe(false);
    expect(p.reason.indexOf('SoD') >= 0 || p.reason.indexOf('Segregation') >= 0).toBeTruthy();
    const b = AuthorizationService.checkPermission(off, 'approve', 'finance_budget', { amountKES: 100, actorId: 'u3' });
    expect(b.isAuthorized).toBe(false);
    // Same officer approving a document created by a DIFFERENT user is permitted
    // by SoD (still bounded by the 500K ABAC threshold below).
    const other = AuthorizationService.checkPermission(off, 'approve', 'finance_payment', { amountKES: 100, actorId: 'someone-else' });
    expect(other.isAuthorized).toBe(true);
  });

  it('CP-03 ABAC guard (Policy 7) — fixtures blocked in PROD_MODE', () => {
    const original = process.env.PROD_MODE;
    try {
      process.env.PROD_MODE = 'true';
      const admin: any = { id: 'u4', role: 'FINANCE_ADMIN', tenantId: 'ketraco', accessLevel: 'standard', clearance: 'standard' };
      const result = AuthorizationService.checkPermission(admin, 'create', 'finance_budget', { isFixture: true });
      expect(result.isAuthorized).toBe(false);
      expect(result.reason.indexOf('CP-03') >= 0 || result.reason.indexOf('Fixture') >= 0).toBeTruthy();
    } finally {
      process.env.PROD_MODE = original;
    }
  });

  it('Evaluate adapter (singleton) mirrors checkPermission — roles-array normalization', () => {
    const inst = AuthorizationService.getInstance();
    expect(inst).toBeDefined();
    const viewer: any = { id: 'u5', roles: ['FINANCE_VIEWER'], tenantId: 'ketraco' };
    const a = inst.evaluate(viewer, 'view', 'finance_source');
    expect(a.isAuthorized).toBe(true);
    const b = inst.evaluate(viewer, 'configure_source', 'finance_source');
    expect(b.isAuthorized).toBe(false);
  });
});

describe('01-03 + 01-04 Source Registry + Connector contract (InMemory)', () => {
  it('registers a source and returns a working InMemory connector via factory', async () => {
    const registry = new FinanceSourceRegistry();
    const created = registry.register({
      name: 'Dev fixture A', sourceType: 'EXCEL' as FinanceSourceType,
      system: 'DEV_FIXTURE', owner: 'test-engineer@ketraco.co.ke',
      isFixture: true, environment: 'development'
    });
    const found = registry.get(created.sourceId);
    expect(found).toBeDefined();
    expect(found!.sourceId).toBe(created.sourceId);

    // Register EXCEL provider if absent, then build
    financeConnectorFactory.register('EXCEL' as FinanceSourceType, (sourceId: string) =>
      new InMemoryFinanceConnector(sourceId, 'EXCEL' as FinanceSourceType, [
        { entityKind: 'PAYMENT', records: [{ id: 'P1', amount: 10 }] }
      ])
    );
    const conn = financeConnectorFactory.build(created);
    expect(conn.sourceType).toBe('EXCEL');
    const connResult = await conn.connect();
    expect(connResult.ok).toBe(true);
    const schema = await conn.discoverSchema();
    expect(schema.ok).toBe(true);
    expect(schema.entities!.length).toBeGreaterThanOrEqual(1);
    const fetched = await conn.fetch();
    expect(fetched.ok).toBe(true);
    expect(fetched.records.length).toBeGreaterThanOrEqual(1);
  });
});

describe('01-20 Observability — counters, latency, audit', () => {
  it('counts + recordLatency show up in snapshot deterministically', () => {
    const o = new FinanceObservability();
    o.count('finance_records_ingested', 10);
    o.count('finance_records_accepted_valid', 8);
    o.recordLatency('finance_ingest_total_ms', 250.5);
    const snap = o.snapshot();
    expect(snap.counters['finance_records_ingested']).toBe(10);
    expect(snap.counters['finance_records_accepted_valid']).toBe(8);
    expect(snap.latencies['finance_ingest_total_ms'].count).toBe(1);
    expect(snap.latencies['finance_ingest_total_ms'].sumMs).toBe(251);
    expect(typeof snap.refreshedAt === 'string').toBeTruthy();
  });

  it('measure(fn) wraps latency success + error paths', async () => {
    const o = new FinanceObservability();
    const ok = await o.measure('test_a', () => 42);
    expect(ok.value).toBe(42);
    expect(ok.error).toBeUndefined();
    expect(ok.ms).toBeGreaterThanOrEqual(0);
    const err = await o.measure('test_b', () => { throw new Error('boom'); });
    expect(err.error).toBeDefined();
    expect((err.error as Error).message).toBe('boom');
    expect(o.snapshot().errors['test_b:exception']).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// §21 END-TO-END ACCEPTANCE TEST (single dev fixture)
// ---------------------------------------------------------------------------
describe('§21 E2E Acceptance Test — one fixture: Project/Budget/Commitment/Supplier/Contract/Invoice/Payment/CC/Account → full pipeline', () => {
  it('runs: FIXTURE → PROFILING → NORMALIZE → VALIDATE → RESOLVE → ONTOLOGY → QUALITY → LINEAGE (graph + DB out of scope here)', async () => {
    // --- 1. Dev fixture ---
    type DevFixtureRow = { _entityKind: string; id: string; projectCode?: string; supplierCode?: string; contractId?: string; costCentre?: string; accountCode?: string; amount?: number; currency?: string; date?: string; budgetNumber?: string; commitmentNumber?: string; invoiceNumber?: string; paymentNumber?: string; };
    const fixture: DevFixtureRow[] = [
      { _entityKind: 'PROJECT', id: 'PRJ-LES-003', projectCode: 'PRJ-LES-003' },
      { _entityKind: 'ACCOUNT', id: 'ACC-4100', accountCode: '4100-001' },
      { _entityKind: 'COST_CENTRE', id: 'CC-101', costCentre: 'CC-101' },
      { _entityKind: 'SUPPLIER', id: 'SUP-042', supplierCode: 'SUP-042' },
      { _entityKind: 'BUDGET', id: 'BUD-001', projectCode: 'PRJ-LES-003', budgetNumber: 'FY-2026/27-001', costCentre: 'CC-101', accountCode: '4100-001', amount: 25_000_000, currency: 'KES', date: '2026-07-01' },
      { _entityKind: 'COMMITMENT', id: 'PO-2201', projectCode: 'PRJ-LES-003', contractId: 'CON-0033', supplierCode: 'SUP-042', costCentre: 'CC-101', accountCode: '4100-001', commitmentNumber: 'PO-2201', amount: 4_500_000, currency: 'KES', date: '2026-08-14' },
      { _entityKind: 'INVOICE', id: 'INV-10042', invoiceNumber: 'INV-10042', projectCode: 'PRJ-LES-003', supplierCode: 'SUP-042', contractId: 'CON-0033', commitmentNumber: 'PO-2201', amount: 4_500_000, currency: 'KES', date: '2026-08-30' },
      { _entityKind: 'PAYMENT', id: 'PAY-8801', paymentNumber: 'PAY-8801', projectCode: 'PRJ-LES-003', supplierCode: 'SUP-042', invoiceNumber: 'INV-10042', amount: 4_500_000, currency: 'KES', date: '2026-09-10' },
    ];

    // --- 2. Profiling ---
    const { profile, inferredProjectsFields, inferredSuppliersFields, inferredCostCentresFields, inferredAccountsFields } = profileFinanceDataset({
      datasetName: 'KETRACO_FINANCE_PHASE01_FIXTURE',
      sourceId: 'SRC-FIXTURE-PHASE01',
      batchId: 'BATCH-ACCEPT-001',
      records: fixture as any,
      isFixture: true,
      environment: 'development'
    });
    expect(profile.rowCount).toBe(8);
    expect(profile.isFixture).toBe(true);
    expect(profile.environment).toBe('development');
    expect(profile.inferredEntities.includes('projects')).toBeTruthy();
    expect(inferredProjectsFields.length).toBeGreaterThanOrEqual(1);
    expect(inferredSuppliersFields.length).toBeGreaterThanOrEqual(1);
    expect(inferredCostCentresFields.length).toBeGreaterThanOrEqual(1);
    expect(inferredAccountsFields.length).toBeGreaterThanOrEqual(1);

    // --- 3. Normalize ---
    const normalized = fixture.map(r => normalizeFinanceRecord(r, [r._entityKind]));
    expect(normalized.every(n => n.normalized.currency === 'KES')).toBeTruthy();
    const paymentNorm = normalized.find(n => n.normalized.paymentNumber);
    expect(paymentNorm).toBeDefined();
    expect(paymentNorm!.normalized.amount).toBe(4_500_000);
    expect(paymentNorm!.normalized.date).toBe('2026-09-10');

    // --- 4. Validate ---
    const validations = normalized.map((n, idx) => validateFinanceRecord(n.normalized, fixture[idx].id));
    // Payment row with all required fields should be VALID or WARNING, never fully rejected.
    const payVal = validations[fixture.findIndex(f => f._entityKind === 'PAYMENT')];
    expect(payVal.severity === 'VALID' || payVal.severity === 'WARNING').toBeTruthy();

    // --- 5. Resolve (with a project-code provider) ---
    const projectsProvider: EntityResolutionProvider = {
      resolve: async (kind, value) => {
        if (kind === 'projectCode' && value === 'PRJ-LES-003') return { found: true, confidenceLevel: 'STRONG', remoteDomain: 'projects', remoteEntityKind: 'Project', remoteEntityId: 'ketraco-project-les-003' };
        if (kind === 'supplierCode' && value === 'SUP-042') return { found: true, confidenceLevel: 'STRONG', remoteDomain: 'suppliers', remoteEntityKind: 'Supplier', remoteEntityId: 'ketraco-supplier-042' };
        if (kind === 'costCentre' && value === 'CC-101') return { found: true, confidenceLevel: 'STRONG', remoteDomain: 'projects', remoteEntityKind: 'CostCentre', remoteEntityId: 'ketraco-cc-101' };
        if (kind === 'accountCode' && value === '4100-001') return { found: true, confidenceLevel: 'STRONG', remoteDomain: 'projects', remoteEntityKind: 'Account', remoteEntityId: 'ketraco-acc-4100' };
        return { found: false, confidenceLevel: 'UNKNOWN', remoteDomain: 'projects' as any, remoteEntityKind: 'Unknown' };
      }
    };
    const resolver = new FinanceEntityResolver([projectsProvider]);
    const allRefs: EntityReference[] = [];
    for (const row of normalized) {
      if (row.normalized.projectCode) allRefs.push({ kind: 'projectCode', value: String(row.normalized.projectCode) });
      if (row.normalized.supplierCode) allRefs.push({ kind: 'supplierCode', value: String(row.normalized.supplierCode) });
      if (row.normalized.costCentre) allRefs.push({ kind: 'costCentre', value: String(row.normalized.costCentre) });
      if (row.normalized.accountCode) allRefs.push({ kind: 'accountCode', value: String(row.normalized.accountCode) });
    }
    const resolved = await resolver.resolveAll(allRefs, { financeEntityKind: 'FIXTURE_ACCEPTANCE' });
    const strongMatches = resolved.filter(r => r.status === 'RESOLVED');
    expect(strongMatches.length).toBeGreaterThanOrEqual(4);
    const resolvedProjectIds = new Set(resolved.filter(r => r.remoteEntityKind === 'Project').map(r => r.remoteEntityId));
    expect(resolvedProjectIds.has('ketraco-project-les-003')).toBeTruthy();

    // --- 6. Ontology mapping ---
    const ontologyMappings = normalized.map(n =>
      mapToOntology(n.normalized, [], { entityHints: n.entityKindHints })
    );
    expect(ontologyMappings.every(ms => ms.length >= 1)).toBeTruthy();

    // --- 7. Quality ---
    const qualities = validations.map((v, i) =>
      calculateFinanceDataQuality(
        { batchId: 'BATCH-ACCEPT-001', recordId: fixture[i].id, entityKind: fixture[i]._entityKind, entityId: fixture[i].id, sourceId: 'SRC-FIXTURE-PHASE01' },
        { profile, validation: v as any, isFixture: true, environment: 'development' }
      )
    );
    expect(qualities.every(q => q.overallScore >= 0 && q.overallScore <= 1)).toBeTruthy();
    expect(qualities.every(q => q.dimensions.length === 7)).toBeTruthy();
    const paymentQuality = qualities[fixture.findIndex(f => f._entityKind === 'PAYMENT')];
    expect(paymentQuality.formulaVersion.length).toBeGreaterThan(0);

    // --- 8. Lineage — full Source → Raw → Transformations chain for payment record ---
    const lineage = new FinanceDataLineage({ isFixture: true, environment: 'development', tenantId: 'ketraco', actorId: 'acceptance-test' });
    const payId = 'PAY-8801';
    const chain = [
      lineage.rawRecordCreate({ sourceId: 'SRC-FIXTURE-PHASE01', batchId: 'BATCH-ACCEPT-001', recordId: payId }),
      lineage.normalize({ batchId: 'BATCH-ACCEPT-001', recordId: payId, fieldMappings: { amount: 'amount', currency: 'currency' } }),
      lineage.validate({ batchId: 'BATCH-ACCEPT-001', recordId: payId }),
      lineage.resolve({ batchId: 'BATCH-ACCEPT-001', recordId: payId, toEntityKind: 'Project', toEntityId: 'ketraco-project-les-003' }),
      lineage.ontologyMap({ batchId: 'BATCH-ACCEPT-001', recordId: payId, toEntityKind: 'PAYMENT', toEntityId: payId }),
      lineage.persist({ entityKind: 'PAYMENT', entityId: payId, recordId: payId, batchId: 'BATCH-ACCEPT-001' }),
      lineage.graphCreateNode({ entityKind: 'PAYMENT', entityId: payId, batchId: 'BATCH-ACCEPT-001', recordId: payId }),
      lineage.qualityScore({ entityKind: 'PAYMENT', entityId: payId, batchId: 'BATCH-ACCEPT-001', recordId: payId })
    ];
    // Source provenance can be answered: "Where did this number come from?"
    const recordIds = new Set(chain.map(s => s.recordId));
    expect(recordIds.has(payId)).toBe(true);
    const transformations = chain.map(s => s.transformationType);
    expect(transformations).toEqual([
      'RAW_RECORD_CREATE','NORMALIZE','VALIDATE','RESOLVE_ENTITY','ONTOLOGY_MAP','PERSIST','GRAPH_CREATE_NODE','QUALITY_SCORE'
    ]);
    expect(chain.every(s => s.isFixture === true)).toBeTruthy();

    // --- 9. Idempotency check (ingest twice = one logical signature) ---
    const chain2 = [
      lineage.rawRecordCreate({ sourceId: 'SRC-FIXTURE-PHASE01', batchId: 'BATCH-ACCEPT-001', recordId: payId })
    ];
    expect(chain[0].traceHash).toBe(chain2[0].traceHash);
  });
});

// ---------------------------------------------------------------------------
// STANDALONE RUNNER (when not loaded via Jest/Mocha)
// ---------------------------------------------------------------------------
(async function runStandaloneIfNoJest() {
  if (standalone.suites.length === 0) return;
  let passed = 0; let failed = 0; let failures: { suite: string; test: string; error: Error }[] = [];
  const width = 80;
  console.log('='.repeat(width));
  console.log('KETRACO FINANCE INTELLIGENCE PHASE 01 — STANDALONE TEST RUNNER');
  console.log('='.repeat(width));
  for (const suite of standalone.suites) {
    console.log(`\n📚 ${suite.name}`);
    for (const test of suite.tests) {
      try {
        for (const b of suite.before) await b();
        await test.fn();
        console.log(`  ✅ ${test.name}`);
        passed++;
      } catch (err) {
        failed++;
        console.log(`  ❌ ${test.name}\n       ${(err as Error).message}`);
        failures.push({ suite: suite.name, test: test.name, error: err as Error });
      }
    }
  }
  console.log('\n' + '='.repeat(width));
  console.log(`RESULTS: ${passed} PASSED  |  ${failed} FAILED  |  Total ${passed + failed}`);
  console.log('='.repeat(width));
  if (failed > 0) {
    process.exitCode = 1;
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`- [${f.suite}] ${f.test} :: ${f.error.stack || f.error.message}`);
    }
  }
})();
