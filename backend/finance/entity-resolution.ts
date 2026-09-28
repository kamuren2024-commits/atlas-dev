/**
 * 01-12 — FINANCE ENTITY RESOLUTION ENGINE
 *
 * Maps Finance canonical references to KETRACO enterprise entities.
 * Resolves:
 *   Project Code   → KETRACO Project
 *   Supplier ID    → Supplier
 *   Cost Centre    → Cost Centre
 *   Account Code   → Account
 *   Asset ID       → Asset
 *   Department     → Department
 *
 * Non-negotiable: If confidence is insufficient → UNRESOLVED.
 * Never guess.  Never fabricate IDs.
 *
 * Reuses existing enterprise entity-resolution infrastructure via a
 * pluggable Provider interface.
 */

import crypto from 'crypto';
import type { EntityResolutionResult, ResolutionStatus } from './types';

export type FinanceKeyField =
  | 'projectCode'
  | 'supplierCode'
  | 'costCentre'
  | 'accountCode'
  | 'assetId'
  | 'department';

export interface EntityReference {
  kind: FinanceKeyField;
  value: string;
  extraContext?: Record<string, unknown>;
}

export interface EntityResolutionProvider {
  readonly domain?: EntityResolutionResult['remoteDomain'];
  resolve(kind: FinanceKeyField, value: string, ctx?: Record<string, unknown>): Promise<{
    found: boolean;
    entityKind?: string;
    entityId?: string;
    remoteEntityKind?: string;
    remoteEntityId?: string;
    remoteDomain?: EntityResolutionResult['remoteDomain'];
    confidenceLevel: EntityResolutionResult['confidenceLevel'];
    rule?: string;
    alternatives?: { entityKind: string; entityId: string; confidenceLevel: EntityResolutionResult['confidenceLevel'] }[];
  }>;
}

/**
 * In-memory provider used for dev fixtures and the E2E acceptance test.
 * In production this is replaced with providers backed by the actual
 * Projects / Procurement / Assets services.
 */
export class InMemoryEntityResolutionProvider implements EntityResolutionProvider {
  readonly domain: EntityResolutionResult['remoteDomain'];
  constructor(
    domain: EntityResolutionResult['remoteDomain'],
    private readonly map: Partial<Record<FinanceKeyField, Map<string, { entityKind: string; entityId: string; confidence?: EntityResolutionResult['confidenceLevel'] }>>> = {}
  ) {
    this.domain = domain;
  }

  register(kind: FinanceKeyField, value: string, entry: { entityKind: string; entityId: string; confidence?: EntityResolutionResult['confidenceLevel'] }) {
    if (!this.map[kind]) this.map[kind] = new Map();
    this.map[kind]!.set(value, entry);
  }

  async resolve(kind: FinanceKeyField, value: string): Promise<Awaited<ReturnType<EntityResolutionProvider['resolve']>>> {
    const m = this.map[kind]?.get(value);
    if (!m) return { found: false, confidenceLevel: 'UNKNOWN' };
    return {
      found: true,
      entityKind: m.entityKind,
      entityId: m.entityId,
      confidenceLevel: m.confidence ?? 'STRONG',
      rule: `InMemoryProvider[${this.domain}]::lookup(${kind}=${value})`
    };
  }
}

export class FinanceEntityResolver {
  constructor(
    private readonly providers: EntityResolutionProvider[] = [],
    private readonly defaultActor = 'system:finance-resolver'
  ) {}

  register(p: EntityResolutionProvider) {
    this.providers.push(p);
  }

  /**
   * Resolve a single reference.
   * Status: RESOLVED   → 1 strong match
   *         AMBIGUOUS  → multiple matches with comparable confidence
   *         REQUIRES_REVIEW → weak match with medium confidence
   *         UNRESOLVED → insufficient evidence.  Never guessed.
   */
  async resolve(reference: EntityReference, financeScope: { financeEntityKind: string; financeEntityId?: string; sourceSystem?: string }): Promise<EntityResolutionResult> {
    const now = new Date().toISOString();
    for (const p of this.providers) {
      const res = await p.resolve(reference.kind, reference.value, reference.extraContext);
      if (!res.found) continue;
      let status: ResolutionStatus;
      if (res.confidenceLevel === 'STRONG') status = 'RESOLVED';
      else if (res.confidenceLevel === 'MEDIUM') status = 'REQUIRES_REVIEW';
      else if (res.alternatives && res.alternatives.length > 0) status = 'AMBIGUOUS';
      else status = 'UNRESOLVED';

      // Providers may return either the canonical entityId/entityKind pair or
      // the remoteEntityId/remoteEntityKind pair (spec §01-12); both are honored.
      const matchedKind = res.remoteEntityKind ?? res.entityKind;
      const matchedId = res.remoteEntityId ?? res.entityId;
      const matchedDomain = res.remoteDomain ?? p.domain ?? 'projects';

      return {
        mappingId: `map_${crypto.randomBytes(8).toString('hex')}`,
        financeEntityKind: financeScope.financeEntityKind,
        financeEntityId: financeScope.financeEntityId,
        remoteDomain: matchedDomain,
        remoteEntityKind: matchedKind ?? 'UNKNOWN',
        remoteEntityId: status === 'RESOLVED' ? matchedId : undefined,
        mappingType: status === 'UNRESOLVED' ? 'UNRESOLVED' : 'INFERRED',
        confidenceLevel: res.confidenceLevel,
        status,
        resolvedBy: this.defaultActor,
        resolvedAt: now,
        mappingRule: res.rule ?? 'provider-default'
      };
    }

    return {
      mappingId: `map_${crypto.randomBytes(8).toString('hex')}`,
      financeEntityKind: financeScope.financeEntityKind,
      financeEntityId: financeScope.financeEntityId,
      remoteDomain: 'projects',
      remoteEntityKind: reference.kind,
      remoteEntityId: undefined,
      mappingType: 'UNRESOLVED',
      confidenceLevel: 'UNKNOWN',
      status: 'UNRESOLVED',
      resolvedBy: this.defaultActor,
      resolvedAt: now,
      mappingRule: `No provider resolved ${reference.kind}=${reference.value}`
    };
  }

  /**
   * Batch resolution convenience — returns an array of results, one per input.
   * Preserves order; outputs always include UNRESOLVED for anything not matched.
   */
  async resolveAll(refs: EntityReference[], scope: { financeEntityKind: string; financeEntityId?: string; sourceSystem?: string }): Promise<EntityResolutionResult[]> {
    const out: EntityResolutionResult[] = [];
    for (const r of refs) out.push(await this.resolve(r, scope));
    return out;
  }
}
