import { v4 as uuidv4 } from 'uuid';
import { AuditLedger } from '../ai-federation/compliance/audit-ledger';

export type ConnectorStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';
export type ConnectorHealth = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
export type ConnectorEnvironment = 'PRODUCTION' | 'STAGING' | 'SANDBOX' | 'DEVELOPMENT';

export interface ConnectorConfig {
  id: string;
  provider: string;
  name: string;
  type: 'ERP' | 'FINANCE' | 'DMS' | 'IDP' | 'CMS' | 'WORKFLOW' | 'NOTIFICATION' | 'DATA_WAREHOUSE' | 'GOV_API';
  status: ConnectorStatus;
  health: ConnectorHealth;
  version: string;
  environment: ConnectorEnvironment;
  authentication: {
    type: 'OAUTH2' | 'API_KEY' | 'MTLS' | 'BASIC';
    configured: boolean;
  };
  rateLimits: {
    limit: number;
    window: string;
    currentUsage: number;
  };
  capabilities: string[];
  lastSync: string;
}

export interface ConnectorAuditRecord {
  timestamp: string;
  action: 'ENABLE' | 'DISABLE' | 'TEST' | 'RETRY' | 'ROLLBACK' | 'SYNC' | 'AUTHENTICATE';
  status: 'SUCCESS' | 'FAILURE';
  officer: string;
  details: string;
  version: string;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected auditHistory: ConnectorAuditRecord[] = [];

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  public getConfig(): ConnectorConfig {
    return { ...this.config };
  }

  public getAuditHistory(): ConnectorAuditRecord[] {
    return [...this.auditHistory];
  }

  protected async logAudit(action: ConnectorAuditRecord['action'], status: ConnectorAuditRecord['status'], details: string, officer: string = 'SYSTEM') {
    const record: ConnectorAuditRecord = {
      timestamp: new Date().toISOString(),
      action,
      status,
      details,
      officer,
      version: this.config.version
    };
    this.auditHistory.unshift(record);
    
    // Also log to enterprise audit ledger
    await AuditLedger.log({
      module: 'INTEGRATION_HUB',
      action: `CONNECTOR_${action}`,
      status: status === 'SUCCESS' ? 'success' : 'failure',
      details: `[${this.config.id}] ${details}`,
      metadata: { connectorId: this.config.id, provider: this.config.provider }
    });
  }

  abstract test(): Promise<{ success: boolean; message: string; latency?: number }>;
  abstract sync(): Promise<{ success: boolean; recordsProcessed: number }>;
  
  public async enable(officer: string): Promise<void> {
    this.config.status = 'ACTIVE';
    await this.logAudit('ENABLE', 'SUCCESS', 'Connector manually enabled', officer);
  }

  public async disable(officer: string): Promise<void> {
    this.config.status = 'INACTIVE';
    await this.logAudit('DISABLE', 'SUCCESS', 'Connector manually disabled', officer);
  }

  public async retry(): Promise<{ success: boolean }> {
    await this.logAudit('RETRY', 'SUCCESS', 'Manual retry triggered', 'SYSTEM');
    const result = await this.test();
    if (result.success) {
      this.config.health = 'HEALTHY';
    }
    return { success: result.success };
  }
}

export class ConnectorRegistry {
  private static connectors: Map<string, BaseConnector> = new Map();

  public static register(connector: BaseConnector) {
    this.connectors.set(connector.getConfig().id, connector);
  }

  public static getConnector(id: string): BaseConnector | undefined {
    return this.connectors.get(id);
  }

  public static listConnectors(): ConnectorConfig[] {
    return Array.from(this.connectors.values()).map(c => c.getConfig());
  }
}
