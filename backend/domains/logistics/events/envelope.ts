/**
 * Logistics Intelligence - Event Fabric
 * Phase 03: Event normalization, enrichment, and streaming
 * Generated: Phase 03 Implementation (FOUNDATION)
 * Status: FOUNDATION_ONLY
 *
 * This module implements the event fabric for logistics operations,
 * providing normalized event ingestion, quality assurance, and streaming.
 */

// ============================================================================
// EVENT ENVELOPE STRUCTURE
// ============================================================================

export interface EventEnvelope {
  // Identification
  eventId: string;
  correlationId: string;
  causationId?: string;

  // Classification
  eventType: string;
  eventCategory: string;
  eventSeverity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  domain: 'logistics';

  // Source & target
  sourceEntityType: string;
  sourceEntityId: string;
  sourceSystem: string;
  sourceTimestamp: Date;

  targetEntityType?: string;
  targetEntityId?: string;

  // Payload
  payload: Record<string, any>;
  metadata: Record<string, any>;

  // Quality assurance
  dataQuality: {
    completenessPercent: number;
    isValid: boolean;
    validationErrors?: string[];
    enrichmentLevel: 'RAW' | 'NORMALIZED' | 'ENRICHED' | 'CONTEXTUALIZED';
  };

  // Audit trail
  receivedAt: Date;
  processedAt?: Date;
  archivedAt?: Date;
}

// ============================================================================
// EVENT TYPE DEFINITIONS
// ============================================================================

export enum EventTypePrefix {
  FACILITY = 'FACILITY',
  VEHICLE = 'VEHICLE',
  STOCK = 'STOCK',
  ORDER = 'ORDER',
  MOVEMENT = 'MOVEMENT',
  DRIVER = 'DRIVER',
  ROUTE = 'ROUTE',
  CONSTRAINT = 'CONSTRAINT',
  SYSTEM = 'SYSTEM',
}

export interface EventTypeDefinition {
  type: string;
  category: 'OPERATIONAL' | 'QUALITY' | 'EXCEPTION' | 'COMPLIANCE' | 'SAFETY' | 'PERFORMANCE';
  requiredFields: string[];
  optionalFields: string[];
  expectedFrequency: 'REALTIME' | 'BATCH' | 'SCHEDULED' | 'ADHOC';
  retentionDays: number;
  skipNormalization?: boolean;
}

// ============================================================================
// EVENT PIPELINE STAGES
// ============================================================================

export enum PipelineStage {
  RECEIVED = 'RECEIVED',
  VALIDATED = 'VALIDATED',
  NORMALIZED = 'NORMALIZED',
  ENRICHED = 'ENRICHED',
  CONTEXTUALIZED = 'CONTEXTUALIZED',
  DISTRIBUTED = 'DISTRIBUTED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface PipelineMetrics {
  stage: PipelineStage;
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTimeMs: number;
  successRate: number;
  lastUpdate: Date;
}

// ============================================================================
// EVENT QUALITY RULES
// ============================================================================

export interface QualityRule {
  ruleId: string;
  name: string;
  eventType?: string;
  condition: (envelope: EventEnvelope) => boolean;
  severity: 'WARNING' | 'ERROR';
  remediation?: (envelope: EventEnvelope) => EventEnvelope;
}

export const CORE_QUALITY_RULES: QualityRule[] = [
  {
    ruleId: 'qr_001',
    name: 'Event has valid ID',
    condition: (e) => !!e.eventId && e.eventId.length > 0,
    severity: 'ERROR',
  },
  {
    ruleId: 'qr_002',
    name: 'Event has valid timestamp',
    condition: (e) => e.sourceTimestamp instanceof Date && e.sourceTimestamp <= new Date(),
    severity: 'ERROR',
  },
  {
    ruleId: 'qr_003',
    name: 'Event source is identified',
    condition: (e) => !!e.sourceEntityType && !!e.sourceEntityId,
    severity: 'ERROR',
  },
  {
    ruleId: 'qr_004',
    name: 'Event payload is not empty',
    condition: (e) => Object.keys(e.payload).length > 0,
    severity: 'WARNING',
  },
  {
    ruleId: 'qr_005',
    name: 'Event timestamp not in future',
    condition: (e) => e.sourceTimestamp.getTime() <= new Date().getTime() + 60000,
    severity: 'WARNING',
  },
];

// ============================================================================
// EVENT ENRICHMENT
// ============================================================================

export interface EnrichmentContext {
  event: EventEnvelope;
  relatedEntities?: Record<string, any>;
  historicalData?: Record<string, any>;
  systemState?: Record<string, any>;
}

export interface Enrichment {
  field: string;
  value: any;
  source: string;
  confidence: number;
  appliedAt: Date;
}

// ============================================================================
// EVENT DEDUPLICATION
// ============================================================================

export interface DeduplicationStrategy {
  field: string;
  timeWindowSeconds: number;
  windowType: 'SLIDING' | 'TUMBLING';
}

export const DEDUPLICATION_WINDOWS = {
  VEHICLE_LOCATION: {
    field: 'sourceEntityId',
    timeWindowSeconds: 30,
    windowType: 'SLIDING',
  },
  STOCK_ADJUSTMENT: {
    field: 'sourceEntityId',
    timeWindowSeconds: 60,
    windowType: 'TUMBLING',
  },
  ORDER_STATUS: {
    field: 'sourceEntityId',
    timeWindowSeconds: 5,
    windowType: 'SLIDING',
  },
};

