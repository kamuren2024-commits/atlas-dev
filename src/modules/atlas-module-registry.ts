export const ATLAS_TOP_LEVEL_MODULE_IDS = [
  'overview',
  'meeting-intelligence',
  'drone-intelligence',
  'tender',
  'project',
  'inventory',
  'supplier',
  'logistics',
  'risk',
  'twin',
  'sourcing',
  'executive',
  'admin',
  'agents',
  'decision',
  'ai-ops',
  'acin',
  'ai-runtime',
  'procurement-graph',
  'intelligence',
  'finance',
  'atlas-demo',
] as const;

export type AtlasModuleId = (typeof ATLAS_TOP_LEVEL_MODULE_IDS)[number];

export function normalizeAtlasModuleId(value: string | null | undefined): AtlasModuleId | null {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate) return null;
  return ATLAS_TOP_LEVEL_MODULE_IDS.includes(candidate as AtlasModuleId)
    ? (candidate as AtlasModuleId)
    : null;
}

export function resolveAtlasModuleFromPath(pathname: string): AtlasModuleId {
  const route = pathname.replace(/\/+$/, '') || '/';
  const normalized = route.toLowerCase();

  const pathMap: Array<[string, AtlasModuleId]> = [
    ['/meeting-intelligence', 'meeting-intelligence'],
    ['/drone-intelligence', 'drone-intelligence'],
    ['/project-supply-nexus', 'project'],
    ['/project', 'project'],
    ['/tender', 'tender'],
    ['/overview', 'overview'],
    ['/atlas-demo', 'atlas-demo'],
    ['/inventory', 'inventory'],
    ['/supplier', 'supplier'],
    ['/logistics', 'logistics'],
    ['/risk', 'risk'],
    ['/twin', 'twin'],
    ['/sourcing', 'sourcing'],
    ['/executive', 'executive'],
    ['/admin', 'admin'],
    ['/agents', 'agents'],
    ['/decision', 'decision'],
    ['/ai-ops', 'ai-ops'],
    ['/acin', 'acin'],
    ['/ai-runtime', 'ai-runtime'],
    ['/procurement-graph', 'procurement-graph'],
    ['/intelligence', 'intelligence'],
    ['/finance', 'finance'],
  ];

  const match = pathMap.find(([pattern]) => normalized === pattern || normalized.startsWith(`${pattern}/`));
  return match?.[1] ?? 'overview';
}

export const LOGISTICS_VIEW_IDS = [
  'command-center',
  'shipments',
  'fleet',
  'warehouses',
  'routes',
  'deliveries',
  'disruptions',
  'ai-operations',
  'analytics',
] as const;

export type LogisticsViewId = (typeof LOGISTICS_VIEW_IDS)[number];

const LEGACY_LOGISTICS_VIEW_ID_MAP: Record<string, LogisticsViewId> = {
  'logistics-command-center': 'command-center',
  'logistics-shipments': 'shipments',
  'logistics-fleet': 'fleet',
  'logistics-warehouses': 'warehouses',
  'logistics-routes': 'routes',
  'logistics-deliveries': 'deliveries',
  'logistics-disruptions': 'disruptions',
  'logistics-ai-operations': 'ai-operations',
  'logistics-analytics': 'analytics',
};

export function normalizeLogisticsViewId(value: string | null | undefined): LogisticsViewId | null {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate) return null;

  if (LOGISTICS_VIEW_IDS.includes(candidate as LogisticsViewId)) {
    return candidate as LogisticsViewId;
  }

  const legacyId = LEGACY_LOGISTICS_VIEW_ID_MAP[candidate];
  return legacyId ?? null;
}
