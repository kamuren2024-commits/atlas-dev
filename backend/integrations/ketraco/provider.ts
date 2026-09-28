import { ConnectorInvocationContext, ConnectorResult } from '../types';

export interface KetracoPublicProvider {
  discoverTenders(context: ConnectorInvocationContext): Promise<ConnectorResult<unknown>>;
  getTenderDetails(context: ConnectorInvocationContext, reference: string): Promise<ConnectorResult<unknown>>;
  getAddenda(context: ConnectorInvocationContext, reference: string): Promise<ConnectorResult<unknown>>;
  getTenderDocuments(context: ConnectorInvocationContext, reference: string): Promise<ConnectorResult<unknown>>;
}

export interface SapAribaProvider extends KetracoPublicProvider {
  readonly authentication: 'OAUTH2' | 'CERTIFICATE';
}

export class NotConfiguredKetracoProvider implements KetracoPublicProvider {
  private unavailable<T>(): Promise<ConnectorResult<T>> {
    return Promise.resolve({
      status: 'NOT_CONFIGURED',
      retrievedAt: new Date().toISOString(),
      provenance: {
        connectorId: 'ketraco-public',
        provider: 'KETRACO',
        authorization: 'NOT_CONFIGURED',
        classification: 'PUBLIC'
      },
      error: 'KETRACO public source is not configured.'
    });
  }

  discoverTenders(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getTenderDetails(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getAddenda(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getTenderDocuments(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
}