// ============================================================================
// EVENT FILTERING & ROUTING
// ============================================================================

export interface EventFilter {
  id: string;
  name: string;
  predicate: (envelope: EventEnvelope) => boolean;
  priority: number;
  enabled: boolean;
}

export interface EventRoute {
  id: string;
  name: string;
  filter: EventFilter;
  destination: 'CACHE' | 'DATABASE' | 'STREAM' | 'WEBHOOK' | 'DEAD_LETTER';
  transformations?: Array<(envelope: EventEnvelope) => EventEnvelope>;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
  exponentialBase: number;
}

// ============================================================================
// EVENT SOURCING
// ============================================================================

export interface EventStore {
  get(eventId: string): Promise<EventEnvelope | null>;
  append(envelope: EventEnvelope): Promise<void>;
  query(filter: EventStoreQuery): Promise<EventEnvelope[]>;
  getEventStream(
    entityId: string,
    entityType: string,
    fromSequence?: number
  ): Promise<EventEnvelope[]>;
}

export interface EventStoreQuery {
  eventType?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  fromTimestamp?: Date;
  toTimestamp?: Date;
  limit?: number;
  offset?: number;
}

// ============================================================================
// EVENT SUBSCRIPTIONS
// ============================================================================

export interface EventSubscription {
  subscriptionId: string;
  name: string;
  eventFilter: (envelope: EventEnvelope) => boolean;
  handler: (envelope: EventEnvelope) => Promise<void>;
  retryPolicy?: RetryPolicy;
  deadLetterRoute?: string;
  isActive: boolean;
}

export interface SubscriptionMetrics {
  subscriptionId: string;
  totalReceived: number;
  totalProcessed: number;
  totalFailed: number;
  averageLatencyMs: number;
  lastProcessed: Date;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchProcessingConfig {
  batchSize: number;
  batchTimeoutMs: number;
  parallelism: number;
  errorHandling: 'STOP_ON_ERROR' | 'CONTINUE_ON_ERROR' | 'PARTIAL_SUCCESS';
}

export interface BatchResult {
  totalEvents: number;
  successCount: number;
  failureCount: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  errors: Array<{ eventId: string; error: string }>;
}

// ============================================================================
// EVENT SCHEMA REGISTRY
// ============================================================================

export interface EventSchema {
  eventType: string;
  version: number;
  schema: Record<string, any>;
  requiredFields: string[];
  validationRules?: Record<string, any>;
}

// ============================================================================
// EVENT FABRIC INTERFACE
// ============================================================================

export interface IEventFabric {
  // Core operations
  publishEvent(envelope: EventEnvelope): Promise<void>;
  getEvent(eventId: string): Promise<EventEnvelope | null>;
  queryEvents(query: EventStoreQuery): Promise<EventEnvelope[]>;

  // Subscriptions
  subscribe(subscription: EventSubscription): Promise<void>;
  unsubscribe(subscriptionId: string): Promise<void>;
  getSubscriptionMetrics(subscriptionId: string): Promise<SubscriptionMetrics>;

  // Schema management
  registerSchema(schema: EventSchema): Promise<void>;
  validateEvent(envelope: EventEnvelope): Promise<{ valid: boolean; errors: string[] }>;

  // Quality & routing
  enrichEvent(envelope: EventEnvelope, context: EnrichmentContext): Promise<EventEnvelope>;
  deduplicateEvent(envelope: EventEnvelope): Promise<EventEnvelope | null>;
  routeEvent(envelope: EventEnvelope): Promise<EventRoute>;

  // Batch operations
  processBatch(
    events: EventEnvelope[],
    config: BatchProcessingConfig
  ): Promise<BatchResult>;

  // Pipeline monitoring
  getPipelineMetrics(stage?: PipelineStage): Promise<PipelineMetrics[]>;
  getHealthStatus(): Promise<{ healthy: boolean; issues: string[] }>;
}

// ============================================================================
// COMMON EVENT PATTERNS
// ============================================================================

export const COMMON_EVENT_PATTERNS = {
  STATE_TRANSITION: {
    type: 'STATE_TRANSITION',
    requiredFields: ['entityId', 'entityType', 'fromState', 'toState', 'reason'],
  },

  OPERATIONAL_MILESTONE: {
    type: 'OPERATIONAL_MILESTONE',
    requiredFields: ['entityId', 'milestone', 'timestamp'],
  },

  ANOMALY_DETECTED: {
    type: 'ANOMALY_DETECTED',
    requiredFields: ['entityId', 'anomalyType', 'severity', 'description'],
  },

  DATA_SYNC: {
    type: 'DATA_SYNC',
    requiredFields: ['source', 'target', 'recordCount', 'timestamp'],
  },

  KPI_UPDATE: {
    type: 'KPI_UPDATE',
    requiredFields: ['kpiName', 'value', 'target', 'variance'],
  },
};

// ============================================================================
// DEAD LETTER HANDLING
// ============================================================================

export interface DeadLetterEvent {
  originalEvent: EventEnvelope;
  failureReason: string;
  failureCount: number;
  lastAttempt: Date;
  nextRetry?: Date;
}

export interface DeadLetterQueue {
  push(event: DeadLetterEvent): Promise<void>;
  peek(count: number): Promise<DeadLetterEvent[]>;
  retry(eventId: string): Promise<void>;
  abandon(eventId: string): Promise<void>;
  getStats(): Promise<{ queueSize: number; oldestAge: number }>;
}
