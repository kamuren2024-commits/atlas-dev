export type ConnectorResultStatus =
  | 'SUCCESS'
  | 'NOT_CONFIGURED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'TEMPORARILY_UNAVAILABLE';

export interface ConnectorInvocationContext {
  requestId: string;
  actorId: string;
  tenantId: string;
  purpose: string;
  requiredScope: string;
  traceId: string;
}

export interface ConnectorResult<T> {
  status: ConnectorResultStatus;
  data?: T;
  sourceRecord?: string;
  responseHash?: string;
  retrievedAt: string;
  provenance: {
    connectorId: string;
    provider: string;
    authorization: string;
    classification: string;
  };
  error?: string;
}

export interface GovernmentConnector<T> {
  readonly connectorId: string;
  readonly provider: string;
  getPublicInformation(
    context: ConnectorInvocationContext,
    query: T
  ): Promise<ConnectorResult<unknown>>;
}
