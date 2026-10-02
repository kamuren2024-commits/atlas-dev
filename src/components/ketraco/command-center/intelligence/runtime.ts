export type EngineeringRuntimeStatus =
  | { state: 'LOADING'; message: string }
  | { state: 'READY'; message: string; scenarios: unknown[]; lastUpdated: string; tenantId?: string }
  | { state: 'UNAUTHENTICATED'; message: string }
  | { state: 'FORBIDDEN'; message: string }
  | { state: 'UNAVAILABLE'; message: string }
  | { state: 'ERROR'; message: string };

export function getAtlasAuthHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('atlas_access_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function getTenantIdFromStorage(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined;

  const value = localStorage.getItem('atlas_user');
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as { tenantId?: string };
    return parsed.tenantId;
  } catch {
    return undefined;
  }
}

export async function fetchEngineeringRuntime(): Promise<EngineeringRuntimeStatus> {
  try {
    const response = await fetch('/api/twin/engineering/scenarios?limit=10&offset=0', {
      headers: getAtlasAuthHeaders(),
    });

    if (response.status === 401) {
      return { state: 'UNAUTHENTICATED', message: 'Authentication required for the engineering runtime.' };
    }

    if (response.status === 403) {
      return { state: 'FORBIDDEN', message: 'Engineering runtime access is forbidden for this tenant.' };
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return {
        state: 'UNAVAILABLE',
        message: payload?.error?.message || 'The engineering runtime is unavailable.',
      };
    }

    const payload = await response.json();
    const scenarios = Array.isArray(payload?.data) ? payload.data : [];

    return {
      state: 'READY',
      message: scenarios.length
        ? 'Live engineering context is available from the backend runtime.'
        : 'Engineering runtime is authenticated but no scenarios are persisted yet.',
      scenarios,
      lastUpdated: new Date().toISOString(),
      tenantId: getTenantIdFromStorage(),
    };
  } catch (error) {
    return {
      state: 'ERROR',
      message: error instanceof Error ? error.message : 'Engineering runtime request failed.',
    };
  }
}

export async function createEngineeringScenario(input: {
  name: string;
  scenarioClass: 'OUTAGE' | 'BASELINE' | 'N_MINUS_1' | 'CUSTOM';
  changes?: Array<{ targetAssetId: string; changeType: string; value?: string | number | boolean | null; description?: string }>;
  assumptions?: string[];
  requestedAnalysis?: string[];
}) {
  const response = await fetch('/api/twin/engineering/scenarios', {
    method: 'POST',
    headers: getAtlasAuthHeaders(),
    body: JSON.stringify({
      name: input.name,
      scenarioClass: input.scenarioClass,
      changes: input.changes ?? [],
      assumptions: input.assumptions ?? [],
      requestedAnalysis: input.requestedAnalysis ?? ['CUSTOM_SCENARIO_ANALYSIS'],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: payload?.error?.message || 'Scenario creation failed.',
      data: null,
    };
  }

  return {
    ok: true,
    status: response.status,
    message: 'Scenario created in the engineering runtime.',
    data: payload?.data ?? null,
  };
}

export async function requestEngineeringSimulation(scenarioId: string) {
  const response = await fetch(`/api/twin/engineering/scenarios/${scenarioId}/simulations`, {
    method: 'POST',
    headers: {
      ...getAtlasAuthHeaders(),
      'Idempotency-Key': `${scenarioId}-${Date.now()}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: payload?.error?.message || 'Simulation request failed.',
      data: null,
    };
  }

  return {
    ok: true,
    status: response.status,
    message: 'Simulation execution request accepted by the engineering runtime.',
    data: payload?.data ?? null,
  };
}
