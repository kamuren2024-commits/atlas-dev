import crypto from 'crypto';

export interface AuditEventInput {
  eventId: string;
  tenantId: string;
  actorId: string;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  requestId: string;
  traceId: string;
  evidenceIds?: string[];
  legalBasisIds?: string[];
  policyDecisionId?: string;
}

export interface ChainedAuditEvent extends AuditEventInput {
  previousHash?: string;
  eventHash: string;
}

export class AuditIntegrityVerifier {
  public static hash(event: AuditEventInput, previousHash = ''): string {
    return crypto.createHash('sha256')
      .update(`${previousHash}${JSON.stringify(event)}`)
      .digest('hex');
  }

  public static verify(events: ChainedAuditEvent[]): { valid: boolean; failedEventId?: string } {
    let previousHash = '';
    for (const event of events) {
      if (event.previousHash !== (previousHash || undefined)) {
        return { valid: false, failedEventId: event.eventId };
      }
      const { previousHash: _ignored, eventHash, ...input } = event;
      if (this.hash(input, previousHash) !== eventHash) {
        return { valid: false, failedEventId: event.eventId };
      }
      previousHash = eventHash;
    }
    return { valid: true };
  }
}
