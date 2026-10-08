/**
 * Canonical asset identity resolution for GIS / digital-twin projections.
 * The canonical ID is the authoritative identifier; names and coordinates are
 * treated as metadata, not primary identity.
 */

import { CanonicalGridModel } from '../digital-twin/canonical-model';
import type { CanonicalAssetResolution } from './types';

export class CanonicalAssetResolver {
  private static registryReady = false;
  private static registry: Map<string, { assetId: string; canonicalAssetId: string }> = new Map();

  public static getInstance(): CanonicalAssetResolver {
    if (!(this as any)._instance) {
      (this as any)._instance = new CanonicalAssetResolver();
    }
    return (this as any)._instance;
  }

  public resolve(input: Record<string, any> | string | undefined | null): CanonicalAssetResolution | null {
    try {
      const candidates = this.extractCandidates(input);
      if (candidates.length === 0) {
        return null;
      }

      for (const candidate of candidates) {
        const key = this.normalize(candidate.value);
        if (!key) continue;

        const known = this.lookupCanonicalAsset(key);
        if (known) {
          return {
            assetId: known.assetId,
            canonicalAssetId: known.assetId,
            sourceId: candidate.sourceId,
            sourceAssetId: candidate.sourceAssetId,
            gisFeatureId: candidate.gisFeatureId,
            confidence: candidate.confidence,
            matchedBy: candidate.matchedBy,
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  public resolveAssetId(input: Record<string, any> | string | undefined | null): string | null {
    const resolution = this.resolve(input);
    return resolution?.canonicalAssetId ?? null;
  }

  private extractCandidates(input: Record<string, any> | string | undefined | null): Array<{
    value: string;
    sourceId?: string;
    sourceAssetId?: string;
    gisFeatureId?: string;
    confidence: number;
    matchedBy: string[];
  }> {
    if (!input) return [];

    if (typeof input === 'string') {
      return [{ value: input, confidence: 0.65, matchedBy: ['literal'] }];
    }

    const candidates: Array<{ value: string; sourceId?: string; sourceAssetId?: string; gisFeatureId?: string; confidence: number; matchedBy: string[] }> = [];

    const candidateValues = [
      { key: 'canonicalAssetId', value: input.canonicalAssetId, source: 'canonicalAssetId', confidence: 0.99 },
      { key: 'assetId', value: input.assetId, source: 'assetId', confidence: 0.99 },
      { key: 'sourceAssetId', value: input.sourceAssetId, source: 'sourceAssetId', confidence: 0.95 },
      { key: 'sourceId', value: input.sourceId, source: 'sourceId', confidence: 0.8 },
      { key: 'gisFeatureId', value: input.gisFeatureId || input.featureId, source: 'gisFeatureId', confidence: 0.92 },
      { key: 'externalId', value: input.externalId, source: 'externalId', confidence: 0.9 },
      { key: 'assetIdentifier', value: input.assetIdentifier, source: 'assetIdentifier', confidence: 0.88 },
      { key: 'name', value: input.name, source: 'name', confidence: 0.65 },
    ];

    for (const entry of candidateValues) {
      if (!entry.value || typeof entry.value !== 'string') continue;
      candidates.push({
        value: entry.value,
        sourceId: input.sourceId,
        sourceAssetId: input.sourceAssetId,
        gisFeatureId: input.gisFeatureId || input.featureId,
        confidence: entry.confidence,
        matchedBy: [entry.source],
      });
    }

    if (input.asset) {
      const nested = input.asset;
      if (typeof nested.assetId === 'string') {
        candidates.push({ value: nested.assetId, sourceId: input.sourceId, sourceAssetId: nested.assetId, confidence: 0.99, matchedBy: ['asset.assetId'] });
      }
      if (typeof nested.canonicalAssetId === 'string') {
        candidates.push({ value: nested.canonicalAssetId, sourceId: input.sourceId, sourceAssetId: nested.canonicalAssetId, confidence: 0.99, matchedBy: ['asset.canonicalAssetId'] });
      }
      if (typeof nested.name === 'string') {
        candidates.push({ value: nested.name, sourceId: input.sourceId, sourceAssetId: nested.assetId, confidence: 0.65, matchedBy: ['asset.name'] });
      }
    }

    return candidates;
  }

  private lookupCanonicalAsset(value: string): { assetId: string; canonicalAssetId: string } | null {
    const normalized = this.normalize(value);
    if (!normalized) return null;

    const existing = this.getRegistry().get(normalized);
    if (existing) {
      return existing;
    }

    for (const asset of CanonicalGridModel.getAllAssets()) {
      const candidates = [
        asset.asset_id,
        asset.name,
        asset.gis_mapping?.feature_id,
        asset.digital_twin_mapping?.node_id,
        asset.scada_mapping?.rtu_id,
      ].filter(Boolean).map((entry) => this.normalize(String(entry)));

      if (candidates.includes(normalized)) {
        return { assetId: asset.asset_id, canonicalAssetId: asset.asset_id };
      }
    }

    return null;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .replace(/[\s_]+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  private getRegistry(): Map<string, { assetId: string; canonicalAssetId: string }> {
    if (!CanonicalAssetResolver.registryReady) {
      const registry = new Map<string, { assetId: string; canonicalAssetId: string }>();
      for (const asset of CanonicalGridModel.getAllAssets()) {
        const identifiers = [
          asset.asset_id,
          asset.name,
          asset.gis_mapping?.feature_id,
          asset.digital_twin_mapping?.node_id,
        ];

        for (const identifier of identifiers.filter(Boolean)) {
          const key = this.normalize(String(identifier));
          if (key) registry.set(key, { assetId: asset.asset_id, canonicalAssetId: asset.asset_id });
        }
      }
      CanonicalAssetResolver.registry = registry;
      CanonicalAssetResolver.registryReady = true;
    }
    return CanonicalAssetResolver.registry;
  }
}

export default CanonicalAssetResolver;
