import crypto from 'crypto';

export type ExternalVerificationStatus =
  | 'REQUESTED'
  | 'AUTHORIZED'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'NOT_VERIFIED'
  | 'CONFLICT'
  | 'EXPIRED'
  | 'UNAVAILABLE'
  | 'REVOKED';

export interface ExternalVerification {
  id: string;
  subjectType: 'SUPPLIER' | 'TENDER' | 'DOCUMENT';
  subjectId: string;
  source: string;
  status: ExternalVerificationStatus;
  retrievedAt?: string;
  expiresAt?: string;
  responseHash?: string;
  legalBasis: string;
  confidence?: number;
  provenance: {
    requestId: string;
    actorId: string;
    tenantId: string;
    authorization: string;
  };
}

export class ExternalVerificationService {
  public create(
    input: Omit<ExternalVerification, 'id' | 'status'>
  ): ExternalVerification {
    return {
      ...input,
      id: crypto.randomUUID(),
      status: 'REQUESTED'
    };
  }

  public transition(
    verification: ExternalVerification,
    nextStatus: ExternalVerificationStatus,
    response?: { body: unknown; retrievedAt: string; expiresAt?: string; confidence?: number }
  ): ExternalVerification {
    if (nextStatus === 'VERIFIED' && !response) {
      throw new Error('A verified external result requires a validated response and provenance.');
    }
    if (nextStatus === 'VERIFIED' && verification.provenance.authorization === 'NOT_CONFIGURED') {
      throw new Error('An unconfigured connector cannot produce a verified result.');
    }
    if (nextStatus === 'VERIFIED' && response) {
      return {
        ...verification,
        status: nextStatus,
        retrievedAt: response.retrievedAt,
        expiresAt: response.expiresAt,
        confidence: response.confidence,
        responseHash: crypto.createHash('sha256').update(JSON.stringify(response.body)).digest('hex')
      };
    }
    return { ...verification, status: nextStatus };
  }
}
