/**
 * Shared Atlas integration contracts.
 *
 * These contracts are additive: existing domain payloads can adopt them
 * incrementally without changing their current API shapes.
 */

export type AtlasEntityType =
  | 'Person'
  | 'Organization'
  | 'Employee'
  | 'Supplier'
  | 'Director'
  | 'Tender'
  | 'Bid'
  | 'Evaluation'
  | 'Contract'
  | 'Project'
  | 'Asset'
  | 'Substation'
  | 'Transformer'
  | 'TransmissionLine'
  | 'Tower'
  | 'Shipment'
  | 'InventoryItem'
  | 'Warehouse'
  | 'Invoice'
  | 'Payment'
  | 'Risk'
  | 'Incident'
  | 'Document'
  | 'Location'
  | 'Community'
  | 'Parcel'
  | 'Wayleave'
  | 'Regulation'
  | 'Policy'
  | 'Workflow'
  | 'Decision'
  | 'Agent'
  | 'Mission';

export interface AtlasEntityRef {
  id: string;
  type: AtlasEntityType;
  tenantId: string;
  sourceSystem: string;
  sourceId: string;
  observedAt: string;
  version: string;
}

export interface AtlasProvenance {
  source: string;
  sourceRecordId?: string;
  evidenceIds?: string[];
  transformation?: string;
  observedAt: string;
}

export interface AtlasEventEnvelope<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  tenantId: string;
  source: string;
  correlationId: string;
  payloadVersion: string;
  entity?: AtlasEntityRef;
  provenance?: AtlasProvenance[];
  payload: TPayload;
}

export function createAtlasEventEnvelope<TPayload>(
  input: Omit<AtlasEventEnvelope<TPayload>, 'eventId' | 'occurredAt'>
    & { eventId?: string; occurredAt?: string }
): AtlasEventEnvelope<TPayload> {
  return {
    ...input,
    eventId: input.eventId || `atlas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: input.occurredAt || new Date().toISOString(),
  };
}

export function toAtlasEntityRef(
  input: Omit<AtlasEntityRef, 'observedAt' | 'version'>
    & { observedAt?: string; version?: string }
): AtlasEntityRef {
  return {
    ...input,
    observedAt: input.observedAt || new Date().toISOString(),
    version: input.version || '1.0',
  };
}
