export type LogisticsSourceStatus =
  | 'WAITING_FOR_KETRACO_DATA'
  | 'SIMULATED_KETRACO_ALIGNED_DEMO'
  | 'CONNECTED_PROVIDER'
  | 'HYBRID_DATA';

export interface LogisticsSourceDescriptor {
  providerName: string;
  sourceType: 'IMPORTED' | 'REFERENCE' | 'SAP' | 'ARIBA' | 'GIS' | 'FLEET' | 'WAREHOUSE' | 'SYNTHETIC' | 'HYBRID' | 'UNAVAILABLE';
  status: LogisticsSourceStatus;
  label: string;
  isConnected: boolean;
  isLive: boolean;
  description: string;
}

export interface LogisticsProviderContract {
  getSourceDescriptor(): LogisticsSourceDescriptor;
  getSourceStatus(): LogisticsSourceStatus;
}

export abstract class BaseLogisticsProvider implements LogisticsProviderContract {
  protected providerName: string;
  protected sourceType: LogisticsSourceDescriptor['sourceType'];
  protected status: LogisticsSourceStatus;
  protected label: string;
  protected description: string;
  protected isConnected: boolean;
  protected isLive: boolean;

  constructor(
    providerName: string,
    sourceType: LogisticsSourceDescriptor['sourceType'],
    status: LogisticsSourceStatus,
    label: string,
    description: string,
    isConnected = false,
    isLive = false
  ) {
    this.providerName = providerName;
    this.sourceType = sourceType;
    this.status = status;
    this.label = label;
    this.description = description;
    this.isConnected = isConnected;
    this.isLive = isLive;
  }

  public getSourceStatus(): LogisticsSourceStatus {
    return this.status;
  }

  public getSourceDescriptor(): LogisticsSourceDescriptor {
    return {
      providerName: this.providerName,
      sourceType: this.sourceType,
      status: this.status,
      label: this.label,
      isConnected: this.isConnected,
      isLive: this.isLive,
      description: this.description,
    };
  }
}

export class KetracoImportedProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'KetracoImportedProvider',
      'IMPORTED',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'Import connector contract is defined but has not yet received an authoritative KETRACO dataset.',
      false,
      false
    );
  }
}

export class KetracoReferenceProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'KetracoReferenceProvider',
      'REFERENCE',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'Reference dataset contract exists; production source wiring is pending explicit KETRACO operational feeds.',
      false,
      false
    );
  }
}

export class SAPIntegrationProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'SAPIntegrationProvider',
      'SAP',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'SAP integration contract is defined but not yet connected to a live KETRACO SAP environment.',
      false,
      false
    );
  }
}

export class AribaIntegrationProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'AribaIntegrationProvider',
      'ARIBA',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'Ariba connector contract is defined but no authoritative KETRACO procurement feed is connected.',
      false,
      false
    );
  }
}

export class GISProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'GISProvider',
      'GIS',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'GIS route and asset data contract is present, but the live authoritative source is not yet configured.',
      false,
      false
    );
  }
}

export class FleetTelemetryProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'FleetTelemetryProvider',
      'FLEET',
      'SIMULATED_KETRACO_ALIGNED_DEMO',
      'SIMULATED / KETRACO-ALIGNED DEMONSTRATION DATA',
      'Telemetry contract exists for demo and validation flows; it is not connected to a live production fleet feed.',
      false,
      false
    );
  }
}

export class WarehouseProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'WarehouseProvider',
      'WAREHOUSE',
      'SIMULATED_KETRACO_ALIGNED_DEMO',
      'SIMULATED / KETRACO-ALIGNED DEMONSTRATION DATA',
      'Warehouse stock and movement data is represented in the domain model for demo scenarios and orchestration testing.',
      false,
      false
    );
  }
}

export class SyntheticDemoProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'SyntheticDemoProvider',
      'SYNTHETIC',
      'SIMULATED_KETRACO_ALIGNED_DEMO',
      'SIMULATED / KETRACO-ALIGNED DEMONSTRATION DATA',
      'Synthetic KETRACO-aligned logistics data is used for demonstration and workflow validation only.',
      false,
      false
    );
  }
}

export class HybridProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'HybridProvider',
      'HYBRID',
      'HYBRID_DATA',
      'HYBRID DATA',
      'Provider is ready for hybrid operation but still requires real source wiring before any live KETRACO claim is valid.',
      false,
      false
    );
  }
}

export class UnavailableProvider extends BaseLogisticsProvider {
  constructor() {
    super(
      'UnavailableProvider',
      'UNAVAILABLE',
      'WAITING_FOR_KETRACO_DATA',
      'WAITING FOR KETRACO DATA',
      'No authoritative KETRACO source is currently configured for this logistics data surface.',
      false,
      false
    );
  }
}
