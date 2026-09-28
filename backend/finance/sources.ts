/**
 * 01-03 — FINANCE SOURCE REGISTRY
 * 01-04 — FINANCE CONNECTOR CONTRACT
 *
 * SourceRegistry holds registered sources, and Connector defines the pluggable connector interface
 * adapter contract.
 *
 * External systems must map into canonical Finance contracts rather
 * rather than leaking vendor-specific schemas into the domain.
 *
 * Future adapters: SAP S/4HANA, SAP Ariba, Excel, CSV, REST APIs,
 * Databases, Banking/Treasury, Project Systems.
 */

import crypto from 'crypto';
import type { FinanceSourceRecord, FinanceSourceType, SourceStatus, ConnectionStatus, DataClassification } from './types';

// ----------------------------------------------------------------------
// SOURCE REGISTRY — 01-03
// ----------------------------------------------------------------------

export class FinanceSourceRegistry {
  private sources: Map<string, FinanceSourceRecord> = new Map();

  register(input: {
    name: string;
    sourceType: FinanceSourceType;
    system?: string;
    owner?: string;
    dataClassification?: DataClassification;
    credentialReference?: string;
    configuration?: Record<string, unknown>;
    isFixture?: boolean;
    environment?: FinanceSourceRecord['environment'];
    tenantId?: string;
  }): FinanceSourceRecord {
    const sourceId = `src_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();
    const record: FinanceSourceRecord = {
      sourceId,
      name: input.name,
      sourceType: input.sourceType,
      system: input.system,
      status: 'REGISTERED',
      owner: input.owner,
      connectionStatus: 'DISCONNECTED',
      dataClassification: input.dataClassification ?? 'FINANCE_SENSITIVE',
      credentialReference: input.credentialReference,
      configuration: input.configuration ?? {},
      isFixture: input.isFixture ?? false,
      environment: input.environment ?? 'development',
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now
    };
    this.sources.set(sourceId, record);
    return record;
  }

  update(sourceId: string, patch: Partial<FinanceSourceRecord>): FinanceSourceRecord | undefined {
    const existing = this.sources.get(sourceId);
    if (!existing) return undefined;
    const updated: FinanceSourceRecord = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.sources.set(sourceId, updated);
    return updated;
  }

  setStatus(sourceId: string, status: SourceStatus): FinanceSourceRecord | undefined {
    return this.update(sourceId, { status });
  }

  setConnectionStatus(sourceId: string, connectionStatus: ConnectionStatus): FinanceSourceRecord | undefined {
    return this.update(sourceId, {
      connectionStatus,
      lastAttemptedSync: new Date().toISOString()
    });
  }

  markSuccessfulSync(sourceId: string): FinanceSourceRecord | undefined {
    return this.update(sourceId, {
      connectionStatus: 'CONNECTED',
      lastSuccessfulSync: new Date().toISOString()
    });
  }

  get(sourceId: string): FinanceSourceRecord | undefined {
    return this.sources.get(sourceId);
  }

  list(filter?: { sourceType?: FinanceSourceType; status?: SourceStatus; isFixture?: boolean }): FinanceSourceRecord[] {
    let arr = Array.from(this.sources.values());
    if (filter?.sourceType) arr = arr.filter(s => s.sourceType === filter.sourceType);
    if (filter?.status) arr = arr.filter(s => s.status === filter.status);
    if (typeof filter?.isFixture === 'boolean') arr = arr.filter(s => s.isFixture === filter.isFixture);
    return arr;
  }

  all(): FinanceSourceRecord[] {
    return Array.from(this.sources.values());
  }
}

// Singleton for the Atlas runtime
export const financeSourceRegistry = new FinanceSourceRegistry();

// ----------------------------------------------------------------------
// CONNECTOR CONTRACT — 01-04
// ----------------------------------------------------------------------

export interface ConnectorFetchOptions {
  checkpoint?: unknown;
  limit?: number;
  entityKind?: string;
  since?: string;
  until?: string;
  params?: Record<string, unknown>;
}

export interface ConnectorSchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'boolean' | 'enum' | 'object';
  required?: boolean;
  description?: string;
  enumValues?: string[];
  currencyCodeField?: string;
}

export interface ConnectorSchemaEntity {
  entityKind: string;
  fields: ConnectorSchemaField[];
  primaryKey: string[];
  foreignKeys?: { from: string[]; toEntity: string; to: string[] }[];
}

export interface ConnectorStreamChunk {
  entityKind: string;
  records: Record<string, unknown>[];
  nextCheckpoint?: unknown;
  isLastChunk: boolean;
}

export interface FinanceConnector {
  readonly sourceId: string;
  readonly sourceType: FinanceSourceType;

  connect(): Promise<{ ok: boolean; error?: string }>;
  authenticate(): Promise<{ ok: boolean; error?: string }>;
  validateConnection(): Promise<{ ok: boolean; latencyMs?: number; error?: string }>;
  discoverSchema(): Promise<{ ok: boolean; entities?: ConnectorSchemaEntity[]; error?: string }>;
  fetch(options?: ConnectorFetchOptions): Promise<{ ok: boolean; records: Record<string, unknown>[]; checkpoint?: unknown; error?: string }>;
  stream(options?: ConnectorFetchOptions): AsyncIterable<ConnectorStreamChunk>;
  getCheckpoint(): Promise<unknown>;
  checkpoint(state: unknown): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Base connector that does nothing except return empty results — used for newly registered
 * sources whose concrete adapter will be plugged in later.  This ensures the
 * ingestion pipeline never crashes on an unimplemented connector.
 */
export class NullFinanceConnector implements FinanceConnector {
  constructor(public readonly sourceId: string, public readonly sourceType: FinanceSourceType) {}
  async connect() { return { ok: false, error: 'NullFinanceConnector: not implemented for source ' + this.sourceType }; }
  async authenticate() { return { ok: false, error: 'NullFinanceConnector: not implemented' }; }
  async validateConnection() { return { ok: false, error: 'NullFinanceConnector: not implemented' }; }
  async discoverSchema() { return { ok: false, error: 'NullFinanceConnector: not implemented' }; }
  async fetch() { return { ok: false, records: [] }; }
  async *stream() { yield { entityKind: 'unknown', records: [], isLastChunk: true }; }
  async getCheckpoint() { return undefined; }
  async checkpoint() { /* noop */ }
  async disconnect() { /* noop */ }
}

/**
 * In-memory adapter that yields pre-cooked records — used for dev fixtures and the
 * end-to-end acceptance test (§21) only.  Never used in production.
 */
export class InMemoryFinanceConnector implements FinanceConnector {
  constructor(
    public readonly sourceId: string,
    public readonly sourceType: FinanceSourceType,
    private readonly seeded: { entityKind: string; records: Record<string, unknown>[] }[]
  ) {}
  async connect() { return { ok: true }; }
  async authenticate() { return { ok: true }; }
  async validateConnection() { return { ok: true, latencyMs: 2 }; }
  async discoverSchema() {
    const entities: ConnectorSchemaEntity[] = this.seeded.map(s => ({
      entityKind: s.entityKind,
      primaryKey: ['id'],
      fields: [{ name: 'id', type: 'string' as const, required: true }]
    }));
    return { ok: true, entities };
  }
  async fetch() {
    const all: Record<string, unknown>[] = [];
    for (const s of this.seeded) all.push(...s.records);
    return { ok: true, records: all };
  }
  async *stream() {
    for (const s of this.seeded) {
      yield { entityKind: s.entityKind, records: s.records, isLastChunk: false };
    }
    yield { entityKind: '__end__', records: [], isLastChunk: true };
  }
  async getCheckpoint() { return undefined; }
  async checkpoint() { /* noop */ }
  async disconnect() { /* noop */ }
}

// ----------------------------------------------------------------------
// CONNECTOR FACTORY
// ----------------------------------------------------------------------
export class FinanceConnectorFactory {
  private readonly providers: Map<FinanceSourceType, (sourceId: string, config?: Record<string, unknown>) => FinanceConnector> = new Map();

  register(sourceType: FinanceSourceType, factory: (sourceId: string, config?: Record<string, unknown>) => FinanceConnector) {
    this.providers.set(sourceType, factory);
  }

  build(source: FinanceSourceRecord): FinanceConnector {
    const factory = this.providers.get(source.sourceType);
    if (!factory) return new NullFinanceConnector(source.sourceId, source.sourceType);
    return factory(source.sourceId, source.configuration);
  }
}

export const financeConnectorFactory = new FinanceConnectorFactory();
