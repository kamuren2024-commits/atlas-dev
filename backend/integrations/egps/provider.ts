import { ConnectorInvocationContext, ConnectorResult } from '../types';

export interface EgpsProvider {
  getTender(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  getTenderStatus(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  getProcurementMethod(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  getBidInformation(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  getProcurementEvent(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  getProcurementReport(context: ConnectorInvocationContext, tenderId: string): Promise<ConnectorResult<unknown>>;
  submitRequiredReport(context: ConnectorInvocationContext, report: unknown): Promise<ConnectorResult<unknown>>;
}

export class NotConfiguredEgpsProvider implements EgpsProvider {
  private unavailable<T>(): Promise<ConnectorResult<T>> {
    return Promise.resolve({
      status: 'NOT_CONFIGURED',
      retrievedAt: new Date().toISOString(),
      provenance: {
        connectorId: 'egps',
        provider: 'E-GPS',
        authorization: 'NOT_CONFIGURED',
        classification: 'RESTRICTED'
      },
      error: 'No authorized E-GPS endpoint or credentials are configured.'
    });
  }

  getTender(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getTenderStatus(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getProcurementMethod(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getBidInformation(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getProcurementEvent(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  getProcurementReport(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
  submitRequiredReport(): Promise<ConnectorResult<unknown>> { return this.unavailable(); }
}
