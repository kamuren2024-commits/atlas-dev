import crypto from 'crypto';

export type EventClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface EvaluationEventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  tenantId: string;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  actor: { id: string; type: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'CONNECTOR' };
  traceId: string;
  correlationId: string;
  causationId?: string;
  classification: EventClassification;
  payloadHash: string;
  payload: T;
}

export interface EventSchema {
  eventType: string;
  schemaVersion: number;
  producer: string;
  classification: EventClassification;
  retention: 'SHORT' | 'STANDARD' | 'LEGAL_HOLD';
  compatibility: 'BACKWARD' | 'FORWARD' | 'FULL';
  validate(payload: unknown): boolean;
}

const EVENT_TYPES = [
  'Tender.Created', 'Tender.Updated', 'Tender.Locked',
  'Bid.Created', 'Bid.Submitted', 'Bid.Versioned',
  'Evaluation.Created', 'Evaluation.Started', 'Evaluation.StageStarted', 'Evaluation.StageCompleted',
  'Committee.Created', 'Committee.MemberAssigned',
  'Requirement.Created', 'Requirement.Evaluated',
  'Score.Submitted', 'Score.Modified',
  'Evidence.Registered', 'Evidence.Verified', 'Evidence.ConflictDetected',
  'ExternalVerification.Requested', 'ExternalVerification.Completed', 'ExternalVerification.Failed',
  'Approval.Requested', 'Approval.Granted', 'Approval.Rejected',
  'Decision.Created', 'Decision.Finalized',
  'Connector.InvocationRequested', 'Connector.InvocationCompleted', 'Connector.InvocationFailed',
  'MCP.ToolInvocationRequested', 'MCP.ToolInvocationCompleted', 'MCP.ToolInvocationDenied'
] as const;

export class EventSchemaRegistry {
  private readonly schemas = new Map<string, EventSchema>();

  public register(schema: EventSchema): void {
    if (!EVENT_TYPES.includes(schema.eventType as typeof EVENT_TYPES[number])) {
      throw new Error(`Unknown Evaluation OS event type: ${schema.eventType}`);
    }
    if (schema.schemaVersion < 1 || !schema.producer || !schema.validate) {
      throw new Error(`Incomplete event schema declaration: ${schema.eventType}`);
    }
    this.schemas.set(`${schema.eventType}:v${schema.schemaVersion}`, schema);
  }

  public get(eventType: string, version: number): EventSchema {
    const schema = this.schemas.get(`${eventType}:v${version}`);
    if (!schema) throw new Error(`Unsupported event schema: ${eventType} v${version}`);
    return schema;
  }

  public validate<T>(event: EvaluationEventEnvelope<T>): void {
    const schema = this.get(event.eventType, event.eventVersion);
    if (event.payloadHash !== this.hash(event.payload)) throw new Error('EVENT_PAYLOAD_INTEGRITY_FAILURE');
    if (event.tenantId.length === 0 || !schema.validate(event.payload)) {
      throw new Error('EVENT_SCHEMA_VALIDATION_FAILURE');
    }
  }

  public static createDefault(): EventSchemaRegistry {
    const registry = new EventSchemaRegistry();
    for (const eventType of EVENT_TYPES) {
      registry.register({
        eventType,
        schemaVersion: 1,
        producer: 'evaluation-os',
        classification: 'CONFIDENTIAL',
        retention: 'STANDARD',
        compatibility: 'BACKWARD',
        validate: payload => typeof payload === 'object' && payload !== null
      });
    }
    return registry;
  }

  private hash(payload: unknown): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}

export function createEvaluationEvent<T>(
  input: Omit<EvaluationEventEnvelope<T>, 'eventId' | 'occurredAt' | 'payloadHash'>
): EvaluationEventEnvelope<T> {
  return {
    ...input,
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    payloadHash: crypto.createHash('sha256').update(JSON.stringify(input.payload)).digest('hex')
  };
}
