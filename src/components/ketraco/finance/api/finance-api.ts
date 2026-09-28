import type {
  FinanceSource,
  FinanceBatch,
  FinanceAccount,
  FinanceCostCentre,
  FinanceBudget,
  FinanceCommitment,
  FinanceInvoice,
  FinancePayment,
  FinanceProject,
  FinanceLineageRecord,
  DataQualityScore,
  DataState,
  FinanceMetric,
} from '../types';
import {
  FIXTURE_SOURCES,
  FIXTURE_BATCHES,
  FIXTURE_ACCOUNTS,
  FIXTURE_COST_CENTRES,
  FIXTURE_BUDGETS,
  FIXTURE_COMMITMENTS,
  FIXTURE_INVOICES,
  FIXTURE_PAYMENTS,
  FIXTURE_PROJECTS,
  FIXTURE_LINEAGE,
  FIXTURE_QUALITY,
} from './fixtures';

// ---------------------------------------------------------------------------
// Finance API Adapter
// Attempts real backend first; falls back to typed fixtures on failure.
// All fixture responses are flagged with dataState: 'DEVELOPMENT_FIXTURE'.
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

interface FinanceListResponse<T> {
  items: T[];
  dataState: DataState;
  total: number;
}

const BASE = '/api/finance';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const token = localStorage.getItem('atlas_access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json: ApiResponse<T> = await res.json();
    if (!json.ok) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

function fixtureList<T>(items: T[]): FinanceListResponse<T> {
  return { items, dataState: 'DEVELOPMENT_FIXTURE', total: items.length };
}

export const financeApi = {
  async getSources(): Promise<FinanceListResponse<FinanceSource>> {
    const data = await fetchJson<{ sources: FinanceSource[] }>(`${BASE}/sources`);
    if (data?.sources) return { items: data.sources, dataState: 'REAL', total: data.sources.length };
    return fixtureList(FIXTURE_SOURCES);
  },

  async getBatches(): Promise<FinanceListResponse<FinanceBatch>> {
    const data = await fetchJson<{ batches: FinanceBatch[] }>(`${BASE}/ingestion`);
    if (data?.batches) return { items: data.batches, dataState: 'REAL', total: data.batches.length };
    return fixtureList(FIXTURE_BATCHES);
  },

  async getAccounts(): Promise<FinanceListResponse<FinanceAccount>> {
    const data = await fetchJson<{ accounts: FinanceAccount[] }>(`${BASE}/accounts`);
    if (data?.accounts) return { items: data.accounts, dataState: 'REAL', total: data.accounts.length };
    return fixtureList(FIXTURE_ACCOUNTS);
  },

  async getCostCentres(): Promise<FinanceListResponse<FinanceCostCentre>> {
    const data = await fetchJson<{ costCentres: FinanceCostCentre[] }>(`${BASE}/cost-centres`);
    if (data?.costCentres) return { items: data.costCentres, dataState: 'REAL', total: data.costCentres.length };
    return fixtureList(FIXTURE_COST_CENTRES);
  },

  async getBudgets(): Promise<FinanceListResponse<FinanceBudget>> {
    const data = await fetchJson<{ budgets: FinanceBudget[] }>(`${BASE}/budgets`);
    if (data?.budgets) return { items: data.budgets, dataState: 'REAL', total: data.budgets.length };
    return fixtureList(FIXTURE_BUDGETS);
  },

  async getCommitments(): Promise<FinanceListResponse<FinanceCommitment>> {
    const data = await fetchJson<{ commitments: FinanceCommitment[] }>(`${BASE}/commitments`);
    if (data?.commitments) return { items: data.commitments, dataState: 'REAL', total: data.commitments.length };
    return fixtureList(FIXTURE_COMMITMENTS);
  },

  async getInvoices(): Promise<FinanceListResponse<FinanceInvoice>> {
    const data = await fetchJson<{ invoices: FinanceInvoice[] }>(`${BASE}/invoices`);
    if (data?.invoices) return { items: data.invoices, dataState: 'REAL', total: data.invoices.length };
    return fixtureList(FIXTURE_INVOICES);
  },

  async getPayments(): Promise<FinanceListResponse<FinancePayment>> {
    const data = await fetchJson<{ payments: FinancePayment[] }>(`${BASE}/payments`);
    if (data?.payments) return { items: data.payments, dataState: 'REAL', total: data.payments.length };
    return fixtureList(FIXTURE_PAYMENTS);
  },

  async getProjects(): Promise<FinanceListResponse<FinanceProject>> {
    const data = await fetchJson<{ projects: FinanceProject[] }>(`${BASE}/projects`);
    if (data?.projects) return { items: data.projects, dataState: 'REAL', total: data.projects.length };
    return fixtureList(FIXTURE_PROJECTS);
  },

  async getLineage(entityId?: string): Promise<FinanceListResponse<FinanceLineageRecord>> {
    const url = entityId ? `${BASE}/lineage/${entityId}` : `${BASE}/lineage`;
    const data = await fetchJson<{ lineage: FinanceLineageRecord[] }>(url);
    if (data?.lineage) return { items: data.lineage, dataState: 'REAL', total: data.lineage.length };
    return fixtureList(FIXTURE_LINEAGE);
  },

  async getQuality(): Promise<FinanceListResponse<DataQualityScore>> {
    const data = await fetchJson<{ quality: DataQualityScore[] }>(`${BASE}/quality`);
    if (data?.quality) return { items: data.quality, dataState: 'REAL', total: data.quality.length };
    return fixtureList(FIXTURE_QUALITY);
  },

  async getMetrics(): Promise<FinanceListResponse<FinanceMetric>> {
    const data = await fetchJson<{ metrics: FinanceMetric[] }>(`${BASE}/metrics`);
    if (data?.metrics) return { items: data.metrics, dataState: 'REAL', total: data.metrics.length };
    return fixtureList(buildMetricsFromFixtures());
  },

  async getCommandState(): Promise<any> {
    const data = await fetchJson<any>(`${BASE}/command-state`);
    return data;
  },

  async getAuditTrail(): Promise<any[]> {
    const data = await fetchJson<any[]>(`${BASE}/audit-trail`);
    return data || [];
  },

  async executeAction(actionType: string, payload?: any): Promise<{ success: boolean; message: string; auditId: string; reference?: string; sha256Hash?: string; result?: any; commandState?: any; enactment?: any } | null> {
    try {
      const token = localStorage.getItem('atlas_access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE}/actions/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ actionType, payload })
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    } catch {
      return null;
    }
  },

  async getProjectDeepDive(projectId: string): Promise<any> {
    const data = await fetchJson<any>(`${BASE}/project-deepdive/${projectId}`);
    return data;
  },
};

function buildMetricsFromFixtures(): FinanceMetric[] {
  const totalBudget = FIXTURE_BUDGETS.reduce((s, b) => s + b.revisedAmount, 0);
  const totalCommitted = FIXTURE_BUDGETS.reduce((s, b) => s + b.committedAmount, 0);
  const totalActual = FIXTURE_BUDGETS.reduce((s, b) => s + b.actualAmount, 0);
  const totalPaid = FIXTURE_BUDGETS.reduce((s, b) => s + b.paidAmount, 0);
  const totalForecast = FIXTURE_BUDGETS.reduce((s, b) => s + b.forecastAmount, 0);
  const totalCapex = FIXTURE_BUDGETS.filter(b => b.accountType === 'CAPEX').reduce((s, b) => s + b.revisedAmount, 0);
  const totalOpex = FIXTURE_BUDGETS.filter(b => b.accountType === 'OPEX').reduce((s, b) => s + b.revisedAmount, 0);

  return [
    { metricId: 'm-001', name: 'Total Budget', category: 'budget', value: totalBudget, previousValue: 3960000000, unit: 'KES', trend: 'UP', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-002', name: 'Total Committed', category: 'commitment', value: totalCommitted, previousValue: 2880000000, unit: 'KES', trend: 'UP', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-003', name: 'Total Actual', category: 'payment', value: totalActual, previousValue: 2400000000, unit: 'KES', trend: 'UP', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-004', name: 'Total Paid', category: 'payment', value: totalPaid, previousValue: 1920000000, unit: 'KES', trend: 'UP', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-005', name: 'Forecast', category: 'forecast', value: totalForecast, unit: 'KES', trend: 'STABLE', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-006', name: 'CAPEX', category: 'budget', value: totalCapex, unit: 'KES', trend: 'UP', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-007', name: 'OPEX', category: 'budget', value: totalOpex, unit: 'KES', trend: 'STABLE', period: 'FY2025-2026', isFixture: true },
    { metricId: 'm-008', name: 'Budget Utilization', category: 'budget', value: Math.round((totalActual / totalBudget) * 10000) / 100, unit: '%', trend: 'UP', period: 'FY2025-2026', isFixture: true },
  ];
}
