import { ConnectorInvocationContext, ConnectorResult } from '../types';

export interface PpraProvider {
  fetchPublicTenderInformation(
    context: ConnectorInvocationContext,
    reference: string
  ): Promise<ConnectorResult<unknown>>;
  fetchStandardTenderDocuments(
    context: ConnectorInvocationContext,
    reference: string
  ): Promise<ConnectorResult<unknown>>;
  fetchCirculars(
    context: ConnectorInvocationContext,
    since?: string
  ): Promise<ConnectorResult<unknown>>;
  fetchProcurementDecisions(
    context: ConnectorInvocationContext,
    reference?: string
  ): Promise<ConnectorResult<unknown>>;
}

export class NotConfiguredPpraProvider implements PpraProvider {
  async fetchPublicTenderInformation(context: ConnectorInvocationContext, reference: string) {
    return this.notConfigured(context, reference);
  }
  async fetchStandardTenderDocuments(context: ConnectorInvocationContext, reference: string) {
    return this.notConfigured(context, reference);
  }
  async fetchCirculars(context: ConnectorInvocationContext, since?: string) {
    return this.notConfigured(context, since);
  }
  async fetchProcurementDecisions(context: ConnectorInvocationContext, reference?: string) {
    return this.notConfigured(context, reference);
  }
  private notConfigured(context: ConnectorInvocationContext, query?: string): ConnectorResult<unknown> {
    return {
      status: 'NOT_CONFIGURED',
      retrievedAt: new Date().toISOString(),
      sourceRecord: query,
      provenance: {
        connectorId: 'ppra',
        provider: 'PPRA',
        authorization: context.requiredScope,
        classification: 'PUBLIC'
      },
      error: 'No officially permitted PPRA interface is configured; authenticated systems are not scraped.'
    };
  }
}
