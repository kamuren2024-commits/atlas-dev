export type FreshnessStatus = 'LIVE' | 'STALE' | 'UNAVAILABLE';

export interface SourceFreshness {
  source: string;
  table: string;
  recordCount: number;
  lastUpdatedAt: string | null;
  status: FreshnessStatus;
  reason?: string;
}

export function classifyFreshness(
  lastUpdatedAt: string | null | undefined,
  now = Date.now(),
  staleAfterMs = 24 * 60 * 60 * 1000,
): FreshnessStatus {
  if (!lastUpdatedAt) return 'UNAVAILABLE';
  const timestamp = Date.parse(lastUpdatedAt);
  if (!Number.isFinite(timestamp)) return 'UNAVAILABLE';
  return now - timestamp <= staleAfterMs ? 'LIVE' : 'STALE';
}

export function buildSourceFreshness(
  source: string,
  table: string,
  recordCount: number,
  lastUpdatedAt: string | null | undefined,
): SourceFreshness {
  const status = classifyFreshness(lastUpdatedAt);
  return {
    source,
    table,
    recordCount,
    lastUpdatedAt: lastUpdatedAt || null,
    status,
    ...(status === 'UNAVAILABLE'
      ? { reason: 'No validated source timestamp is available.' }
      : {}),
  };
}
