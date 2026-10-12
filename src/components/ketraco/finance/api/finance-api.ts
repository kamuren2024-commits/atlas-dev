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
// Live data is authoritative by default. Demo fixtures are only accepted when
// explicitly enabled and are marked as SIMULATED to avoid false trust.
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; status?: number };
}

interface FinanceListResponse<T> {
  items: T[];
  dataState: DataState;
  total: number;
  error?: { code: string; message: string; status?: number };
}

const BASE = '/api/finance';
const DEMO_MODE_STORAGE_KEY = 'atlas_demo_mode';

export function isFinanceDemoModeEnabled(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (stored !== null) return stored.trim().toLowerCase() === 'true';
  }

  const envValue = typeof import.meta !== 'undefined'
    ? String((import.meta as any).env?.VITE_ATLAS_DEMO_MODE ?? '').trim().toLowerCase()
    : 'false';

  return envValue === 'true';
}

async function fetchJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: { code: string; message: string; status?: number } }> {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('atlas_access_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    const rawText = await res.text();

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const parsed = rawText ? JSON.parse(rawText) : null;
        const details = parsed?.error ?? parsed;
        if (details?.message) message = details.message;
      } catch {
        // Keep a generic message for non-JSON HTTP errors.
      }

      return {
        ok: false,
        error: {
          code: res.status === 401 ? 'AUTH_REQUIRED' : res.status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR',
          message,
          status: res.status,
        },
      };
    }

    if (!rawText.trim()) {
      return {
        ok: false,
        error: { code: 'EMPTY_RESPONSE', message: 'Received an empty response body.', status: 200 },
      };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawText);
    } catch {
      return {
        ok: false,
        error: { code: 'MALFORMED_JSON', message: 'The response body was not valid JSON.', status: 200 },
      };
    }

    if (payload && typeof payload === 'object' && 'ok' in payload && (payload as any).ok === false) {
      return {
        ok: false,
        error: {
          code: (payload as any).error?.code ?? 'API_ERROR',
          message: (payload as any).error?.message ?? 'The API reported a failed operation.',
          status: (payload as any).error?.status,
        },
      };
    }

    const data = (payload && typeof payload === 'object' && 'data' in payload)
      ? (payload as any).data as T
      : (payload as T);

    return { ok: true, data };
  } catch (error: any) {
    const status = error?.name === 'TimeoutError' ? 504 : undefined;
    return {
      ok: false,
      error: {
        code: status ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error?.message ?? 'A network or timeout error prevented the Finance request from succeeding.',
        status,
      },
    };
  }
}

function fixtureList<T>(items: T[], state: DataState = 'SIMULATED'): FinanceListResponse<T> {
  return { items, dataState: state, total: items.length };
}

function unavailableList<T>(error?: { code: string; message: string; status?: number }): FinanceListResponse<T> {
  return {
    items: [],
    dataState: error?.status === 401 || error?.status === 403 ? 'FORBIDDEN' : 'UNAVAILABLE',
    total: 0,
    error,
  };
}

function mapListResponse<T>(items: T[] | undefined, dataState: DataState, total?: number): FinanceListResponse<T> | null {
  if (!Array.isArray(items)) return null;
  return { items, dataState, total: total ?? items.length };
}

