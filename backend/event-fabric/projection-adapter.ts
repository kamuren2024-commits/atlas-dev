/**
 * Small, targeted GIS / digital-twin projection layer.
 * It consumes the canonical event stream, resolves an authoritative asset ID,
 * and stores a projection snapshot without inventing new operational state.
 */

import { CanonicalAssetResolver } from './canonical-asset-resolver';
import { EventStateStore } from './state-store';
import { CanonicalEvent, SpatialProjectionState, SpatialProjectionVersion } from './types';

export class SpatialProjectionAdapter {
  private readonly resolver = CanonicalAssetResolver.getInstance();
  private readonly stateStore = EventStateStore.getInstance();
  private readonly projections = new Map<string, SpatialProjectionState>();

  public applyEvent(event: CanonicalEvent): SpatialProjectionState | null {
    const assetId = this.getCanonicalAssetId(event);
    if (!assetId) {
      return null;
    }

    const selection = this.stateStore.recordProjectionVersion(event);
    if (selection === 'ignored_duplicate' || selection === 'rejected_stale') {
      return this.projections.get(assetId) || null;
    }

    const observedAt = (event as any).observedAt || event.timestamp || new Date().toISOString();
    const sourceEventId = (event as any).sourceEventId || event.id;
    const version = Number((event as any).version ?? (event as any).eventVersion ?? (event as any).payloadVersion ?? 1);

    const projectedState: SpatialProjectionState = {
      assetId,
      canonicalAssetId: assetId,
      sourceEventId,
      version: Number.isFinite(version) ? version : 1,
      observedAt,
      state: {
        ...(event as any).data || {},
        category: event.category,
        eventType: event.eventType,
        severity: event.severity,
        status: event.status,
      },
      lastUpdatedAt: observedAt,
      freshness: 'LIVE_AUTHORITATIVE',
      authority: 'AUTHORITATIVE',
    };

    this.projections.set(assetId, projectedState);
    this.stateStore.setProjectionState(assetId, projectedState);

    const projectionVersion: SpatialProjectionVersion = {
      assetId,
      version: projectedState.version || 1,
      observedAt,
      sourceEventId,
    };
    this.stateStore.getProjectionVersion(assetId);
    this.stateStore.setProjectionState(assetId, projectedState);

    void projectionVersion;
    return projectedState;
  }

  public getProjection(assetId: string): SpatialProjectionState | undefined {
    return this.projections.get(assetId) || this.stateStore.getProjectionState(assetId);
  }

  public getLatestProjection(assetId: string): SpatialProjectionState | undefined {
    return this.getProjection(assetId);
  }

  public resolveAssetId(event: CanonicalEvent): string | null {
    return this.getCanonicalAssetId(event);
  }

  public resolveCanonicalAssetId(event: CanonicalEvent): string | null {
    return this.getCanonicalAssetId(event);
  }

  public getAllProjections(): SpatialProjectionState[] {
    return Array.from(this.projections.values());
  }

  private getCanonicalAssetId(event: CanonicalEvent): string | null {
    const raw = {
      assetId: (event as any).assetId,
      canonicalAssetId: (event as any).canonicalAssetId,
      gisFeatureId: (event as any).gisFeatureId || (event as any).featureId,
      sourceId: event.sourceId || (event as any).source?.providerId,
      sourceAssetId: (event as any).sourceAssetId,
      name: (event as any).name,
      asset: (event as any).asset,
      data: (event as any).data,
    };

    const resolution = this.resolver.resolve(raw);
    if (!resolution) {
      return null;
    }
    return resolution.canonicalAssetId;
  }
}

export default SpatialProjectionAdapter;
