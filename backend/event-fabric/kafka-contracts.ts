import { EvaluationEventEnvelope, EventSchemaRegistry } from './phase3-events';

export interface EventPublisher {
  publish(event: EvaluationEventEnvelope): Promise<void>;
}

export interface EventConsumer {
  consume(group: EventConsumerGroup, handler: (event: EvaluationEventEnvelope) => Promise<void>): Promise<void>;
}

export interface EventConsumerGroup {
  groupId: string;
  topics: string[];
  tenantAllowList?: string[];
}

export interface DeadLetterRecord {
  eventId: string;
  eventType: string;
  consumer: string;
  attemptCount: number;
  firstFailure: string;
  lastFailure: string;
  errorCode: string;
  errorMessage: string;
  traceId: string;
  payloadHash: string;
}

export interface DeadLetterPublisher {
  publish(record: DeadLetterRecord): Promise<void>;
}

export interface KafkaClientConfig {
  brokers: string[];
  clientId: string;
  topicPrefix: string;
}

export class KafkaCompatibleEventPublisher implements EventPublisher {
  constructor(
    private readonly config: KafkaClientConfig,
    private readonly registry: EventSchemaRegistry,
    private readonly send: (topic: string, value: string) => Promise<void>
  ) {}

  public async publish(event: EvaluationEventEnvelope): Promise<void> {
    this.registry.validate(event);
    if (!this.config.brokers.length) throw new Error('EVENT_FABRIC_NOT_CONFIGURED');
    const topic = `${this.config.topicPrefix}.domain`;
    await this.send(topic, JSON.stringify(event));
  }
}