export const financeApi = {
  async getSources(): Promise<FinanceListResponse<FinanceSource>> {
    const result = await fetchJson<{ sources: FinanceSource[] }>(`${BASE}/sources`);
    if (result.ok) {
      const response = mapListResponse(result.data?.sources, 'REAL', result.data?.sources?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_SOURCES, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getBatches(): Promise<FinanceListResponse<FinanceBatch>> {
    const result = await fetchJson<{ batches: FinanceBatch[] }>(`${BASE}/ingestion`);
    if (result.ok) {
      const response = mapListResponse(result.data?.batches, 'REAL', result.data?.batches?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_BATCHES, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getAccounts(): Promise<FinanceListResponse<FinanceAccount>> {
    const result = await fetchJson<{ accounts: FinanceAccount[] }>(`${BASE}/accounts`);
    if (result.ok) {
      const response = mapListResponse(result.data?.accounts, 'REAL', result.data?.accounts?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_ACCOUNTS, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getCostCentres(): Promise<FinanceListResponse<FinanceCostCentre>> {
    const result = await fetchJson<{ costCentres: FinanceCostCentre[] }>(`${BASE}/cost-centres`);
    if (result.ok) {
      const response = mapListResponse(result.data?.costCentres, 'REAL', result.data?.costCentres?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_COST_CENTRES, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getBudgets(): Promise<FinanceListResponse<FinanceBudget>> {
    const result = await fetchJson<{ budgets: FinanceBudget[] }>(`${BASE}/budgets`);
    if (result.ok) {
      const response = mapListResponse(result.data?.budgets, 'REAL', result.data?.budgets?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_BUDGETS, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getCommitments(): Promise<FinanceListResponse<FinanceCommitment>> {
    const result = await fetchJson<{ commitments: FinanceCommitment[] }>(`${BASE}/commitments`);
    if (result.ok) {
      const response = mapListResponse(result.data?.commitments, 'REAL', result.data?.commitments?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_COMMITMENTS, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getInvoices(): Promise<FinanceListResponse<FinanceInvoice>> {
    const result = await fetchJson<{ invoices: FinanceInvoice[] }>(`${BASE}/invoices`);
    if (result.ok) {
      const response = mapListResponse(result.data?.invoices, 'REAL', result.data?.invoices?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_INVOICES, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getPayments(): Promise<FinanceListResponse<FinancePayment>> {
    const result = await fetchJson<{ payments: FinancePayment[] }>(`${BASE}/payments`);
    if (result.ok) {
      const response = mapListResponse(result.data?.payments, 'REAL', result.data?.payments?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_PAYMENTS, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getProjects(): Promise<FinanceListResponse<FinanceProject>> {
    const result = await fetchJson<{ projects: FinanceProject[] }>(`${BASE}/projects`);
    if (result.ok) {
      const response = mapListResponse(result.data?.projects, 'REAL', result.data?.projects?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_PROJECTS, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getLineage(entityId?: string): Promise<FinanceListResponse<FinanceLineageRecord>> {
    const url = entityId ? `${BASE}/lineage/${entityId}` : `${BASE}/lineage`;
    const result = await fetchJson<{ lineage: FinanceLineageRecord[] }>(url);
    if (result.ok) {
      const response = mapListResponse(result.data?.lineage, 'REAL', result.data?.lineage?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_LINEAGE, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getQuality(): Promise<FinanceListResponse<DataQualityScore>> {
    const result = await fetchJson<{ quality: DataQualityScore[] }>(`${BASE}/quality`);
    if (result.ok) {
      const response = mapListResponse(result.data?.quality, 'REAL', result.data?.quality?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(FIXTURE_QUALITY, 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getMetrics(): Promise<FinanceListResponse<FinanceMetric>> {
    const result = await fetchJson<{ metrics: FinanceMetric[] }>(`${BASE}/metrics`);
    if (result.ok) {
      const response = mapListResponse(result.data?.metrics, 'REAL', result.data?.metrics?.length ?? 0);
      if (response) return response;
    }

    if (!result.ok) {
      if (isFinanceDemoModeEnabled()) return fixtureList(buildMetricsFromFixtures(), 'SIMULATED');
      return unavailableList(result.error);
    }

    return unavailableList();
  },

  async getCommandState(): Promise<any> {
    const result = await fetchJson<any>(`${BASE}/command-state`);
    if (result.ok) return result.data;
    return null;
  },

  async getAuditTrail(): Promise<any[]> {
    const result = await fetchJson<any[]>(`${BASE}/audit-trail`);
    if (result.ok) return Array.isArray(result.data) ? result.data : [];
    return [];
  },

  async executeAction(actionType: string, payload?: any): Promise<{ success: boolean; message: string; auditId: string; reference?: string; sha256Hash?: string; result?: any; commandState?: any; enactment?: any } | null> {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('atlas_access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE}/actions/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ actionType, payload }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    } catch {
      return null;
    }
  },

  async getProjectDeepDive(projectId: string): Promise<any> {
    const result = await fetchJson<any>(`${BASE}/project-deepdive/${projectId}`);
    if (result.ok) return result.data;
    return null;
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
