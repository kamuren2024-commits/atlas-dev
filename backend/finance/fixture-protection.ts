/**
 * CP-03 — PRODUCTION FIXTURE PROTECTION
 *
 * Implements Rule 12 (production fixture protection) that:
 *   - Tags every dev/demo fixture with { environment: 'development', isFixture: true }
 *   - In PROD_MODE=true: blocks fixture ingestion, fixture records, fixture-only
 *     sources, mock fallback, and demo financial values
 *   - Returns explicit "DATA UNAVAILABLE" state instead of silently falling back
 *     to mocks
 *
 * Non-negotiable: Never fabricate financial data.  Never treat fixtures as real.
 */

import type { DataState } from './types';

export const PROD_MODE = (): boolean => String(process.env.PROD_MODE).trim().toLowerCase() === 'true';

export interface FixtureAwareMeta {
  isFixture: boolean;
  environment: string;
  dataState: DataState;
}

/**
 * Decorate any incoming record with CP-03 metadata defaults.
 * Callers may override environment but the resulting record always exposes
 * a dataState consumers can trust.
 */
export function decorateFixtureMeta<T extends Partial<FixtureAwareMeta>>(
  record: T,
  opts: { explicitIsFixture?: boolean; explicitEnvironment?: FixtureAwareMeta['environment'] } = {}
): T & FixtureAwareMeta {
  const isFixture =
    opts.explicitIsFixture ??
    (record?.isFixture as boolean | undefined) ??
    false;

  const environment =
    opts.explicitEnvironment ??
    (record?.environment as FixtureAwareMeta['environment'] | undefined) ??
    'development';

  let dataState: DataState;
  if (isFixture) {
    dataState = 'DEVELOPMENT_FIXTURE';
  } else if (!record) {
    dataState = 'UNAVAILABLE';
  } else {
    dataState = 'REAL';
  }

  return { ...record, isFixture, environment, dataState } as T & FixtureAwareMeta;
}

/**
 * Execute a fixture guard.  Returns an object with:
 *   blocked: true  → PROD_MODE=true and the record is a fixture.  Caller MUST abort.
 *   blocked: false → operation may proceed.
 *
 * Emits a structured warning (console.warn) so observability captures the attempt.
 */
export function fixtureGuard<T extends Partial<FixtureAwareMeta>>(
  record: T | null | undefined,
  operation: string,
  actor?: string
): { blocked: boolean; reason?: string; dataState: DataState } {
  const meta = decorateFixtureMeta(record ?? ({} as T));

  if (PROD_MODE() && meta.isFixture) {
    const reason =
      `CP-03 BLOCKED operation="${operation}" actor="${actor ?? 'unknown'}" ` +
      `reason="Fixture record in PROD_MODE" environment="${meta.environment}"`;
    console.warn('[FINANCE][CP-03]', reason);
    return { blocked: true, reason, dataState: 'UNAVAILABLE' };
  }

  return { blocked: false, dataState: meta.dataState };
}

/**
 * Given a data-availability indicator, compute the explicit DataState that a
 * consumer / API should surface.  Never fabricate; never silent-fallback.
 *
 * @param realPresent    true iff at least one real (non-fixture) record exists
 * @param fixtureOnly    true iff the only records are fixtures
 * @param staleHours     hours since last successful ingestion
 * @param partialRatio   0..1  — how many of the required entities are present
 */
export function computeDataState(args: {
  realPresent: boolean;
  fixtureOnly: boolean;
  staleHours?: number;
  partialRatio?: number;
}): DataState {
  if (PROD_MODE() && args.fixtureOnly) {
    return 'UNAVAILABLE';
  }
  if (!args.realPresent && !args.fixtureOnly) {
    return 'UNAVAILABLE';
  }
  if (typeof args.staleHours === 'number' && args.staleHours > 72) {
    return 'STALE';
  }
  if (typeof args.partialRatio === 'number' && args.partialRatio < 0.75 && args.partialRatio > 0) {
    return 'PARTIAL';
  }
  if (args.fixtureOnly) {
    return 'DEVELOPMENT_FIXTURE';
  }
  return 'REAL';
}
